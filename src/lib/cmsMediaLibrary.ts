import { hardAdminClient } from './db/hardAdminClient';
import type { LocalizedText, SectorId } from '../types/firestore-schema';

export type AllowedMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'image/avif'
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const APPROVED_FILE_TYPES: AllowedMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
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
export function getImageDimensions(file: File): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(undefined);
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve(undefined);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
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
  const url = new URL('/media/catalog/' + encodedPath, window.location.origin).href;
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
  const { error } = await storage.upload(storagePath, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { error: dbError } = await hardAdminClient.from('hard_media_assets')
    .insert({ id, bucket, path: storagePath, asset });
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
