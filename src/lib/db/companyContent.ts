import { hardAdminClient } from './hardAdminClient';
import { hardPublishableKey, hardSupabaseUrl } from './hardCatalog';

export type CompanyContentKind = 'team' | 'offices' | 'statistics' | 'partners' | 'stories';
type CompanyContentRow<T> = { kind: CompanyContentKind; id: string; body: T };

export async function readCompanyContent(signal: AbortSignal) {
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
  const row = { kind, id: item.id, body: item };
  const table = hardAdminClient.from('hard_company_content');
  const query = creating ? table.insert(row) : table.update({ body: item }).eq('kind', kind).eq('id', item.id);
  const { data, error } = await query.select('kind,id,body').single<CompanyContentRow<T>>();
  if (error) throw error;
  return data.body;
}

export async function deleteCompanyContent(kind: CompanyContentKind, id: string) {
  const { data, error } = await hardAdminClient.from('hard_company_content').delete().eq('kind', kind).eq('id', id).select('id').maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
