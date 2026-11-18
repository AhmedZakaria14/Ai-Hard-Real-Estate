import { hardAdminClient } from './db/hardAdminClient';
import { hardPublishableKey, hardSupabaseUrl } from './db/hardCatalog';
import type { LocalizedText, SectorId } from '../types/backend-schema';

export type AllowedMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'image/avif'
  | 'image/svg+xml'
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const APPROVED_FILE_TYPES: AllowedMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface MediaUsageReference {
  collectionName: string;
  documentId: string;
  documentTitle: string;
}

export interface MediaAssetDoc {
  id: string;
  fileName: string;
  storagePath: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  fileSizeBytes: number;
  contentType: AllowedMimeType | string;
  dimensions?: { width: number; height: number };
  altText: LocalizedText;
  caption?: LocalizedText;
  sector: SectorId;
  tags: string[];
  isPrivate: boolean;
  references: MediaUsageReference[];
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Validates if a file type and size are within approved CMS bounds.
 */
export function validateMediaUpload(file: File): { isValid: boolean; error?: string } {
  if (!file) return { isValid: false, error: 'No file provided' };

  if (!APPROVED_FILE_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      isValid: false,
      error: `File type '${file.type}' is not allowed. Approved types: JPG, PNG, WebP, GIF, AVIF, PDF, DOCX`,
    };
  }

  // 15MB limit
  const maxSizeBytes = 15 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: 'File size exceeds maximum allowed 15MB limit' };
  }

  return { isValid: true };
}

/**
 * Extracts image dimensions (width & height) from a file.
 */
async function loadImageFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      const timer = window.setTimeout(() => reject(new Error('تعذرت قراءة الصورة. اختر صورة أخرى.')), 15000);
      img.onload = () => { window.clearTimeout(timer); resolve(img); };
      img.onerror = () => { window.clearTimeout(timer); reject(new Error('الملف ليس صورة سليمة.')); };
      img.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number } | undefined> {
  if (!file.type.startsWith('image/')) return undefined;
  const image = await loadImageFile(file);
  return { width: image.naturalWidth, height: image.naturalHeight };
}

export async function prepareMediaFile(file: File): Promise<File> {
  if (!file.size || file.size > 15 * 1024 * 1024) throw new Error('حجم الملف يجب أن يكون بين 1 بايت و15 ميجابايت.');
  const extensions: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif', svg: 'image/svg+xml', pdf: 'application/pdf' };
  if (!file.type) file = new File([file], file.name, { type: extensions[file.name.split('.').pop()?.toLowerCase() || ''] || '' });
  if (file.type !== 'image/svg+xml') return file;
  // Rasterize vector logos before public upload; active SVG content is never hosted.
  const image = await loadImageFile(file);
  const canvas = document.createElement('canvas');
  const ratio = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('تعذرت معالجة الشعار.');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('تعذرت معالجة الشعار.')), 'image/png'));
  return new File([blob], file.name.replace(/\.svg$/i, '') + '.png', { type: 'image/png' });
}

function uploadStorageFile(file: File, bucket: string, path: string, token: string, progress?: (value: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', hardSupabaseUrl + '/storage/v1/object/' + bucket + '/' + path.split('/').map(encodeURIComponent).join('/'));
    request.timeout = 45000;
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    request.setRequestHeader('apikey', hardPublishableKey);
    request.setRequestHeader('Content-Type', file.type);
    request.setRequestHeader('x-upsert', 'false');
    request.upload.onprogress = (event) => { if (event.lengthComputable) progress?.(Math.min(95, Math.round(event.loaded / event.total * 95))); };
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(request.status === 401 || request.status === 403 ? 'انتهت صلاحية الرفع. سجّل الدخول مرة أخرى.' : 'تعذر تخزين الصورة. أعد المحاولة.'));
    request.onerror = () => reject(new Error('تعذر الاتصال بخدمة الملفات. تحقق من الاتصال وأعد المحاولة.'));
    request.ontimeout = () => reject(new Error('انتهت مهلة رفع الصورة. أعد المحاولة.'));
    request.onabort = () => reject(new Error('أُلغي رفع الصورة.'));
    request.send(file);
  });
}

const publicBucket = 'hard-public-catalog';
const privateBucket = 'hard-cms-private-media';

