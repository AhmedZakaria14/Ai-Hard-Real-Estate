import type { Language } from '../types';

/** Display the stored publication date without changing its value or calendar. */
export function formatPublicationDate(value: string | undefined, language: Language): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US', {
    timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric',
  }).format(date);
}
