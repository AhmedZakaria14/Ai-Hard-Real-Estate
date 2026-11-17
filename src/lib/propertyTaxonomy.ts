import { Home, Building2, Sparkles, Crown, Building, Store, LucideIcon } from 'lucide-react';
import type { Property, PropertyType, Language } from '../types';
import type { SectorSection } from './db/hardSectorSections';

export interface PropertyTypeConfig {
  id: PropertyType;
  labelKey: string;
  defaultLabel: {
    en: string;
    ar: string;
  };
  icon: LucideIcon;
}

export const PROPERTY_TAXONOMY: PropertyTypeConfig[] = [
  {
    id: 'villa',
    labelKey: 'villa',
    defaultLabel: { en: 'Villa', ar: 'فيلا' },
    icon: Home,
  },
  {
    id: 'apartment',
    labelKey: 'apartment',
    defaultLabel: { en: 'Apartment', ar: 'شقة سكنية' },
    icon: Building2,
  },
  {
    id: 'penthouse',
    labelKey: 'penthouse',
    defaultLabel: { en: 'Penthouse', ar: 'بنتهاوس' },
    icon: Sparkles,
  },
  {
    id: 'mansion',
    labelKey: 'mansion',
    defaultLabel: { en: 'Mansion & Palace', ar: 'قصر ومقر فاخر' },
    icon: Crown,
  },
  {
    id: 'townhouse',
    labelKey: 'townhouse',
    defaultLabel: { en: 'Townhouse', ar: 'تاون هاوس' },
    icon: Building,
  },
  {
    id: 'commercial',
    labelKey: 'commercial',
    defaultLabel: { en: 'Commercial', ar: 'تجاري' },
    icon: Store,
  },
];

export interface PropertyTypeOption {
  id: PropertyType;
  nameAr: string;
  nameEn: string;
  active: boolean;
}

export const propertyTypesSection = { sector: 'realestate', key: 'property_types' } satisfies SectorSection;
export const propertyTypeIcons = new Map(PROPERTY_TAXONOMY.map((item) => [item.id, item.icon]));

export const defaultPropertyTypes: PropertyTypeOption[] = [
  ...PROPERTY_TAXONOMY.map(({ id, defaultLabel }) => ({
    id, nameAr: defaultLabel.ar, nameEn: defaultLabel.en, active: true,
  })),
  { id: 'land', nameAr: 'أرض', nameEn: 'Land Plot', active: true },
  { id: 'building', nameAr: 'عمارة سكنية / تجارية', nameEn: 'Full Building', active: true },
  { id: 'floor', nameAr: 'دور مستقل', nameEn: 'Independent Floor', active: true },
  { id: 'office', nameAr: 'مكتب تجاري', nameEn: 'Commercial Office', active: true },
  { id: 'retail', nameAr: 'محل / معرض تجاري', nameEn: 'Retail / Showroom', active: true },
  { id: 'warehouse', nameAr: 'مستودع / هنجر', nameEn: 'Warehouse / Industrial', active: true },
];

export function isPropertyTypeId(value: string) {
  return defaultPropertyTypes.some(({ id }) => id === value) ||
    /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(value);
}

export function validPropertyTypes(value: unknown): value is PropertyTypeOption[] {
  if (!Array.isArray(value) || value.length === 0 || !value.some((item) => item?.active === true)) return false;
  const ids = new Set<string>();
  for (const item of value) {
    if (!item || typeof item.id !== 'string' || !isPropertyTypeId(item.id) || ids.has(item.id) ||
        typeof item.active !== 'boolean' || typeof item.nameAr !== 'string' || !item.nameAr.trim() ||
        typeof item.nameEn !== 'string' || !item.nameEn.trim()) return false;
    ids.add(item.id);
  }
  return true;
}

export function calculatePropertyTypeCounts(properties: Property[]): Record<string, number> {
  const counts: Record<string, number> = Object.create(null);
  counts.all = properties.length;
  for (const property of properties) {
    if (isPropertyTypeId(property.type)) counts[property.type] = (counts[property.type] ?? 0) + 1;
  }
  return counts;
}

export function getPropertyTypeLabel(type: PropertyType, language: Language, types = defaultPropertyTypes): string {
  const item = types.find((option) => option.id === type);
  return (language === 'ar' ? item?.nameAr : item?.nameEn) ?? type;
}
