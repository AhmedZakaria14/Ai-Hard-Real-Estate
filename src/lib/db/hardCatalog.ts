import type { BlogPost } from '../../types';

export const hardSupabaseUrl = 'https://vlpdiyicmupghfcualoe.supabase.co';
export const hardPublishableKey = 'sb_publishable_jam6dG2vyvPi65DHUEgqXQ_4YZfJGxF';

export interface CatalogArticle {
  id: string;
  content: BlogPost;
  updated_at: string;
}

export async function loadPublishedArticles(signal?: AbortSignal): Promise<CatalogArticle[]> {
  const url = new URL('/rest/v1/hard_catalog', hardSupabaseUrl);
  url.search = new URLSearchParams({
    collection: 'eq.blog_posts',
    select: 'id,content,updated_at',
    order: 'id.asc',
  }).toString();
  const response = await fetch(url, {
    headers: { apikey: hardPublishableKey },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) throw new Error('Could not load the published blog catalog');
  const articles: CatalogArticle[] = await response.json();
  return articles.sort((a, b) =>
    (Date.parse(b.content.publishedAt || b.content.date) || 0) -
    (Date.parse(a.content.publishedAt || a.content.date) || 0),
  );
}
