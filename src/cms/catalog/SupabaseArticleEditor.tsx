import { useEffect, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadPublishedArticles, loadPublishedProjects, type CatalogCollection, type CatalogEntry } from '../../lib/db/hardCatalog';
import type { BlogPost, Project } from '../../types';

type Entry = CatalogEntry<BlogPost | Project>;

const imageTypes: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/gif': 'gif', 'image/avif': 'avif',
};

export default function SupabaseArticleEditor({ client, collection = 'blog_posts' }: {
  client: SupabaseClient;
  collection?: CatalogCollection;
}) {
  const projects = collection === 'projects';
  const heading = projects ? 'المشاريع العقارية المنشورة' : 'المقالات المنشورة';
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = projects ? loadPublishedProjects : loadPublishedArticles;
    load(controller.signal).then((items) => {
      if (!controller.signal.aborted) setEntries(items);
    }).catch(() => {
      if (!controller.signal.aborted) setNotice('تعذر تحميل ' + heading + '.');
    });
    return () => controller.abort();
  }, [heading, projects]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || saving) return;
    const fields = new FormData(event.currentTarget);
    const field = (name: string) => String(fields.get(name) ?? '').trim();
    const imageFile = fields.get('image');
    const content = { ...selected.content };
    content.title = { ar: field('titleAr'), en: field('titleEn') };
    if ('description' in content) {
      content.description = { ar: field('descriptionAr'), en: field('descriptionEn') };
      content.startingPriceSAR = field('price');
      content.progressPercentage = Number(field('progress'));
      content.lastUpdated = new Date().toISOString().slice(0, 10);
    } else {
      content.excerpt = { ar: field('excerptAr'), en: field('excerptEn') };
      content.content = { ar: field('contentAr'), en: field('contentEn') };
    }
    if (!content.title.ar || !content.title.en) {
      setNotice('أدخل العنوان بالعربية والإنجليزية.');
      return;
    }
    setNotice('');
    setSaving(true);
    try {
      const { data: current, error: readError } = await client.from('hard_catalog')
        .select('updated_at').eq('collection', collection).eq('id', selected.id).single();
      if (readError || current.updated_at !== selected.updated_at) {
        setNotice('تغيّر السجل منذ فتحه. أعد تحميل الصفحة قبل الحفظ.');
        return;
      }
      if (imageFile instanceof File && imageFile.size > 0) {
        const extension = imageTypes[imageFile.type];
        if (!extension || imageFile.size > 15 * 1024 * 1024) {
          setNotice('اختر صورة مدعومة لا يزيد حجمها عن 15 ميغابايت.');
          return;
        }
        const path = collection + '/' + crypto.randomUUID() + '.' + extension;
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
        .eq('collection', collection).eq('id', selected.id)
        .eq('updated_at', selected.updated_at)
        .select('id,content,updated_at').maybeSingle();
      if (error) throw error;
      if (!data) {
        setNotice('تغيّر السجل أثناء الحفظ. أعد تحميل الصفحة قبل المحاولة مرة أخرى.');
        return;
      }
      setEntries((items) => items.map((item) => item.id === data.id ? data : item));
      setSelected(null);
      setNotice('حُفظ السجل ونُشر التعديل.');
    } catch {
      setNotice('تعذر حفظ السجل أو رفع الصورة. لم يتم تأكيد النشر.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'block w-full rounded border p-2';
  return <section className="space-y-4" aria-label={heading}>
    <h2 className="text-xl font-bold">{heading}</h2>
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
          {'description' in selected.content ? (
            <label>الوصف ({label})<textarea name={'description' + suffix} lang={lang} dir="auto" className={inputClass} defaultValue={selected.content.description[lang]} /></label>
          ) : <>
            <label>الملخص ({label})<textarea name={'excerpt' + suffix} lang={lang} dir="auto" className={inputClass} defaultValue={selected.content.excerpt[lang]} /></label>
            <label>النص ({label})<textarea name={'content' + suffix} lang={lang} dir="auto" rows={6} className={inputClass} defaultValue={selected.content.content[lang]} /></label>
          </>}
        </div>;
      })}
      {'description' in selected.content && <>
        <label>السعر الابتدائي<input name="price" className={inputClass} defaultValue={selected.content.startingPriceSAR} /></label>
        <label>نسبة الإنجاز<input name="progress" type="number" min="0" max="100" required className={inputClass} defaultValue={selected.content.progressPercentage ?? 0} /></label>
      </>}
      {selected.content.image && <img src={selected.content.image} alt="الصورة الحالية" className="max-h-40 w-fit rounded" />}
      <label>استبدال الصورة المنشورة<input className={inputClass} type="file" name="image" accept={Object.keys(imageTypes).join(',')} /></label>
      <button type="submit" disabled={saving} className="w-fit rounded bg-slate-900 px-4 py-2 text-white">{saving ? 'جارٍ الحفظ…' : 'حفظ ونشر'}</button>
    </form>}
  </section>;
}
