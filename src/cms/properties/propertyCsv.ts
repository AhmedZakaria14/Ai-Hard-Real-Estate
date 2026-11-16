import type { Property } from '../../types';
import { getLocalizedText, getPropertyAreaSqM } from '../../lib/utils';

const columns: [string, (property: Property) => string | number][] = [
  ['ID', (property) => property.id],
  ['Title EN', (property) => getLocalizedText(property.title, 'en')],
  ['Title AR', (property) => getLocalizedText(property.title, 'ar')],
  ['Type', (property) => property.type],
  ['Status', (property) => property.status],
  ['Price SAR', (property) => property.price.sar],
  ['Rental Period', (property) => property.price.period ?? ''],
  ['City EN', (property) => getLocalizedText(property.location.city, 'en')],
  ['City AR', (property) => getLocalizedText(property.location.city, 'ar')],
  ['District EN', (property) => getLocalizedText(property.location.area, 'en')],
  ['District AR', (property) => getLocalizedText(property.location.area, 'ar')],
  ['Bedrooms', (property) => property.bedrooms],
  ['Area SqM', getPropertyAreaSqM],
  ['Featured', (property) => property.featured ? 'Yes' : 'No'],
];

function csvCell(value: string | number) {
  const text = String(value ?? '');
  const safe = typeof value === 'string' && /^[\s]*[=+@\-\t\r\n]/.test(text) ? "'" + text : text;
  return '"' + safe.replace(/"/g, '""') + '"';
}

export function propertiesCSV(properties: Property[]): string {
  const header = columns.map(([name]) => csvCell(name)).join(',');
  const rows = properties.map((property) => columns.map(([, value]) => csvCell(value(property))).join(','));
  return '\uFEFF' + [header, ...rows].join('\r\n');
}
