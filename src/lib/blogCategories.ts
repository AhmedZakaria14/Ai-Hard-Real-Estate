import type { BlogPost } from '../types';
import { getLocalizedText } from './utils';

export function blogCategoryKey(post: BlogPost): string {
  return getLocalizedText(post.category, 'en').trim().toLowerCase();
}

export function blogCategories(posts: BlogPost[]) {
  const categories = new Map<string, { ar: string; en: string }>();
  for (const post of posts) {
    const key = blogCategoryKey(post);
    if (key && !categories.has(key)) {
      categories.set(key, { ar: getLocalizedText(post.category, 'ar'), en: getLocalizedText(post.category, 'en') });
    }
  }
  return Array.from(categories, ([key, label]) => ({ key, label }));
}
