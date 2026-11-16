import { useCallback, useEffect, useState } from 'react';
import type { BlogPost } from '../types';
import { getLocalizedText } from './utils';
import { hardPublishableKey, hardSupabaseUrl } from './db/hardCatalog';

type BlogCategoryRow = { id: string; name_ar: string; name_en: string };
export type CatalogBlogCategory = { key: string; label: { ar: string; en: string } };

export function blogCategoryKey(post: BlogPost): string {
  return post.categoryId || getLocalizedText(post.category, 'en').trim().toLowerCase();
}

export function blogCategories(posts: BlogPost[], configured: CatalogBlogCategory[] = []) {
  const categories = new Map(configured.map((category) => [category.key, category.label]));
  for (const post of posts) {
    const key = blogCategoryKey(post);
    if (key && !categories.has(key)) {
      categories.set(key, { ar: getLocalizedText(post.category, 'ar'), en: getLocalizedText(post.category, 'en') });
    }
  }
  return Array.from(categories, ([key, label]) => ({ key, label }));
}

export function useCatalogBlogCategories() {
  const [categories, setCategories] = useState<CatalogBlogCategory[]>([]);
  const [error, setError] = useState(false);
  const [generation, setGeneration] = useState(0);
  const refresh = useCallback(() => setGeneration((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch(hardSupabaseUrl + '/rest/v1/hard_blog_categories?select=id,name_ar,name_en&order=sort_order.asc,id.asc', {
      headers: { apikey: hardPublishableKey }, cache: 'no-store', signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error('Cannot load article categories');
      const rows: BlogCategoryRow[] = await response.json();
      if (!controller.signal.aborted) setCategories(rows.map((row) => ({ key: row.id, label: { ar: row.name_ar, en: row.name_en } })));
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [generation]);
  useEffect(() => {
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [refresh]);
  return { categories, error, refresh };
}
