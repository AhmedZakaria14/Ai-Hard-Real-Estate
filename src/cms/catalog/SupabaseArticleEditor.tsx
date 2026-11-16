import { useEffect, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadPublishedArticles, loadPublishedProjects, loadPublishedProperties, loadPublishedHvacServices, loadPublishedConstructionProjects, catalogTable, type PublishedConstructionProject, type PublicProperty, type CatalogCollection, type CatalogEntry } from '../../lib/db/hardCatalog';
import type { HVACService } from '../../hvac/types';
import type { BlogPost, Project } from '../../types';

type Entry = CatalogEntry<BlogPost | Project | PublicProperty | HVACService | PublishedConstructionProject>;

const imageTypes: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/gif': 'gif', 'image/avif': 'avif',
};

export default function SupabaseArticleEditor({ client, collection = 'blog_posts' }: {
  client: SupabaseClient;
  collection?: CatalogCollection;
}) {
  const projects = collection === 'projects';
  const properties = collection === 'properties';
  const construction = collection === 'construction_projects';
  const hvac = collection === 'hvac_services';
  const heading = construction ? 'مشاريع الإنشاءات المنشورة' : hvac ? 'خدمات التكييف المنشورة'
    : projects ? 'المشاريع العقارية المنشورة' : properties ? 'العقارات المنشورة' : 'المقالات المنشورة';
  const [showArchived, setShowArchived] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = construction ? loadPublishedConstructionProjects : hvac ? loadPublishedHvacServices : projects ? loadPublishedProjects : properties ? loadPublishedProperties : loadPublishedArticles;
    setEntries([]);
    async function list() {
      try {
        if (!showArchived) {
          const items = await load(controller.signal);
          if (!controller.signal.aborted) setEntries(items);
          return;
        }
        const { data, error } = await client.from(catalogTable(collection)).select('id,content,updated_at')
          .eq('collection', collection).not('archived_at','is',null).order('archived_at',{ascending:false})
          .abortSignal(controller.signal);
        if (error) throw error;
        if (!controller.signal.aborted) setEntries(data ?? []);
      } catch {
        if (!controller.signal.aborted) setNotice('تعذر تحميل ' + heading + '.');
      }
    }
    void list();
    return () => controller.abort();
  }, [heading, construction, hvac, projects, properties, showArchived, client, collection]);

  async function toggleArchive(entry: Entry) {
    if (saving) return;
    setSaving(true);
    setNotice('');
    try {
      const { error } = await client.from(catalogTable(collection))
        .update({ archived_at: showArchived ? null : new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('collection',collection).eq('id',entry.id).eq('updated_at',entry.updated_at).select('id').single();
      if (error) throw error;
      setEntries((previous) => previous.filter((item) => item.id !== entry.id));
      if (selected?.id === entry.id) setSelected(null);
      setNotice(showArchived ? 'تمت استعادة السجل ونشره.' : 'تمت الأرشفة وإخفاء السجل عن الزوار.');
    } catch {
      setNotice('تعذر تغيير حالة الأرشفة. أعد فتح القائمة وحاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || saving) return;
    const fields = new FormData(event.currentTarget);
    const field = (name: string) => String(fields.get(name) ?? '').trim();
    const imageFile = fields.get('image');
    const content = { ...selected.content };
    const title = { ar: field('titleAr'), en: field('titleEn') };
    if ('titleAr' in content) {
      content.titleAr = title.ar;
      content.titleEn = title.en;
      content.descriptionAr = field('descriptionAr');
      content.descriptionEn = field('descriptionEn');
    } else if ('description' in content) {
      content.title = title;
      content.description = { ar: field('descriptionAr'), en: field('descriptionEn') };
      if ('price' in content) {
        const sar = Number(field('price'));
        content.price = { ...content.price, sar, formattedSAR: new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(sar) };
      } else {
        content.startingPriceSAR = field('price');
        content.progressPercentage = Number(field('progress'));
        content.lastUpdated = new Date().toISOString().slice(0, 10);
      }
    } else {
      content.title = title;
      content.excerpt = { ar: field('excerptAr'), en: field('excerptEn') };
      content.content = { ar: field('contentAr'), en: field('contentEn') };
    }
    if (!title.ar || !title.en) {
      setNotice('أدخل العنوان بالعربية والإنجليزية.');
      return;
    }
    setNotice('');
    setSaving(true);
    try {
      const { data: current, error: readError } = await client.from(catalogTable(collection))
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
        const url = bucket.getPublicUrl(path).data.publicUrl;
        if ('images' in content) content.images = [url, ...content.images.slice(1)];
        else content.image = url;
      }
      const { data, error } = await client.from(catalogTable(collection))
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
    <label className="block text-sm"><input type="checkbox" checked={showArchived} disabled={saving}
      onChange={(event) => { setShowArchived(event.target.checked); setSelected(null); setNotice(''); }} /> عرض السجلات المؤرشفة</label>
    {notice && <p role="status">{notice}</p>}
    <ul className="space-y-2">{entries.map((article) => <li key={article.id} className="flex flex-wrap items-center gap-2">
      <button type="button" disabled={saving || showArchived} className="rounded border px-3 py-1"
        onClick={() => { setSelected(article); setNotice(''); }}>{'titleAr' in article.content ? article.content.titleAr : article.content.title.ar}</button>
      <button type="button" disabled={saving} className="rounded border px-3 py-1 text-sm"
        onClick={() => void toggleArchive(article)}>{showArchived ? 'استعادة ونشر' : 'أرشفة'}</button>
    </li>)}</ul>
    {selected && <form key={selected.id} onSubmit={save} className="grid gap-3 rounded border p-4">
      {(['Ar', 'En'] as const).map((suffix) => {
        const lang = suffix === 'Ar' ? 'ar' : 'en';
        const label = suffix === 'Ar' ? 'العربية' : 'الإنجليزية';
        return <div key={suffix} className="grid gap-2">
          <label>العنوان ({label})<input required name={'title' + suffix} lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={inputClass} defaultValue={'titleAr' in selected.content ? (lang === 'ar' ? selected.content.titleAr : selected.content.titleEn) : selected.content.title[lang]} /></label>
          {'descriptionAr' in selected.content ? (
            <label>الوصف ({label})<textarea name={'description' + suffix} lang={lang} dir="auto" className={inputClass} defaultValue={lang === 'ar' ? selected.content.descriptionAr : selected.content.descriptionEn} /></label>
          ) : 'description' in selected.content ? (
            <label>الوصف ({label})<textarea name={'description' + suffix} lang={lang} dir="auto" className={inputClass} defaultValue={selected.content.description[lang]} /></label>
          ) : <>
            <label>الملخص ({label})<textarea name={'excerpt' + suffix} lang={lang} dir="auto" className={inputClass} defaultValue={selected.content.excerpt[lang]} /></label>
            <label>النص ({label})<textarea name={'content' + suffix} lang={lang} dir="auto" rows={6} className={inputClass} defaultValue={selected.content.content[lang]} /></label>
          </>}
        </div>;
      })}
      {'price' in selected.content && <label>السعر بالريال<input name="price" type="number" min="0" step="0.01" required className={inputClass} defaultValue={selected.content.price.sar} /></label>}
      {'startingPriceSAR' in selected.content && <>
        <label>السعر الابتدائي<input name="price" className={inputClass} defaultValue={selected.content.startingPriceSAR} /></label>
        <label>نسبة الإنجاز<input name="progress" type="number" min="0" max="100" required className={inputClass} defaultValue={selected.content.progressPercentage ?? 0} /></label>
      </>}
      {('images' in selected.content ? selected.content.images[0] : selected.content.image) && <img src={'images' in selected.content ? selected.content.images[0] : selected.content.image} alt="الصورة الحالية" className="max-h-40 w-fit rounded" />}
      <label>استبدال الصورة المنشورة<input className={inputClass} type="file" name="image" accept={Object.keys(imageTypes).join(',')} /></label>
      <button type="submit" disabled={saving} className="w-fit rounded bg-slate-900 px-4 py-2 text-white">{saving ? 'جارٍ الحفظ…' : 'حفظ ونشر'}</button>
    </form>}
  </section>;
}
