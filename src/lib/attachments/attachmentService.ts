import type { FormAttachmentMeta } from '../../types/backend-schema';
import { hardPublishableKey, hardSupabaseUrl } from '../db/hardCatalog';

const endpoint = hardSupabaseUrl + '/functions/v1/hard-form-attachments';
const accepted = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export interface AttachmentConfig {
  maxCount: number;
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  required?: boolean;
}

export const DEFAULT_ATTACHMENT_CONFIG: AttachmentConfig = {
  maxCount: 5, maxSizeBytes: 10 * 1024 * 1024, allowedMimeTypes: accepted, required: false,
};

export const ALLOWED_EXTENSIONS_LABEL = 'JPG, PNG, WEBP, PDF (Max 10MB)';
export const ALLOWED_EXTENSIONS_LABEL_AR = 'JPG, PNG, WEBP, PDF (الحجم الأقصى 10 ميجابايت)';

export function validateAttachmentFile(file: File, config: Partial<AttachmentConfig> = {}, isAr = true): string | null {
  const merged = { ...DEFAULT_ATTACHMENT_CONFIG, ...config };
  const max = Math.min(merged.maxSizeBytes, DEFAULT_ATTACHMENT_CONFIG.maxSizeBytes);
  if (!file.size || file.size > max) {
    return isAr ? 'حجم المرفق خارج الحد المسموح.' : 'The attachment size is outside the allowed range.';
  }
  if (!accepted.includes(file.type) || !merged.allowedMimeTypes.includes(file.type)) {
    return isAr ? 'اختر صورة JPG أو PNG أو WEBP أو ملف PDF.' : 'Choose a JPG, PNG, WEBP, or PDF file.';
  }
  return null;
}

export async function uploadFormAttachment(
  file: File,
  options: { uploadSessionId?: string; config?: Partial<AttachmentConfig>; isAr?: boolean } = {},
): Promise<FormAttachmentMeta & { backend: 'supabase' }> {
  const isAr = options.isAr ?? true;
  const validationError = validateAttachmentFile(file, options.config, isAr);
  if (validationError) throw new Error(validationError);
  const timeout = AbortSignal.timeout(45000);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { apikey: hardPublishableKey, 'Content-Type': file.type, 'x-file-name': encodeURIComponent(file.name) },
    body: file,
    signal: timeout,
  }).catch((error) => {
    if (timeout.aborted) {
      throw new Error(isAr ? 'انتهت مهلة رفع المرفق. حاول مرة أخرى.' : 'The attachment upload timed out. Try again.');
    }
    throw error;
  });
  if (!response.ok) {
    throw new Error(response.status === 429
      ? (isAr ? 'تم بلوغ حد الرفع مؤقتًا. حاول لاحقًا.' : 'Upload limit reached. Try again later.')
      : (isAr ? 'تعذر رفع الملف.' : 'Unable to upload the attachment.'));
  }
  const data = await response.json();
  return {
    backend: 'supabase',
    id: data.id,
    storagePath: 'submissions/' + data.id,
    downloadToken: data.ticket,
    fileName: data.fileName,
    fileSizeBytes: data.fileSizeBytes,
    mimeType: data.mimeType,
    extension: file.name.split('.').pop()?.toLowerCase() || '',
    uploadedAt: new Date().toISOString(),
  };
}

export async function deleteAttachment(attachmentId: string, ticket?: string): Promise<void> {
  if (!ticket) return;
  const url = new URL(endpoint);
  url.searchParams.set('id', attachmentId);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { apikey: hardPublishableKey, 'x-file-name': ticket },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('تعذرت إزالة المرفق.');
}