async function resolveMedia(asset: MediaAssetDoc, bucket: string, path: string): Promise<MediaAssetDoc> {
  const storage = hardAdminClient.storage.from(bucket);
  if (asset.isPrivate) {
    const { data, error } = await storage.createSignedUrl(path, 600);
    if (error) throw error;
    return { ...asset, downloadUrl: data.signedUrl, thumbnailUrl: data.signedUrl };
  }
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const url = '/media/catalog/' + encodedPath;
  return { ...asset, downloadUrl: url, thumbnailUrl: url };
}

export async function uploadMediaAsset({
  file,
  sector = 'portal',
  tags = ['general'],
  altText = { ar: '', en: '' },
  caption = { ar: '', en: '' },
  isPrivate = false,
  onProgress,
}: {
  file: File;
  sector?: SectorId;
  tags?: string[];
  altText?: LocalizedText;
  caption?: LocalizedText;
  isPrivate?: boolean;
  uploadedBy?: string;
  onProgress?: (progressPercent: number) => void;
}): Promise<MediaAssetDoc> {
  file = await prepareMediaFile(file);
  const validation = validateMediaUpload(file);
  if (!validation.isValid) throw new Error(validation.error);
  if (!isPrivate && !file.type.startsWith('image/')) throw new Error('ارفع المستندات في قسم الملفات الخاصة.');
  const { data: { user }, error: authError } = await hardAdminClient.auth.getUser();
  if (authError || user?.app_metadata.hard_role !== 'superadmin') throw new Error('سجّل الدخول بحساب مسؤول هارد.');
  const id = crypto.randomUUID();
  const bucket = isPrivate ? privateBucket : publicBucket;
  const storagePath = `cms-media/${id}/${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storage = hardAdminClient.storage.from(bucket);
  const now = new Date().toISOString();
  const asset: MediaAssetDoc = {
    id, fileName: file.name, storagePath, downloadUrl: '',
    fileSizeBytes: file.size, contentType: file.type, dimensions: await getImageDimensions(file),
    altText: { ar: altText.ar || file.name, en: altText.en || file.name }, caption,
    sector, tags, isPrivate, references: [], uploadedBy: user.id, createdAt: now, updatedAt: now,
  };
  onProgress?.(0);
  const { data: { session } } = await hardAdminClient.auth.getSession();
  if (!session?.access_token) throw new Error('انتهت جلسة الإدارة. سجّل الدخول مرة أخرى.');
  await uploadStorageFile(file, bucket, storagePath, session.access_token, onProgress);
  const { error: dbError } = await hardAdminClient.from('hard_media_assets')
    .insert({ id, bucket, path: storagePath, asset }).abortSignal(AbortSignal.timeout(20000));
  if (dbError) {
    await storage.remove([storagePath]);
    throw dbError;
  }
  onProgress?.(100);
  return resolveMedia(asset, bucket, storagePath);
}

export async function getMediaAssets(filters?: {
  sector?: SectorId; isPrivate?: boolean; searchQuery?: string;
}): Promise<MediaAssetDoc[]> {
  const q = filters?.searchQuery?.trim().toLowerCase();
  const query = hardAdminClient.from('hard_media_assets').select('bucket,path,asset').order('created_at', { ascending: false });
  if (filters?.isPrivate !== undefined) query.eq('bucket', filters.isPrivate ? privateBucket : publicBucket);
  const { data, error } = await query;
  if (error) throw error;
  return Promise.all((data ?? []).filter(({ asset }) =>
    (!filters?.sector || asset.sector === filters.sector || asset.sector === 'portal') &&
    (!q || [asset.fileName, ...asset.tags, asset.altText.ar, asset.altText.en].some((v) => v.toLowerCase().includes(q)))
  ).map(({ asset, bucket, path }) => resolveMedia(asset, bucket, path)));
}

export async function deleteMediaAsset(id: string): Promise<{ success: boolean; blockedReason?: string }> {
  const { data, error } = await hardAdminClient.from('hard_media_assets').select('asset').eq('id', id).single();
  if (error || !data) return { success: false, blockedReason: 'تعذر العثور على الملف.' };
  if (data.asset.references?.length) return { success: false, blockedReason: 'الملف مرتبط بمحتوى منشور.' };
  // Content in the legacy CMS can still reference public URLs without library metadata.
  const { error: removeError } = await hardAdminClient.from('hard_media_assets').delete().eq('id', id);
  return removeError ? { success: false, blockedReason: 'تعذرت إزالة الملف من المكتبة.' } : { success: true };
}
