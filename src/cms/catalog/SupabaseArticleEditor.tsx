import { useEffect, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadPublishedArticles, type CatalogArticle } from '../../lib/db/hardCatalog';

const imageTypes: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/gif': 'gif', 'image/avif': 'avif',
};

export default function SupabaseArticleEditor({ client }: { client: SupabaseClient }) {
  const [entries, setEntries] = useState<CatalogArticle[]>([]);
  const [selected, setSelected] = useState<CatalogArticle | null>(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    loadPublishedArticles(controller.signal).then(setEntries).catch(() => {
      if (!controller.signal.aborted) setNotice('تعذر تحميل المقالات.');
    });
    return () => controller.abort();
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || saving) return;
    const fields = new FormData(event.currentTarget);
    const field = (name: string) => String(fields.get(name) ?? '').trim();
    const imageFile = fields.get('image');
    const content = { ...selected.content };
    for (const name of ['title', 'excerpt', 'content'] as const) {
      content[name] = { ar: field(name + 'Ar'), en: field(name + 'En') };
    }
    if (!content.title.ar || !content.title.en) {
      setNotice('أدخل عنوان المقال بالعربية والإنجليزية.');
      return;
    }
    setNotice('');
    setSaving(true);
    try {
      const { data: current, error: readError } = await client.from('hard_catalog')
        .select('updated_at').eq('collection', 'blog_posts').eq('id', selected.id).single();
      if (readError || current.updated_at !== selected.updated_at) {
        setNotice('تغيّر المقال منذ فتحه. أعد تحميل الصفحة قبل الحفظ.');
        return;
      }
      if (imageFile instanceof File && imageFile.size > 0) {
        const extension = imageTypes[imageFile.type];
        if (!extension || imageFile.size > 15 * 1024 * 1024) {
          setNotice('اختر صورة مدعومة لا يزيد حجمها عن 15 ميغابايت.');
          return;
        }
        const path = 'blog_posts/' + crypto.randomUUID() + '.' + extension;
        const bucket = client.storage.from('hard-public-catalog');
        const { error: uploadError } = await bucket.upload(path, imageFile, {
          contentType: imageFile.type,
          cacheControl: '31536000',
          upsert: false,
        });
        if (uploadError) throw uploadError;
        content.image = bucket.getPublicUrl(path).data.publicUrl;
      }
      const { data, error } = await client.from('hard_catalog')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('collection', 'blog_posts').eq('id', selected.id)
        .eq('updated_at', selected.updated_at)
        .select('id,content,updated_at').maybeSingle();
      if (error) throw error;
      if (!data) {
        setNotice('تغيّر المقال أثناء الحفظ. أعد تحميل الصفحة قبل المحاولة مرة أخرى.');
        return;
      }
      setEntries((items) => items.map((item) => item.id === data.id ? data : item));
      setSelected(null);
      setNotice('حُفظ المقال ونُشر التعديل.');
    } catch {
      setNotice('تعذر حفظ المقال أو رفع الصورة. لم يتم تأكيد النشر.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'block w-full rounded border p-2';
  return <section className="space-y-4" aria-label="إدارة المقالات المنشورة">
    <h2 className="text-xl font-bold">المقالات المنشورة</h2>
    {notice && <p role="status">{notice}</p>}
    <ul className="space-y-2">{entries.map((article) => <li key={article.id}>
      <button type="button" disabled={saving} className="rounded border px-3 py-1"
        onClick={() => { setSelected(article); setNotice(''); }}>{article.content.title.ar}</button>
    </li>)}</ul>
    {selected && <form key={selected.id} onSubmit={save} className="grid gap-3 rounded border p-4">
      {(['Ar', 'En'] as const).map((suffix) => {
        const lang = suffix === 'Ar' ? 'ar' : 'en';
        const label = suffix === 'Ar' ? 'العربية' : 'الإنجليزية';
        return <div key={suffix} className="grid gap-2">
          <label>العنوان ({label})<input required name={'title' + suffix} lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={inputClass} defaultValue={selected.content.title[lang]} /></label>
          <label>الملخص ({label})<textarea name={'excerpt' + suffix} lang={lang} dir="auto" className={inputClass} defaultValue={selected.content.excerpt[lang]} /></label>
          <label>النص ({label})<textarea name={'content' + suffix} lang={lang} dir="auto" rows={6} className={inputClass} defaultValue={selected.content.content[lang]} /></label>
        </div>;
      })}
      {selected.content.image && <img src={selected.content.image} alt="الصورة الحالية" className="max-h-40 w-fit rounded" />}
      <label>استبدال صورة المقال المنشور<input className={inputClass} type="file" name="image" accept={Object.keys(imageTypes).join(',')} /></label>
      <button type="submit" disabled={saving} className="w-fit rounded bg-slate-900 px-4 py-2 text-white">{saving ? 'جارٍ الحفظ…' : 'حفظ ونشر'}</button>
    </form>}
  </section>;
}
