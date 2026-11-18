import { constructionTranslations as constructionDefaults } from '../construction/utils/translations';
import { T as hvacDefaults } from '../hvac/translations';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translations as defaults } from '../lib/translations';
import { subscribeSectorSection, type SectorSection } from '../lib/db/hardSectorSections';
import interfaceCopyDefaults from '../lib/interfaceCopy.json';

export const siteTextSection = { sector: 'realestate', key: 'site_text' } satisfies SectorSection;
export type SiteText = { ar: Record<string, string>; en: Record<string, string> };
export const emptySiteText: SiteText = { ar: {}, en: {} };

function flatten(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (typeof value === 'string') out[prefix] = value;
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? prefix + '.' + key : key, out);
  }
  return out;
}

function flattenLocale(locale: 'ar' | 'en') {
  const entries = flatten(defaults[locale]);
  for (const [key, value] of Object.entries(interfaceCopyDefaults[locale])) entries['interface.' + key] = value;
  flatten(constructionDefaults[locale], 'construction', entries);
  for (const [key, value] of Object.entries(flatten(hvacDefaults, 'hvac'))) {
    if (key.endsWith('.' + locale)) entries[key.slice(0, -3)] = value;
  }
  return entries;
}

export const siteTextDefaults = { ar: flattenLocale('ar'), en: flattenLocale('en') };
const defaultCopy = { translations: defaults, construction: constructionDefaults, hvac: hvacDefaults,
  interfaceCopy: interfaceCopyDefaults as SiteText, publicLanguage: 'ar' as 'ar' | 'en' };
const TextContext = createContext(defaultCopy);

function replaceLeaf(root: unknown, parts: string[], value: string) {
  let target = root as Record<string, unknown>;
  for (const part of parts.slice(0, -1)) target = target[part] as Record<string, unknown>;
  target[parts.at(-1)!] = value;
}

export function TextOverrideProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState(emptySiteText);
  const [publicLanguage, setPublicLanguage] = useState<'ar' | 'en'>(() => document.documentElement.lang === 'en' ? 'en' : 'ar');
  useEffect(() => {
    const sync = () => setPublicLanguage(document.documentElement.lang === 'en' ? 'en' : 'ar');
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    sync();
    return () => observer.disconnect();
  }, []);
  useEffect(() => subscribeSectorSection(siteTextSection, emptySiteText, setOverrides), []);
  const copy = useMemo(() => {
    const merged = structuredClone(defaultCopy);
    merged.publicLanguage = publicLanguage;
    for (const language of ['ar', 'en'] as const) {
      for (const [path, value] of Object.entries(overrides?.[language] ?? {})) {
        if (typeof value !== 'string' || !Object.hasOwn(siteTextDefaults[language], path)) continue;
        const parts = path.split('.');
        if (parts[0] === 'interface') merged.interfaceCopy[language][parts.slice(1).join('.')] = value;
        else if (parts[0] === 'construction') replaceLeaf(merged.construction[language], parts.slice(1), value);
        else if (parts[0] === 'hvac') replaceLeaf(merged.hvac, [...parts.slice(1), language], value);
        else replaceLeaf(merged.translations[language], parts, value);
      }
    }
    return merged;
  }, [overrides, publicLanguage]);
  return <TextContext.Provider value={copy}>{children}</TextContext.Provider>;
}

export function useTextOverride() {
  return useContext(TextContext);
}
