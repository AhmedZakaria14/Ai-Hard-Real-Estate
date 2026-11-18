import { hardPublishableKey, hardSupabaseUrl } from '../db/hardCatalog';
import type { Language } from '../../types';
import type { FormAttachmentMeta } from '../../types/backend-schema';
import { assertMediaReady } from '../mediaSaveGuard';

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
  schemaVersion?: string;
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

const pendingSubmissions = new Map<string, Promise<FormSubmissionResult>>();

function submissionKey(payload: FormSubmissionPayload): string {
  return JSON.stringify(payload, (_key, value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, value[key]]));
  });
}

/**
 * Validates the form payload before submitting it to Supabase
 */
export function validateFormPayload(
  payload: FormSubmissionPayload,
  language: Language = 'ar'
): Record<string, string> {
  const errors: Record<string, string> = {};
  const isAr = language === 'ar';

  const emailTrimmed = payload.email ? payload.email.trim() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isPropertyContact = payload.sector === 'realestate'
    && (payload.formType === 'property_inquiry' || payload.formType === 'book_viewing');
  const isProjectContact = payload.formType === 'project_inquiry' && payload.sector === 'realestate';
  const isBrochure = isProjectContact && payload.details?.requestType === 'brochure';
  const emailOptional = isPropertyContact || (isProjectContact && !isBrochure)
    || (payload.formType === 'hvac_service' && payload.sector === 'hvac');
  if (!emailTrimmed && !emailOptional) {
    errors.email = isAr ? 'يرجى إدخال البريد الإلكتروني.' : 'Email address is required.';
  } else if (emailTrimmed && (!emailRegex.test(emailTrimmed) || emailTrimmed.length > 254)) {
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

  const phoneTrimmed = payload.phone ? normalizePhone(payload.phone).trim().replace(/\s+/g, '') : '';
  const phoneDigits = phoneTrimmed.replace(/\D/g, '');
  if (!phoneTrimmed) {
    if (!isProjectContact || (!isBrochure && !emailTrimmed)) {
      errors.phone = isAr ? 'يرجى إدخال رقم الهاتف/الواتساب.' : 'Phone number is required.';
    }
  } else if (phoneDigits.length < 7) {
    errors.phone = isAr
      ? 'رقم الهاتف يجب أن يحتوي على 7 أرقام على الأقل.'
      : 'Phone number must contain at least 7 digits.';
  } else if (
    phoneDigits.length > 20 || /[^\d()+.-]/.test(phoneTrimmed)
  ) {
    errors.phone = isAr ? 'يرجى إدخال رقم هاتف صحيح.' : 'Please enter a valid phone number.';
  }

  return errors;
}

function normalizePhone(value: string) {
  return value.replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - 1776));
}

/**
 * Robust retry helper with exponential backoff for synchronous database writes
 */
class FormIntakeError extends Error {
  constructor(readonly status: number) {
    super(`Form intake returned HTTP ${status}`);
  }
}

async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delayMs = 600): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const permanent = error instanceof FormIntakeError
      && error.status < 500 && error.status !== 408 && error.status !== 429;
    if (retries <= 0 || permanent) throw error;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return retryOperation(operation, retries - 1, delayMs * 2);
  }
}

export async function submitCustomerForm(
  payload: FormSubmissionPayload
): Promise<FormSubmissionResult> {
  assertMediaReady();
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

  const normalizedPayload = { ...payload, email: payload.email.trim().toLowerCase(), phone: payload.phone ? normalizePhone(payload.phone) : undefined };
  if (new TextEncoder().encode(JSON.stringify({...normalizedPayload, schemaVersion: payload.schemaVersion ?? '1.0.0'})).length > 60000) {
    throw new FormValidationError(isAr ? 'بيانات الطلب تتجاوز الحجم المسموح. اختصر التفاصيل قليلًا ثم أعد الإرسال؛ لم تُحذف بياناتك.' : 'The request exceeds the allowed size. Shorten the details and retry; your entries are preserved.', {message: isAr ? 'الطلب طويل جدًا.' : 'Request is too long.'});
  }
  const key = submissionKey(normalizedPayload);
  const pending = pendingSubmissions.get(key);
  if (pending) return pending;

  const submission = saveSubmission(normalizedPayload, isAr);
  pendingSubmissions.set(key, submission);
  try {
    return await submission;
  } finally {
    pendingSubmissions.delete(key);
  }
}

async function saveSubmission(payload: FormSubmissionPayload, isAr: boolean): Promise<FormSubmissionResult> {
  const activeSchemaVersion = payload.schemaVersion ?? '1.0.0';

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
      const response = await fetch(`${hardSupabaseUrl}/rest/v1/hard_form_submissions`, {
        method: 'POST',
        headers: {
          apikey: hardPublishableKey,
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
            schemaVersion: activeSchemaVersion,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        // A retry can follow a committed insert whose response was lost.
        if (response.status === 409 && error?.code === '23505'
          && error.message?.includes('"hard_form_submissions_pkey"')) return;
        throw new FormIntakeError(response.status);
      }
    }, 3, 600);
  } catch (error) {
    throw new Error(
      isAr ? 'تعذر حفظ طلبك. يرجى المحاولة مرة أخرى.' : 'Your request could not be saved. Please try again.',
      { cause: error },
    );
  }

  return { success: true, leadId, trackingCode, isDuplicate: false };
}
