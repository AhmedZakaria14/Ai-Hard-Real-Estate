export function normalizePropertySearch(value: string): string {
  return value.normalize('NFKD').replace(/[\p{M}\u0640]+/gu, '')
    .replace(/ال\s+خبر/g, 'الخبر')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

export function canonicalPropertyCity(value: string): string {
  return normalizePropertySearch(value) === 'الخبر' ? 'الخبر' : value;
}
