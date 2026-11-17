import { constructionTranslations as constructionDefaults } from '../construction/utils/translations';
import { T as hvacDefaults } from '../hvac/translations';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translations as defaults } from '../lib/translations';
import { subscribeSectorSection, type SectorSection } from '../lib/db/hardSectorSections';

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
  flatten(constructionDefaults[locale], 'construction', entries);
  for (const [key, value] of Object.entries(flatten(hvacDefaults, 'hvac'))) {
    if (key.endsWith('.' + locale)) entries[key.slice(0, -3)] = value;
  }
  return entries;
}

export const siteTextDefaults = { ar: flattenLocale('ar'), en: flattenLocale('en') };
const defaultCopy = { translations: defaults, construction: constructionDefaults, hvac: hvacDefaults };
const TextContext = createContext(defaultCopy);

function replaceLeaf(root: unknown, parts: string[], value: string) {
  let target = root as Record<string, unknown>;
  for (const part of parts.slice(0, -1)) target = target[part] as Record<string, unknown>;
  target[parts.at(-1)!] = value;
}

export function TextOverrideProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState(emptySiteText);
  useEffect(() => subscribeSectorSection(siteTextSection, emptySiteText, setOverrides), []);
  const copy = useMemo(() => {
    const merged = structuredClone(defaultCopy);
    for (const language of ['ar', 'en'] as const) {
      for (const [path, value] of Object.entries(overrides?.[language] ?? {})) {
        if (typeof value !== 'string' || !Object.hasOwn(siteTextDefaults[language], path)) continue;
        const parts = path.split('.');
        if (parts[0] === 'construction') replaceLeaf(merged.construction[language], parts.slice(1), value);
        else if (parts[0] === 'hvac') replaceLeaf(merged.hvac, [...parts.slice(1), language], value);
        else replaceLeaf(merged.translations[language], parts, value);
      }
    }
    return merged;
  }, [overrides]);
  return <TextContext.Provider value={copy}>{children}</TextContext.Provider>;
}

export function useTextOverride() {
  return useContext(TextContext);
}
