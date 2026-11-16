import { hardAdminClient } from './hardAdminClient';
import { hardPublishableKey, hardSupabaseUrl } from './hardCatalog';

type RuntimeConfigKind = 'calculator' | 'form';

export async function readPublicCalculator<T>(key: string, signal?: AbortSignal): Promise<T | null> {
  const url = new URL('/rest/v1/hard_runtime_config', hardSupabaseUrl);
  url.search = new URLSearchParams({ kind: 'eq.calculator', key: 'eq.' + key, select: 'body', limit: '1' }).toString();
  const response = await fetch(url, { headers: { apikey: hardPublishableKey }, signal, cache: 'no-store' });
  if (!response.ok) throw new Error('Could not fetch the published calculator configuration');
  const rows: { body: T }[] = await response.json();
  return rows[0]?.body ?? null;
}

export async function readAdminConfig<T>(kind: RuntimeConfigKind, key: string): Promise<T | null> {
  const { data, error } = await hardAdminClient.from('hard_runtime_config')
    .select('body').eq('kind', kind).eq('key', key).maybeSingle();
  if (error) throw error;
  return data?.body ?? null;
}

export async function writeAdminConfig(kind: RuntimeConfigKind, configs: { key: string; body: object }[]) {
  const now = new Date().toISOString();
  const { error } = await hardAdminClient.from('hard_runtime_config').upsert(
    configs.map(({ key, body }) => ({ kind, key, body, updated_at: now })),
    { onConflict: 'kind,key' },
  );
  if (error) throw error;
}
