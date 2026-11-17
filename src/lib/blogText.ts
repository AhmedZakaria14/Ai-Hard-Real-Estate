export function calculateReadingTime(contentEn: string, contentAr: string): { en: string; ar: string } {
  const wordsEn = (contentEn || '').trim().split(/\s+/).filter(Boolean).length;
  const wordsAr = (contentAr || '').trim().split(/\s+/).filter(Boolean).length;

  const minutesEn = Math.max(1, Math.ceil(wordsEn / 200));
  const minutesAr = Math.max(1, Math.ceil(wordsAr / 160));

  return {
    en: `${minutesEn} min read`,
    ar: `قراءة ${minutesAr} ${minutesAr === 1 ? 'دقيقة' : minutesAr <= 10 ? 'دقائق' : 'دقيقة'}`,
  };
}

/**
 * Generates clean, URL-safe slugs for English and Arabic.
 */
export function generateSlug(text: string, lang: 'en' | 'ar'): string {
  if (!text) return `article-${Date.now()}`;

  if (lang === 'ar') {
    // Retain Arabic letters, digits, and replace spaces/symbols with dashes
    return text
      .trim()
      .replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `article-${Date.now()}`;
  }

  // English slug
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `article-${Date.now()}`;
}

/* =========================================================================
   SANITIZATION & SAFE RICH-TEXT RENDERING
   ========================================================================= */

/**
 * Sanitizes an HTML or markdown-derived string to eliminate script injection,
 * unapproved protocols, and dangerous event handlers.
 */
export function sanitizeHtml(raw: string): string {
  if (!raw) return '';

  let sanitized = raw;

  // 1. Remove script tags and contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove dangerous event handlers like onload, onerror, onclick, etc.
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Remove javascript: and vbscript: URLs
  sanitized = sanitized.replace(/(href|src)\s*=\s*(['"])\s*(?:javascript|vbscript|data(?!\s*:\s*image)):/gi, '$1=$2#');

  // 4. Remove iframe, object, embed, applet tags
  sanitized = sanitized.replace(/<\/?(iframe|object|embed|applet|form|input|button)\b[^>]*>/gi, '');

  return sanitized;
}
