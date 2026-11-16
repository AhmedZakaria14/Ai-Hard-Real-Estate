import type { HVACService } from '../../hvac/types';
import type { ConstructionProject } from '../../construction/types';
import type { BlogPost, Project, Property } from '../../types';

export const hardSupabaseUrl = 'https://vlpdiyicmupghfcualoe.supabase.co';
export const hardPublishableKey = 'sb_publishable_jam6dG2vyvPi65DHUEgqXQ_4YZfJGxF';

export type CatalogCollection = 'blog_posts' | 'projects' | 'properties' | 'construction_projects' | 'hvac_services';

export function catalogTable(collection: CatalogCollection) {
  return collection === 'construction_projects' || collection === 'hvac_services'
    ? 'hard_sector_catalog' : 'hard_catalog';
}

export interface CatalogEntry<T> {
  id: string;
  content: T;
  updated_at: string;
}

export type CatalogArticle = CatalogEntry<BlogPost>;

export async function loadCatalog<T>(collection: CatalogCollection, signal?: AbortSignal): Promise<CatalogEntry<T>[]> {
  const url = new URL('/rest/v1/' + catalogTable(collection), hardSupabaseUrl);
  url.search = new URLSearchParams({
    collection: 'eq.' + collection,
    select: 'id,content,updated_at',
    order: 'id.asc',
  }).toString();
  const rows: CatalogEntry<T>[] = [];
  const pageSize = 100;
  url.searchParams.set('limit', String(pageSize));
  for (let offset = 0; ; offset += pageSize) {
    url.searchParams.set('offset', String(offset));
    const response = await fetch(url, {
      headers: { apikey: hardPublishableKey },
      cache: 'no-store',
      signal,
    });
    if (!response.ok) throw new Error('Could not load published catalog');
    const page: CatalogEntry<T>[] = await response.json();
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
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

export type PublicProperty = Omit<Property, 'agent'>;

export function loadPublishedProperties(signal?: AbortSignal) {
  return loadCatalog<PublicProperty>('properties', signal);
}

export function loadPublishedHvacServices(signal?: AbortSignal) {
  return loadCatalog<HVACService>('hvac_services', signal);
}

export type PublishedConstructionProject = Pick<ConstructionProject,
  'id' | 'titleAr' | 'titleEn' | 'descriptionAr' | 'descriptionEn' | 'locationAr' | 'locationEn' |
  'cityAr' | 'cityEn' | 'image' | 'galleryImages' | 'status' | 'featured' | 'buaM2'
> & { categoryLabelAr?: string; categoryLabelEn?: string };

export function loadPublishedConstructionProjects(signal?: AbortSignal) {
  return loadCatalog<PublishedConstructionProject>('construction_projects', signal);
}
