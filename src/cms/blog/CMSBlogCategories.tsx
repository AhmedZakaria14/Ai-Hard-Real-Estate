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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAr, setEditAr] = useState('');
  const [editEn, setEditEn] = useState('');

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const name_ar = String(fields.get('ar') ?? '').trim();
    const name_en = String(fields.get('en') ?? '').trim();
    if (!name_ar || !name_en) return;
    setBusy(true);
    setFeedback('');
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

  function beginEdit(category: CatalogBlogCategory) {
    if (busy) return;
    setFeedback('');
    setEditingId(category.key);
    setEditAr(category.label.ar);
    setEditEn(category.label.en);
  }

  function cancelEdit() {
    if (busy) return;
    setEditingId(null);
    setEditAr('');
    setEditEn('');
  }

  async function saveEdit(category: CatalogBlogCategory) {
    if (busy) return;
    const name_ar = editAr.trim();
    const name_en = editEn.trim();
    if (!name_ar || !name_en) {
      setFeedback(ar ? 'أدخل الاسم بالعربية والإنجليزية قبل الحفظ.' : 'Enter both Arabic and English names before saving.');
      return;
    }
    if (name_ar === category.label.ar && name_en === category.label.en) {
      cancelEdit();
      return;
    }

    setBusy(true);
    setFeedback('');
    try {
      const { data, error } = await hardAdminClient
        .from('hard_blog_categories')
        .update({ name_ar, name_en })
        .eq('id', category.key)
        .select('id')
        .single();
      if (error || !data) throw error ?? new Error('Category update was not confirmed');
      setEditingId(null);
      setEditAr('');
      setEditEn('');
      refresh();
      setFeedback(ar ? 'تم تعديل التصنيف.' : 'Category updated.');
    } catch {
      setFeedback(ar ? 'تعذّر تعديل التصنيف. تأكد أن الاسم غير مكرر.' : 'Could not update the category. Check for duplicate names.');
    } finally { setBusy(false); }
  }

  async function remove(category: CatalogBlogCategory) {
    if (busy || !window.confirm(ar ? `حذف تصنيف «${category.label.ar}»؟` : `Delete “${category.label.en}”?`)) return;
    setBusy(true);
    setFeedback('');
    try {
      const { error } = await hardAdminClient.from('hard_blog_categories').delete().eq('id', category.key).select('id').single();
      if (error) {
        setFeedback(error.code === '23503'
          ? (ar ? 'انقل المقالات المرتبطة إلى تصنيف آخر أولاً.' : 'Move the associated articles to another category first.')
          : (ar ? 'تعذّر حذف التصنيف.' : 'Could not delete the category.'));
        return;
      }
      if (editingId === category.key) cancelEdit();
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
      <button disabled={busy} className="rounded bg-blue-700 px-3 py-1 text-white disabled:opacity-50">{ar ? 'إضافة تصنيف' : 'Add category'}</button>
    </form>
    <ul className="divide-y text-sm">{categories.map((category) => {
      const editing = editingId === category.key;
      return <li key={category.key} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
        {editing ? <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <label className="text-xs text-slate-600">{ar ? 'الاسم بالعربية' : 'Arabic name'}
            <input value={editAr} onChange={(event) => setEditAr(event.target.value)} required maxLength={100}
              className="mt-1 block w-full rounded border px-2 py-1.5 text-sm text-slate-900" dir="rtl" />
          </label>
          <label className="text-xs text-slate-600">{ar ? 'الاسم بالإنجليزية' : 'English name'}
            <input value={editEn} onChange={(event) => setEditEn(event.target.value)} required maxLength={100}
              className="mt-1 block w-full rounded border px-2 py-1.5 text-sm text-slate-900" dir="ltr" />
          </label>
        </div> : <span className="font-medium text-slate-800">{category.label[language]}</span>}
        <div className="flex items-center gap-3">
          {editing ? <>
            <button type="button" disabled={busy} onClick={() => void saveEdit(category)}
              className="font-semibold text-emerald-700 underline disabled:opacity-50">{ar ? 'حفظ' : 'Save'}</button>
            <button type="button" disabled={busy} onClick={cancelEdit}
              className="text-slate-600 underline disabled:opacity-50">{ar ? 'إلغاء' : 'Cancel'}</button>
          </> : <button type="button" disabled={busy || editingId !== null} onClick={() => beginEdit(category)}
            className="font-semibold text-blue-700 underline disabled:opacity-50">{ar ? 'تعديل' : 'Edit'}</button>}
          <button type="button" disabled={busy} onClick={() => void remove(category)}
            className="text-rose-700 underline disabled:opacity-50">{ar ? 'حذف' : 'Delete'}</button>
        </div>
      </li>;
    })}</ul>
  </details>;
}
