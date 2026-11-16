import type { Language } from '../../types';
import type { FormAttachmentMeta } from '../../types/firestore-schema';

export type CustomerFormType =
  | 'general_contact'
  | 'property_inquiry'
  | 'list_property'
  | 'valuation_request'
  | 'book_viewing'
  | 'project_inquiry'
  | 'construction_quote'
  | 'hvac_service'
  | 'newsletter_signup';

export type SectorId = 'realestate' | 'construction' | 'hvac' | 'group';

export interface FormSubmissionPayload {
  formType: CustomerFormType;
  sector: SectorId;
  name: string;
  email: string;
  phone?: string;
  preferredContactMethod?: 'whatsapp' | 'phone' | 'email';
  entityId?: string | null;
  entityTitle?: string | null;
  language?: Language;
  message?: string;
  details?: Record<string, any>;
  attachments?: FormAttachmentMeta[];
  idempotencyKey?: string;
}

export interface FormSubmissionResult {
  success: boolean;
  leadId: string;
  trackingCode: string;
  isDuplicate?: boolean;
  message?: string;
}

export class FormValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.name = 'FormValidationError';
    this.fieldErrors = fieldErrors;
  }
}

const IDEMPOTENCY_STORAGE_KEY = 'hard_submitted_form_keys_v2';

function getLocalIdempotencyCache(): Record<string, { leadId: string; trackingCode: string; timestamp: number }> {
  try {
    const raw = localStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveLocalIdempotencyCache(
  key: string,
  data: { leadId: string; trackingCode: string }
) {
  try {
    const cache = getLocalIdempotencyCache();
    cache[key] = { ...data, timestamp: Date.now() };
    localStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save idempotency cache to localStorage', e);
  }
}

/**
 * Generates a deterministic idempotency key string from payload values
 */
export function generateIdempotencyKey(payload: FormSubmissionPayload): string {
  if (payload.idempotencyKey) return payload.idempotencyKey;

  const rawString = [
    payload.formType,
    payload.sector,
    payload.email.trim().toLowerCase(),
    (payload.phone || '').replace(/\D/g, ''),
    payload.entityId || '',
    (payload.message || '').slice(0, 30),
  ].join('|');

  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `idem_${Math.abs(hash)}_${payload.formType}`;
}

/**
 * Validates payload on server/backend logic layer before Firestore write
 */
export function validateFormPayload(
  payload: FormSubmissionPayload,
  language: Language = 'ar'
): Record<string, string> {
  const errors: Record<string, string> = {};
  const isAr = language === 'ar';

  const emailTrimmed = payload.email ? payload.email.trim() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailTrimmed) {
    errors.email = isAr ? 'يرجى إدخال البريد الإلكتروني.' : 'Email address is required.';
  } else if (!emailRegex.test(emailTrimmed)) {
    errors.email = isAr
      ? 'يرجى إدخال عنوان بريد إلكتروني صحيح (مثال: name@domain.com).'
      : 'Please enter a valid email address.';
  }

  if (payload.formType === 'newsletter_signup') {
    return errors;
  }

  const nameTrimmed = payload.name ? payload.name.trim() : '';
  if (!nameTrimmed || nameTrimmed.length < 2) {
    errors.name = isAr
      ? 'يرجى إدخال الاسم الكامل (حرفين على الأقل).'
      : 'Full name is required (at least 2 characters).';
  }

  const phoneTrimmed = payload.phone ? payload.phone.trim().replace(/\s+/g, '') : '';
  const phoneDigits = phoneTrimmed.replace(/\D/g, '');
  if (!phoneTrimmed) {
    errors.phone = isAr ? 'يرجى إدخال رقم الهاتف/الواتساب.' : 'Phone number is required.';
  } else if (phoneDigits.length < 7) {
    errors.phone = isAr
      ? 'رقم الهاتف يجب أن يحتوي على 7 أرقام على الأقل.'
      : 'Phone number must contain at least 7 digits.';
  }

  return errors;
}

/**
 * Robust retry helper with exponential backoff for synchronous database writes
 */
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delayMs = 600): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return retryOperation(operation, retries - 1, delayMs * 2);
  }
}

export async function submitCustomerForm(
  payload: FormSubmissionPayload
): Promise<FormSubmissionResult> {
  const lang = payload.language || 'ar';
  const isAr = lang === 'ar';

  // 1. SERVER/BACKEND VALIDATION
  const fieldErrors = validateFormPayload(payload, lang);
  if (Object.keys(fieldErrors).length > 0) {
    throw new FormValidationError(
      isAr ? 'يرجى تصحيح الأخطاء الموضحة أدناه.' : 'Please fix the validation errors below.',
      fieldErrors
    );
  }

  // 2. IDEMPOTENCY & DUPLICATE PREVENTION
  const idempotencyKey = generateIdempotencyKey(payload);

  const localCache = getLocalIdempotencyCache();
  const cached = localCache[idempotencyKey];
  if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
    return {
      success: true,
      leadId: cached.leadId,
      trackingCode: cached.trackingCode,
      isDuplicate: true,
      message: isAr
        ? 'تم استلام هذا الطلب سابقاً وإدراجه في النظام بنجاح.'
        : 'This request was previously submitted and processed successfully.',
    };
  }

  const activeSchemaVersion = '1.0.0';

  const prefixMap: Record<CustomerFormType, string> = {
    general_contact: 'CNT',
    property_inquiry: 'INQ',
    list_property: 'LST',
    valuation_request: 'VAL',
    book_viewing: 'VIEW',
    project_inquiry: 'PRJ',
    construction_quote: 'CST',
    hvac_service: 'HVAC',
    newsletter_signup: 'SUB',
  };

  const trackingPrefix = prefixMap[payload.formType];
  const trackingCode = `${trackingPrefix}-${new Date().getUTCFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const leadId = `lead-${Date.now()}-${crypto.randomUUID().replace(/-/g, '')}`;

  // Require confirmation from Supabase before accepting new submissions.
  try {
    await retryOperation(async () => {
      const response = await fetch('https://vlpdiyicmupghfcualoe.supabase.co/rest/v1/hard_form_submissions', {
        method: 'POST',
        headers: {
          apikey: 'sb_publishable_jam6dG2vyvPi65DHUEgqXQ_4YZfJGxF',
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id: leadId,
          tracking_code: trackingCode,
          form_type: payload.formType,
          sector: payload.sector,
          payload: {
            ...payload,
            email: payload.email.trim().toLowerCase(),
            schemaVersion: activeSchemaVersion,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        // A retry can follow a committed insert whose response was lost.
        if (response.status === 409 && error?.code === '23505') return;
        throw new Error(`Form intake returned HTTP ${response.status}`);
      }
    }, 3, 600);
  } catch (error) {
    throw new Error(
      isAr ? 'تعذر حفظ طلبك. يرجى المحاولة مرة أخرى.' : 'Your request could not be saved. Please try again.',
      { cause: error },
    );
  }

  saveLocalIdempotencyCache(idempotencyKey, { leadId, trackingCode });
  return { success: true, leadId, trackingCode, isDuplicate: false };
}
