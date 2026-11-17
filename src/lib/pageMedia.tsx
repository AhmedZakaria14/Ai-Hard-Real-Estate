import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { subscribeSectorSection, type SectorSection } from './db/hardSectorSections';
import { publicRealEstateImage } from './realEstateHomeContent';

export const pageMediaSection = { sector: 'realestate', key: 'page_media' } satisfies SectorSection;
export const defaultPageMedia = {
  constructionHeroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
  constructionAboutImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  hvacHeroImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=2000&q=85',
  propertyPlaceholderImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  aboutImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  projectPlaceholderImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80',
};

const MediaContext = createContext(defaultPageMedia);

export function PageMediaProvider({ children }: { children: ReactNode }) {
  const [media, setMedia] = useState(defaultPageMedia);
  useEffect(() => subscribeSectorSection(pageMediaSection, defaultPageMedia, setMedia), []);
  const urls = useMemo(() => Object.fromEntries(Object.entries(defaultPageMedia).map(([key, fallback]) => [
    key, publicRealEstateImage(media?.[key as keyof typeof defaultPageMedia], fallback),
  ])) as typeof defaultPageMedia, [media]);
  return <MediaContext.Provider value={urls}>{children}</MediaContext.Provider>;
}

export function usePageMedia() {
  return useContext(MediaContext);
}
