import { hardAdminClient } from './hardAdminClient';
import { hardPublishableKey, hardSupabaseUrl } from './hardCatalog';

export type SectorSection =
  | { sector: 'construction'; key: 'hero' | 'company' | 'stages' | 'offices' }
  | { sector: 'hvac'; key: 'hero' | 'hours_contact' | 'booking_copy' | 'service_areas' };

const refreshEvent = 'hard-sector-section-saved';

export async function readSectorSection<T>({ sector, key }: SectorSection, signal?: AbortSignal): Promise<T | null> {
  const params = new URLSearchParams({ sector: 'eq.' + sector, section_key: 'eq.' + key, select: 'body', limit: '1' });
  const response = await fetch(hardSupabaseUrl + '/rest/v1/hard_sector_sections?' + params, {
    headers: { apikey: hardPublishableKey }, cache: 'no-store', signal,
  });
  if (!response.ok) throw new Error('Could not load the sector section');
  const rows: { body: T }[] = await response.json();
  return rows[0]?.body ?? null;
}

export function subscribeSectorSection<T>(section: SectorSection, fallback: T, callback: (data: T) => void) {
  const controller = new AbortController();
  let generation = 0;
  async function refresh() {
    const request = ++generation;
    try {
      const data = await readSectorSection<T>(section, controller.signal);
      if (!controller.signal.aborted && request === generation) callback(data ?? fallback);
    } catch (error) {
      if (!controller.signal.aborted) console.warn('Could not load Supabase sector section', error);
    }
  }
  function onSaved(event: Event) {
    const changed = (event as CustomEvent<SectorSection>).detail;
    if (changed?.sector === section.sector && changed.key === section.key) void refresh();
  }
  window.addEventListener(refreshEvent, onSaved);
  window.addEventListener('focus', refresh);
  void refresh();
  return () => {
    controller.abort();
    window.removeEventListener(refreshEvent, onSaved);
    window.removeEventListener('focus', refresh);
  };
}

export async function saveSectorSection({ sector, key }: SectorSection, body: object) {
  const { error } = await hardAdminClient.from('hard_sector_sections').upsert({
    sector, section_key: key, body, updated_at: new Date().toISOString(),
  }, { onConflict: 'sector,section_key' });
  if (error) throw error;
  window.dispatchEvent(new CustomEvent(refreshEvent, { detail: { sector, key } }));
}
