import { hardAdminClient } from './hardAdminClient';
import { hardPublishableKey, hardSupabaseUrl } from './hardCatalog';
import { assertMediaReady } from '../mediaSaveGuard';

function contentChanged() {
  window.dispatchEvent(new Event('hard-company-saved'));
  try { localStorage.setItem('hard-company-saved', String(Date.now())); } catch { /* Focus reload is sufficient. */ }
}

export type CompanyContentKind = 'team' | 'offices' | 'statistics' | 'partners' | 'stories' | 'faqs' | 'certifications' | 'enhanced_testimonials';
type CompanyContentRow<T> = { kind: CompanyContentKind; id: string; body: T };

export async function readCompanyContent(signal: AbortSignal): Promise<CompanyContentRow<unknown>[]> {
  const response = await fetch(hardSupabaseUrl + '/rest/v1/hard_public_company_content?select=kind,id,body&order=kind.asc,id.asc', {
    headers: { apikey: hardPublishableKey }, cache: 'no-store', signal,
  });
  if (!response.ok) throw new Error('Could not load company content');
  return response.json();
}

export async function readAdminCompanyContent() {
  const { data, error } = await hardAdminClient.from('hard_company_content').select('kind,id,body').order('kind').order('id');
  if (error) throw error;
  return data;
}

export async function saveCompanyContent<T extends { id: string }>(kind: CompanyContentKind, item: T, creating = false) {
  assertMediaReady();
  const row = { kind, id: item.id, body: item };
  const table = hardAdminClient.from('hard_company_content');
  const query = creating ? table.insert(row) : table.update({ body: item }).eq('kind', kind).eq('id', item.id);
  const { data, error } = await query.select('kind,id,body').single<CompanyContentRow<T>>();
  if (error) throw error;
  contentChanged();
  return data.body;
}

export async function deleteCompanyContent(kind: CompanyContentKind, id: string) {
  const { data, error } = await hardAdminClient.from('hard_company_content').delete().eq('kind', kind).eq('id', id).select('id').maybeSingle();
  if (error) throw error;
  contentChanged();
  return Boolean(data);
}

export async function resetCompanyContent(kind: CompanyContentKind, items: { id: string }[]) {
  const { error } = await hardAdminClient.rpc('hard_reset_company_entities', {
    entity_kind: kind,
    entity_items: items,
  });
  if (error) throw error;
}
