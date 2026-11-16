import { hardAdminClient } from './hardAdminClient';
import type { Property } from '../../types';
import { canonicalPropertyCity } from '../propertySearch';
import type { PublicProperty, CatalogEntry } from './hardCatalog';

const editableFields = {
  properties: ['slug', 'title', 'description', 'location', 'price', 'type', 'status', 'bedrooms', 'bathrooms',
    'areaSqFt', 'areaSqM', 'featured', 'images', 'amenities', 'features'],
  projects: ['slug', 'title', 'developer', 'location', 'city', 'startingPriceSAR', 'handoverDate', 'unitsTotal',
    'unitsAvailable', 'roiProjected', 'image', 'gallery', 'category', 'status', 'progressPercentage',
    'lastUpdated', 'description', 'highlights', 'featured', 'brochureUrl'],
  blog_posts: ['slug', 'title', 'excerpt', 'category', 'date', 'publishedAt', 'readTime', 'author', 'authorRole',
    'authorAvatar', 'image', 'imageAlt', 'content', 'featured', 'tags'],
} as const;

type EditableCollection = keyof typeof editableFields;

export async function updatePublishedCatalog<T extends { id: string }>(
  collection: EditableCollection,
  id: string,
  updates: Partial<T>,
): Promise<T> {
  if (collection === 'blog_posts' && 'status' in updates && updates.status !== 'published') {
    throw new Error('هذا المحرر يعدّل النسخة المنشورة. حفظ المسودات وإلغاء النشر غير متاحين هنا بعد.');
  }

  const { data: entry, error: readError } = await hardAdminClient.from('hard_catalog')
    .select('id,content,updated_at')
    .eq('collection', collection).eq('id', id)
    .maybeSingle<CatalogEntry<T>>();
  if (readError) throw readError;
  if (!entry) throw new Error('السجل غير موجود في كتالوج Supabase المنشور.');

  const content = buildPublicContent(collection, id, updates, entry.content);

  const { data: saved, error } = await hardAdminClient.from('hard_catalog')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('collection', collection).eq('id', id).eq('updated_at', entry.updated_at)
    .select('id,content,updated_at').maybeSingle<CatalogEntry<T>>();
  if (error) throw error;
  if (!saved) throw new Error('لم يُحفظ التعديل. أعد تحميل السجل وتأكد من صلاحية حسابك.');
  return saved.content;
}

function buildPublicContent(collection: EditableCollection, id: string, updates: object, existing: object = {}) {
  const changes = updates as Record<string, unknown>;
  const previous = existing as Record<string, unknown>;
  const content: Record<string, unknown> = { id };
  for (const field of editableFields[collection]) {
    const value = changes[field] ?? previous[field];
    if (value !== undefined) content[field] = value;
  }
  // Only store permanent image URLs so the visitor can load images without a session.
  for (const image of [content.image, content.authorAvatar,
    ...(Array.isArray(content.images) ? content.images : []),
    ...(Array.isArray(content.gallery) ? content.gallery : [])]) {
    if (image == null || image === '') continue;
    if (typeof image !== 'string' || !/^https:\/\/[^\s]+$/i.test(image) || /\/object\/sign\//i.test(image)) {
      throw new Error('استخدم رابط HTTPS عامًا وثابتًا أو ارفع الصورة من مكتبة الوسائط العامة.');
    }
  }

  if (collection === 'properties' && content.location) {
    const location = content.location as Property['location'];
    if (typeof location.city?.ar === 'string') {
      content.location = { ...location, city: { ...location.city, ar: canonicalPropertyCity(location.city.ar) } };
    }
  }
  return content;
}

export async function createPublishedProperty(property: Partial<Property>): Promise<PublicProperty> {
  const id = crypto.randomUUID();
  const slug = (property.slug || 'property') + '-' + id;
  const content = buildPublicContent('properties', id, { ...property, slug });
  const { data, error } = await hardAdminClient.from('hard_catalog')
    .insert({ collection: 'properties', id, content })
    .select('id,content,updated_at').single<CatalogEntry<PublicProperty>>();
  if (error) throw error;
  return data.content;
}

export async function archivePublishedProperty(id: string): Promise<boolean> {
  const { data, error } = await hardAdminClient.from('hard_catalog')
    .update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('collection', 'properties').eq('id', id).is('archived_at', null)
    .select('id').maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
