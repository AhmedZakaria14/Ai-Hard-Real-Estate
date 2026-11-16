import { useState, type FormEvent } from 'react';
import { hardAdminClient } from '../../lib/db/hardAdminClient';
import type { CatalogBlogCategory } from '../../lib/blogCategories';
import type { Language } from '../../types';

export function CMSBlogCategories({ categories, language, refresh, loadError }: {
  categories: CatalogBlogCategory[]; language: Language; refresh: () => void; loadError: boolean;
}) {
  const ar = language === 'ar';
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const name_ar = String(fields.get('ar') ?? '').trim();
    const name_en = String(fields.get('en') ?? '').trim();
    if (!name_ar || !name_en) return;
    setBusy(true);
    try {
      const { error } = await hardAdminClient.from('hard_blog_categories').insert({ id: crypto.randomUUID(), name_ar, name_en });
      if (error) throw error;
      form.reset();
      refresh();
      setFeedback(ar ? 'تمت إضافة التصنيف.' : 'Category added.');
    } catch {
      setFeedback(ar ? 'تعذّرت إضافة التصنيف. تأكد أن الاسم غير مكرر.' : 'Could not add the category. Check for duplicate names.');
    } finally { setBusy(false); }
  }

  async function remove(category: CatalogBlogCategory) {
    if (busy || !window.confirm(ar ? `حذف تصنيف «${category.label.ar}»؟` : `Delete “${category.label.en}”?`)) return;
    setBusy(true);
    try {
      const { error } = await hardAdminClient.from('hard_blog_categories').delete().eq('id', category.key).select('id').single();
      if (error) {
        setFeedback(error.code === '23503'
          ? (ar ? 'انقل المقالات المرتبطة إلى تصنيف آخر أولاً.' : 'Move the associated articles to another category first.')
          : (ar ? 'تعذّر حذف التصنيف.' : 'Could not delete the category.'));
        return;
      }
      refresh();
      setFeedback(ar ? 'تم حذف التصنيف.' : 'Category deleted.');
    } finally { setBusy(false); }
  }

  return <details className="mb-5 rounded-xl border bg-white p-4">
    <summary className="cursor-pointer font-bold">{ar ? 'إدارة تصنيفات المدونة' : 'Manage blog categories'}</summary>
    {loadError && <p role="alert">{ar ? 'تعذّر تحميل التصنيفات.' : 'Could not load categories.'}</p>}
    {feedback && <p role="status" className="my-2 text-sm">{feedback}</p>}
    <form onSubmit={add} className="my-3 flex flex-wrap items-end gap-2 text-sm">
      <label>{ar ? 'الاسم بالعربية' : 'Arabic name'}<input name="ar" required maxLength={100} className="block rounded border px-2 py-1" dir="rtl" /></label>
      <label>{ar ? 'الاسم بالإنجليزية' : 'English name'}<input name="en" required maxLength={100} className="block rounded border px-2 py-1" dir="ltr" /></label>
      <button disabled={busy} className="rounded bg-blue-700 px-3 py-1 text-white">{ar ? 'إضافة تصنيف' : 'Add category'}</button>
    </form>
    <ul className="divide-y text-sm">{categories.map((category) => <li key={category.key} className="flex items-center justify-between gap-2 py-2">
      <span>{category.label[language]}</span>
      <button type="button" disabled={busy} onClick={() => void remove(category)} className="text-rose-700 underline">{ar ? 'حذف' : 'Delete'}</button>
    </li>)}</ul>
  </details>;
}
