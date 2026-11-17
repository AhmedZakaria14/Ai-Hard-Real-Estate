import { usePropertyTypes } from '../../lib/usePropertyTypes';
import { getPropertyTypeLabel } from '../../lib/propertyTaxonomy';
import { useEffect, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadPublishedArticles, loadPublishedProjects, loadPublishedProperties, loadPublishedHvacServices, loadPublishedConstructionProjects, constructionProjectCategories, isConstructionProjectCategory, catalogTable, type PublishedConstructionProject, type PublicProperty, type CatalogCollection, type CatalogEntry } from '../../lib/db/hardCatalog';
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
  const propertyTypes = usePropertyTypes();
  const construction = collection === 'construction_projects';
  const hvac = collection === 'hvac_services';
  const heading = construction ? 'مشاريع الإنشاءات المنشورة' : hvac ? 'خدمات التكييف المنشورة'
    : projects ? 'المشاريع العقارية المنشورة' : properties ? 'العقارات المنشورة' : 'المقالات المنشورة';
  const [showArchived, setShowArchived] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [creating, setCreating] = useState(false);
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
    if (creating && (!(imageFile instanceof File) || imageFile.size === 0)) {
      setNotice(construction ? 'اختر صورة للمشروع الجديد.' : 'اختر صورة للخدمة الجديدة.');
      return;
    }
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
        const type = field('propertyType');
        if (type !== content.type && !propertyTypes.some((item) => item.id === type && item.active)) {
          setNotice('اختر نوع عقار مفعّلًا.');
          return;
        }
        content.type = type;
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
    if (construction) {
      const category = field('projectCategory');
      if (!isConstructionProjectCategory(category)) {
        setNotice('اختر تصنيف المشروع.');
        return;
      }
      Object.assign(content, {
        category, year: field('projectYear'), buaM2: Number(field('projectArea')),
        durationMonths: Number(field('projectDuration')),
        locationAr: field('locationAr'), locationEn: field('locationEn'),
        cityAr: field('cityAr'), cityEn: field('cityEn'),
      });
    }
    if (!title.ar || !title.en) {
      setNotice('أدخل العنوان بالعربية والإنجليزية.');
      return;
    }
    setNotice('');
    setSaving(true);
    try {
      if (!creating) {
      const { data: current, error: readError } = await client.from(catalogTable(collection))
        .select('updated_at').eq('collection', collection).eq('id', selected.id).single();
      if (readError || current.updated_at !== selected.updated_at) {
        setNotice('تغيّر السجل منذ فتحه. أعد تحميل الصفحة قبل الحفظ.');
        return;
      }
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
      const table = client.from(catalogTable(collection));
      const { data, error } = creating
        ? await table.insert({ collection, id: selected.id, content }).select('id,content,updated_at').single()
        : await table.update({ content, updated_at: new Date().toISOString() })
        .eq('collection', collection).eq('id', selected.id)
        .eq('updated_at', selected.updated_at)
        .select('id,content,updated_at').maybeSingle();
      if (error) throw error;
      if (!data) {
        setNotice('تغيّر السجل أثناء الحفظ. أعد تحميل الصفحة قبل المحاولة مرة أخرى.');
        return;
      }
      setEntries((items) => creating ? [...items, data] : items.map((item) => item.id === data.id ? data : item));
      setCreating(false);
      setSelected(null);
      setNotice('حُفظ السجل ونُشر التعديل.');
    } catch {
      setNotice('تعذر حفظ السجل أو رفع الصورة. لم يتم تأكيد النشر.');
    } finally {
      setSaving(false);
    }
  }

  const selectedPropertyType = selected && 'price' in selected.content ? selected.content.type : '';
  const inputClass = 'block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none';
  return <section className="space-y-4" aria-label={heading}>
    <h2 className="text-lg font-extrabold tracking-tight text-slate-900">{heading}</h2>
    <label className="block text-sm"><input type="checkbox" checked={showArchived} disabled={saving}
      onChange={(event) => { setShowArchived(event.target.checked); setCreating(false); setSelected(null); setNotice(''); }} /> عرض السجلات المؤرشفة</label>
    {(hvac || construction) && !showArchived && <button type="button" disabled={saving} className="rounded bg-blue-700 px-3 py-2 text-white" onClick={() => {
      const id = (construction ? 'project-' : 'svc-') + crypto.randomUUID();
      const sortOrder = Math.max(0, ...entries.map(({ content }) => 'sortOrder' in content ? Number(content.sortOrder) || 0 : 0)) + 1;
      const shared = { id, titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', image: '' };
      const content: PublishedConstructionProject | HVACService = construction
        ? { ...shared, category: 'residential', status: 'in-progress', cityAr: '', cityEn: '',
          locationAr: '', locationEn: '', buaM2: 0, galleryImages: [] }
        : { ...shared, slug: id, active: true, sortOrder };
      setSelected({ id, updated_at: '', content });
      setCreating(true);
      setNotice('');
    }}>{construction ? 'إضافة مشروع مقاولات' : 'إضافة خدمة تكييف'}</button>}
    {notice && <p role="status">{notice}</p>}
    <ul className="space-y-2">{entries.map((article) => <li key={article.id} className="flex flex-wrap items-center gap-2">
      <button type="button" disabled={saving || showArchived} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-40"
        onClick={() => { setCreating(false); setSelected(article); setNotice(''); }}>{'titleAr' in article.content ? article.content.titleAr : article.content.title.ar}</button>
      <button type="button" disabled={saving} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-40 text-sm"
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
      {construction && 'buaM2' in selected.content && <><label>تصنيف المشروع<select name="projectCategory" required className={inputClass}
        defaultValue={'category' in selected.content && isConstructionProjectCategory(selected.content.category) ? selected.content.category : 'residential'}>
        {Object.entries(constructionProjectCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select></label>
        <label>سنة المشروع<input name="projectYear" inputMode="numeric" className={inputClass} defaultValue={selected.content.year ?? ''} /></label>
        <label>المساحة المبنية (م²)<input name="projectArea" type="number" min="0" step="any" className={inputClass} defaultValue={selected.content.buaM2} /></label>
        <label>مدة المشروع بالأشهر<input name="projectDuration" type="number" min="0" className={inputClass} defaultValue={selected.content.durationMonths ?? ''} /></label>
        <label>الموقع بالعربية<input name="locationAr" className={inputClass} defaultValue={selected.content.locationAr} /></label>
        <label>الموقع بالإنجليزية<input name="locationEn" className={inputClass} defaultValue={selected.content.locationEn} /></label>
        <label>المدينة بالعربية<input name="cityAr" className={inputClass} defaultValue={selected.content.cityAr} /></label>
        <label>المدينة بالإنجليزية<input name="cityEn" className={inputClass} defaultValue={selected.content.cityEn} /></label>
      </>}
      {'price' in selected.content && <label>نوع العقار<select name="propertyType" required className={inputClass} defaultValue={selectedPropertyType}>
        {!propertyTypes.some((item) => item.id === selectedPropertyType) && <option value={selectedPropertyType}>{getPropertyTypeLabel(selectedPropertyType, 'ar', propertyTypes)}</option>}
        {propertyTypes.filter((item) => item.active || item.id === selectedPropertyType).map((item) => <option key={item.id} value={item.id}>{item.nameAr}</option>)}
      </select></label>}
      {'price' in selected.content && <label>السعر بالريال<input name="price" type="number" min="0" step="0.01" required className={inputClass} defaultValue={selected.content.price.sar} /></label>}
      {'startingPriceSAR' in selected.content && <>
        <label>السعر الابتدائي<input name="price" className={inputClass} defaultValue={selected.content.startingPriceSAR} /></label>
        <label>نسبة الإنجاز<input name="progress" type="number" min="0" max="100" required className={inputClass} defaultValue={selected.content.progressPercentage ?? 0} /></label>
      </>}
      {('images' in selected.content ? selected.content.images[0] : selected.content.image) && <img src={'images' in selected.content ? selected.content.images[0] : selected.content.image} alt="الصورة الحالية" className="max-h-40 w-fit rounded" />}
      <label>{creating ? 'الصورة الرئيسية' : 'استبدال الصورة المنشورة'}<input className={inputClass} type="file" name="image" accept={Object.keys(imageTypes).join(',')} /></label>
      <button type="submit" disabled={saving} className="w-fit rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-40">{saving ? 'جارٍ الحفظ…' : 'حفظ ونشر'}</button>
    </form>}
  </section>;
}
