import type { LocalizedText, SectorId } from '../types/firestore-schema';
import { hardAdminClient } from './db/hardAdminClient';
import { hardPublishableKey, hardSupabaseUrl } from './db/hardCatalog';

export interface NavItem {
  id: string;
  label: LocalizedText;
  type: 'internal' | 'external';
  targetPath: string; // internal route or external URL
  targetSector?: SectorId;
  isVisible: boolean;
  order: number;
  openInNewTab?: boolean;
}

export interface NavigationDoc {
  id: string; // e.g. 'header_portal', 'footer_quick_links', 'header_realestate'
  sector: SectorId;
  menuType: 'header' | 'footer' | 'sector_bar';
  items: NavItem[];
  updatedAt: string;
  updatedBy?: string;
}

export interface RedirectDoc {
  id: string;
  sourceSlug: string;
  targetSlug: string;
  sector?: SectorId;
  statusCode: 301 | 302;
  createdAt: string;
  createdBy?: string;
}

// Protected Infrastructure Routes - Cannot be edited or redirected by content editors
export const INFRASTRUCTURE_ROUTES = [
  '/',
  '/admin',
  '/realestate/admin',
  '/construction/admin',
  '/hvac/admin',
  '/login',
  '/api',
  '/_next',
  '/static',
];

// Available Internal Destinations Catalog
export const KNOWN_INTERNAL_DESTINATIONS: { path: string; labelAr: string; labelEn: string; sector: SectorId }[] = [
  { path: '/', labelAr: 'البوابة الرئيسية القابضة', labelEn: 'Group Main Portal', sector: 'portal' },
  { path: '/realestate', labelAr: 'الرئيسية - العقارات', labelEn: 'Real Estate Home', sector: 'realestate' },
  { path: '/realestate/properties', labelAr: 'كتالوج العقارات والأصول', labelEn: 'Properties & Assets Catalog', sector: 'realestate' },
  { path: '/realestate/projects', labelAr: 'المشاريع التطويرية الكبرى', labelEn: 'Master Development Projects', sector: 'realestate' },
  { path: '/realestate/about', labelAr: 'عن المجموعة والقطاع', labelEn: 'About Group & Sector', sector: 'realestate' },
  { path: '/realestate/blog', labelAr: 'المدونة والتقارير العقارية', labelEn: 'Blog & Market Reports', sector: 'realestate' },
  { path: '/realestate/contact', labelAr: 'اتصل بنا والخدمة', labelEn: 'Contact Us & Care', sector: 'realestate' },
  { path: '/construction', labelAr: 'الرئيسية - المقاولات والإنشاءات', labelEn: 'Construction Home', sector: 'construction' },
  { path: '/construction/projects', labelAr: 'مشاريع المقاولات والبناء', labelEn: 'Contracting Projects', sector: 'construction' },
  { path: '/hvac', labelAr: 'الرئيسية - أنظمة التكييف HVAC', labelEn: 'HVAC Engineering Home', sector: 'hvac' },
];

/**
 * Validates external redirect URLs to prevent open redirect vulnerabilities.
 */
export function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return ['http:', 'https:'].includes(parsed.protocol) && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

/**
 * Checks if a target path is a protected infrastructure route.
 */
export function isProtectedInfrastructureRoute(path: string): boolean {
  const normalized = path.toLowerCase().trim().replace(/\/+$/, '') || '/';
  return INFRASTRUCTURE_ROUTES.some(
    (infra) => normalized === infra || (infra !== '/' && normalized.startsWith(infra + '/'))
  );
}

