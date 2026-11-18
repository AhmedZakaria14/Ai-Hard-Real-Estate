export function assertMediaReady() {
  if (typeof document !== 'undefined' && document.querySelector('[data-upload-pending="true"]')) {
    throw new Error(document.documentElement.lang === 'en' ? 'Wait until the image finishes uploading before saving.' : 'انتظر حتى يكتمل رفع الصورة، ثم احفظ التغييرات.');
  }
}
