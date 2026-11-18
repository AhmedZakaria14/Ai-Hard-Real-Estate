import type { Language } from '../types';

/** Display the stored publication date without changing its value or calendar. */
export function formatPublicationDate(value: string | undefined, language: Language): string {
  if (!value) return '';
  // Publication is a calendar date. Legacy month-name strings otherwise parse at
  // local midnight and shift to the previous day when formatted in UTC.
  const day = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const date = new Date(day ? day + 'T12:00:00Z' : value + ' UTC');
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US', {
    timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric',
  }).format(date);
}