/**
 * Validates unique page slug format.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug.trim().toLowerCase());
}

function validItem(item: NavItem) {
  if (typeof item.targetPath !== 'string') return false;
  if (item.type === 'external') return isValidExternalUrl(item.targetPath);
  if (item.type !== 'internal') return false;
  const target = item.targetPath.trim();
  return target.startsWith('/') && !target.startsWith('//') && !/[\\\u0000-\u001f]/.test(target);
}

export async function getNavigationDoc(id: string): Promise<NavigationDoc | null> {
  const { data, error } = await hardAdminClient.from('hard_navigation').select('menu,visibility')
    .eq('id', id).limit(2);
  if (error) throw error;
  return (data?.find((row) => row.visibility === 'admin') ?? data?.[0])?.menu ?? null;
}

const menuChange = 'hard-navigation-saved';
export function subscribeNavigationDoc(id: string, callback: (nav: NavigationDoc | null) => void) {
  const controller = new AbortController();
  let generation = 0;
  async function refresh() {
    const request = ++generation;
    try {
      const params = new URLSearchParams({ id: 'eq.' + id, visibility: 'eq.published', select: 'menu', limit: '1' });
      const response = await fetch(hardSupabaseUrl + '/rest/v1/hard_navigation?' + params, {
        headers: { apikey: hardPublishableKey }, signal: controller.signal, cache: 'no-store',
      });
      if (!response.ok) throw new Error('Could not load navigation');
      const rows: { menu: NavigationDoc }[] = await response.json();
      if (controller.signal.aborted || request !== generation) return;
      const menu = rows[0]?.menu;
      callback(menu ? { ...menu, items: (menu.items ?? []).filter(validItem) } : null);
    } catch (error) {
      if (!controller.signal.aborted) console.warn('Could not read Supabase navigation', error);
    }
  }
  window.addEventListener(menuChange, refresh);
  window.addEventListener('focus', refresh);
  void refresh();
  return () => {
    controller.abort();
    window.removeEventListener(menuChange, refresh);
    window.removeEventListener('focus', refresh);
  };
}

export async function saveNavigationDoc(navDoc: NavigationDoc): Promise<void> {
  if (navDoc.id !== navDoc.menuType + '_' + navDoc.sector || navDoc.items.length > 100
    || navDoc.items.some((item) => !validItem(item) || !item.label?.ar?.trim() || !item.label?.en?.trim())) {
    throw new Error('راجع تسميات القائمة وروابطها قبل الحفظ.');
  }
  const menu: NavigationDoc = {
    id: navDoc.id, sector: navDoc.sector, menuType: navDoc.menuType,
    items: navDoc.items.map((item, index) => ({ ...item, targetPath: item.targetPath.trim(), order: index + 1 })),
    updatedAt: new Date().toISOString(),
  };
  const published = { ...menu, items: menu.items.filter((item) => item.isVisible) };
  const { error } = await hardAdminClient.from('hard_navigation').upsert([
    { id: menu.id, visibility: 'admin', menu },
    { id: menu.id, visibility: 'published', menu: published },
  ], { onConflict: 'id,visibility' });
  if (error) throw error;
  window.dispatchEvent(new Event(menuChange));
}

function redirectPath(path: string): string {
  const normalized = '/' + path.trim().toLowerCase().replace(/^\//, '').replace(/\/+$/, '');
  if (!/^\/[a-z0-9][a-z0-9/-]*$/.test(normalized) || normalized.includes('//')
    || isProtectedInfrastructureRoute(normalized) || /^\/(realestate|construction|hvac)\/(admin|cms)(\/|$)/.test(normalized)) {
    throw new Error('اختر مسارًا داخليًا صالحًا خارج مسارات الإدارة والنظام.');
  }
  return normalized;
}

export async function createUrlRedirect(
  oldSlug: string,
  newSlug: string,
  sector: SectorId = 'realestate'
): Promise<RedirectDoc> {
  const sourceSlug = redirectPath(oldSlug);
  const targetSlug = redirectPath(newSlug);
  if (sourceSlug === targetSlug) throw new Error('المسار القديم والجديد يجب أن يكونا مختلفين.');
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const { error } = await hardAdminClient.from('hard_redirect_rules').insert({
    id, source_path: sourceSlug, target_path: targetSlug, sector, status_code: 301, created_at: createdAt,
  });
  if (error) throw error;
  return { id, sourceSlug, targetSlug, sector, statusCode: 301, createdAt };
}

export async function getAllRedirects(): Promise<RedirectDoc[]> {
  const { data, error } = await hardAdminClient.from('hard_redirect_rules')
    .select('id,source_path,target_path,sector,status_code,created_at').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id, sourceSlug: row.source_path, targetSlug: row.target_path,
    sector: row.sector, statusCode: row.status_code, createdAt: row.created_at,
  }));
}

export async function deleteRedirect(id: string): Promise<void> {
  const { error } = await hardAdminClient.from('hard_redirect_rules').delete().eq('id', id);
  if (error) throw error;
}
