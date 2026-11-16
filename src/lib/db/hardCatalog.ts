import type { BlogPost, Project } from '../../types';

export const hardSupabaseUrl = 'https://vlpdiyicmupghfcualoe.supabase.co';
export const hardPublishableKey = 'sb_publishable_jam6dG2vyvPi65DHUEgqXQ_4YZfJGxF';

export type CatalogCollection = 'blog_posts' | 'projects';

export interface CatalogEntry<T> {
  id: string;
  content: T;
  updated_at: string;
}

export type CatalogArticle = CatalogEntry<BlogPost>;

export async function loadCatalog<T>(collection: CatalogCollection, signal?: AbortSignal): Promise<CatalogEntry<T>[]> {
  const url = new URL('/rest/v1/hard_catalog', hardSupabaseUrl);
  url.search = new URLSearchParams({
    collection: 'eq.' + collection,
    select: 'id,content,updated_at',
    order: 'id.asc',
  }).toString();
  const response = await fetch(url, {
    headers: { apikey: hardPublishableKey },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) throw new Error('Could not load published catalog');
  return response.json();
}

export async function loadPublishedArticles(signal?: AbortSignal): Promise<CatalogArticle[]> {
  const articles = await loadCatalog<BlogPost>('blog_posts', signal);
  return articles.sort((a, b) =>
    (Date.parse(b.content.publishedAt || b.content.date) || 0) -
    (Date.parse(a.content.publishedAt || a.content.date) || 0),
  );
}

export function loadPublishedProjects(signal?: AbortSignal) {
  return loadCatalog<Project>('projects', signal);
}
