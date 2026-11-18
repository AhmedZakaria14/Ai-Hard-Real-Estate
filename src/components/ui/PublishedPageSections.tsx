import { useEffect, useState } from 'react';
import type { Language } from '../../types';
import type { PageSection } from '../../lib/sectionSchemas';
import { hardPublishableKey, hardSupabaseUrl } from '../../lib/db/hardCatalog';
import { DynamicPageSectionRenderer } from './DynamicPageSectionRenderer';

type PageKey = 'page_portal' | 'page_realestate' | 'page_realestate_about' | 'page_construction' | 'page_hvac';

function safeDestination(value?: string) {
  if (!value || /[\\\s]/.test(value)) return null;
  if (value.startsWith('#') || /^\/(?!\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export default function PublishedPageSections({ page, language }: { page: PageKey; language: Language }) {
  const [result, setResult] = useState<{ page: PageKey; sections: PageSection[] } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page_id: 'eq.' + page, select: 'sections', limit: '1' });
    async function load() {
      try {
        const response = await fetch(hardSupabaseUrl + '/rest/v1/hard_web_page_sections?' + params, {
          headers: { apikey: hardPublishableKey },
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Public page sections could not be loaded.');
        const rows: { sections: PageSection[] }[] = await response.json();
        if (controller.signal.aborted) return;
        const sections = (rows[0]?.sections ?? []).filter((section) =>
          (section.type === 'hero' || section.type === 'text_block') && section.content && section.isVisible !== false,
        ).map((section) => {
          if (section.type !== 'hero') return section;
          const content = section.content as { bgImageUrl?: string };
          return { ...section, content: { ...section.content, bgImageUrl: safeDestination(content.bgImageUrl) ?? '' } };
        });
        setResult({ page, sections });
      } catch (error) {
        if (!controller.signal.aborted) console.warn('Could not load approved the database page sections', error);
      }
    }
    void load();
    return () => controller.abort();
  }, [page]);

  if (!result?.sections.length || result.page !== page) return null;
  return <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="mx-auto max-w-7xl px-4 py-8">
    <DynamicPageSectionRenderer sections={result.sections} language={language} onNavigate={(url) => {
      const target = safeDestination(url);
      if (target && target !== '#') window.location.assign(target);
    }} />
  </div>;
}
