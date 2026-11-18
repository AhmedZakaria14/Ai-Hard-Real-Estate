import type { ServiceDetail } from '../types';
import { mockServices } from '../data/mockData';

export const realEstateHeroSection = { sector: 'realestate', key: 'hero' } as const;
export const realEstateServiceMediaSection = { sector: 'realestate', key: 'service_media' } as const;

export const defaultRealEstateHero = {
  bgImageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2200&q=90',
};

export type ServiceMedia = Record<string, Partial<ServiceDetail> & { bgImageUrl: string; stats: { value: string; label?: { ar: string; en: string } }[] }>;

export const defaultRealEstateServiceMedia: ServiceMedia = Object.fromEntries(
  mockServices.map((service) => [
    service.id,
    { ...service, bgImageUrl: service.image, stats: service.stats },
  ]),
);

export function publicRealEstateImage(value: unknown, fallback: string) {
  if (typeof value !== 'string' || /[\\\s]|\/object\/sign\//i.test(value)) return fallback;
  return /^(https:\/\/|\/(?!\/))/i.test(value) ? value : fallback;
}
