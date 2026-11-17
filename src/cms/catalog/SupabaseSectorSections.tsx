import { defaultPageMedia, pageMediaSection } from '../../lib/pageMedia';
import { defaultGroupPortal, groupPortalSection } from '../../lib/groupPortalContent';
import { defaultPropertyTypes, propertyTypesSection, validPropertyTypes } from '../../lib/propertyTaxonomy';
import { defaultRealEstateHero, defaultRealEstateServiceMedia, realEstateHeroSection, realEstateServiceMediaSection } from '../../lib/realEstateHomeContent';
import { useEffect, useState, type FormEvent } from 'react';
import { DEFAULT_HERO_CONTENT, DEFAULT_COMPANY_CONTENT, DEFAULT_WORK_STAGES, DEFAULT_OFFICES } from '../../construction/services/sectionDefaults';
import { DEFAULT_HVAC_HERO, DEFAULT_HVAC_HOURS_CONTACT, DEFAULT_HVAC_BOOKING_COPY, DEFAULT_HVAC_CITIES } from '../../hvac/services/sectionDefaults';
import { readSectorSection, saveSectorSection, type SectorSection } from '../../lib/db/hardSectorSections';
import { INITIAL_SERVICES } from '../../construction/data/seedData';
import { initialFaqs, initialGallery, initialTestimonials, yearRoundChecklist } from '../../hvac/data/initialData';
import { uploadMediaAsset } from '../../lib/cmsMediaLibrary';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type FieldPath = (string | number)[];
const sections: { target: SectorSection; title: string; fallback: object }[] = [
  { target: realEstateHeroSection, title: 'العقارات — صورة الهيرو', fallback: defaultRealEstateHero },
  { target: realEstateServiceMediaSection, title: 'العقارات — صور وأرقام الخدمات', fallback: defaultRealEstateServiceMedia },
  { target: pageMediaSection, title: 'صور صفحات القطاعات والصور الافتراضية', fallback: defaultPageMedia },
  { target: propertyTypesSection, title: 'العقارات — أنواع العقارات', fallback: defaultPropertyTypes },
  { target: groupPortalSection, title: 'المجموعة — نصوص وصور البوابة', fallback: defaultGroupPortal },
  { target: { sector: 'construction', key: 'services' }, title: 'المقاولات — بطاقات الخدمات', fallback: INITIAL_SERVICES },
  { target: { sector: 'construction', key: 'hero' }, title: 'الإنشاءات — الصفحة الرئيسية', fallback: DEFAULT_HERO_CONTENT },
  { target: { sector: 'construction', key: 'company' }, title: 'الإنشاءات — عن الشركة', fallback: DEFAULT_COMPANY_CONTENT },
  { target: { sector: 'construction', key: 'stages' }, title: 'الإنشاءات — مراحل العمل', fallback: DEFAULT_WORK_STAGES },
  { target: { sector: 'construction', key: 'offices' }, title: 'الإنشاءات — المقر الرئيسي والخريطة', fallback: DEFAULT_OFFICES },
  { target: { sector: 'hvac', key: 'faq' }, title: 'التكييف — الأسئلة الشائعة', fallback: initialFaqs },
  { target: { sector: 'hvac', key: 'hero' }, title: 'التكييف — الصفحة الرئيسية', fallback: DEFAULT_HVAC_HERO },
  { target: { sector: 'hvac', key: 'hours_contact' }, title: 'التكييف — الاتصال وساعات العمل', fallback: DEFAULT_HVAC_HOURS_CONTACT },
  { target: { sector: 'hvac', key: 'booking_copy' }, title: 'التكييف — نصوص الحجز', fallback: DEFAULT_HVAC_BOOKING_COPY },
  { target: { sector: 'hvac', key: 'work_gallery' }, title: 'التكييف — معرض الأعمال والفئات', fallback: initialGallery },
  { target: { sector: 'hvac', key: 'maintenance_guide' }, title: 'التكييف — دليل الصيانة الدورية', fallback: yearRoundChecklist },
  { target: { sector: 'hvac', key: 'reviews' }, title: 'التكييف — آراء العملاء', fallback: initialTestimonials },
  { target: { sector: 'hvac', key: 'service_areas' }, title: 'التكييف — مناطق الخدمة', fallback: DEFAULT_HVAC_CITIES },
];
const labels: Record<string, string> = {
  constructionHeroImage: 'غلاف صفحة المقاولات', constructionAboutImage: 'صورة التعريف بالمقاولات',
  hvacHeroImage: 'غلاف صفحة التكييف', propertyPlaceholderImage: 'الصورة الافتراضية للعقار والمقال',
  questionAr: 'السؤال بالعربية', questionEn: 'السؤال بالإنجليزية', answerAr: 'الإجابة بالعربية', answerEn: 'الإجابة بالإنجليزية',
  aboutImage: 'صورة صفحة من نحن', projectPlaceholderImage: 'الصورة الافتراضية للمشاريع',
  realestate: 'قطاع العقارات', construction: 'قطاع المقاولات', hvac: 'قطاع التكييف',
  titleAr: 'العنوان بالعربية', titleEn: 'العنوان بالإنجليزية',
  introAr: 'المقدمة بالعربية', introEn: 'المقدمة بالإنجليزية',
  footerAr: 'التذييل بالعربية', footerEn: 'التذييل بالإنجليزية',
  descriptionAr: 'الوصف بالعربية', descriptionEn: 'الوصف بالإنجليزية', image: 'رابط الصورة',
  badgeAr: 'العبارة العلوية بالعربية', badgeEn: 'العبارة العلوية بالإنجليزية',
  headlineAr: 'العنوان بالعربية', headlineEn: 'العنوان بالإنجليزية',
  subtitleAr: 'الوصف بالعربية', subtitleEn: 'الوصف بالإنجليزية',
  'serv-1': 'الوساطة العقارية', 'serv-2': 'التسويق العقاري', 'serv-3': 'الاستشارات الاستثمارية',
  stats: 'الأرقام المعروضة فوق الصورة', value: 'القيمة',
  bgImageUrl: 'رابط صورة الغلاف', googleMapsUrl: 'رابط الخريطة',
  officeEmail: 'البريد الإلكتروني للمكتب', emergencyPhone: 'هاتف الطوارئ',
  cityNameAr: 'اسم المدينة بالعربية', cityNameEn: 'اسم المدينة بالإنجليزية',
  regionAr: 'المنطقة بالعربية', regionEn: 'المنطقة بالإنجليزية',
  lat: 'خط العرض', lng: 'خط الطول', nameAr: 'اسم المقر بالعربية', nameEn: 'اسم المقر بالإنجليزية',
  addressAr: 'العنوان بالعربية', addressEn: 'العنوان بالإنجليزية',
  responseTimeMin: 'مدة الاستجابة بالدقائق', isPrimaryArea: 'منطقة رئيسية',
  whatsappNumber: 'رقم واتساب', active: 'مفعّل',
};
const inputStyle = 'block w-full rounded border px-2 py-1';
const fixedKeys = new Set(['id', 'isPublished']);
const urlKey = /(?:url|image)$/i;
const publicAssetUrl = /^(https:\/\/|\/(?!\/))/i;

function invalidLink(data: Json, key = ''): boolean {
  if (typeof data === 'string' && urlKey.test(key)) {
    return Boolean(data && (!publicAssetUrl.test(data) || /[\\\s]|\/object\/sign\//i.test(data)));
  }
  if (data && typeof data === 'object') return Object.entries(data).some(([k, v]) => invalidLink(v, k));
  return false;
}

export default function SupabaseSectorSections() {
  const [active, setActive] = useState(0);
  const [form, setForm] = useState<Json | undefined>();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const section = sections[active];
  const editingTypes = section.target.key === 'property_types';
  const editingPortal = section.target.sector === 'portal';
  const editingList = (editingTypes || section.target.sector === 'hvac') && Array.isArray(section.fallback);
  const itemLabel = editingTypes ? 'نوع عقار' : section.target.key === 'faq' ? 'سؤال' : section.target.key === 'work_gallery' ? 'عمل' : section.target.key === 'reviews' ? 'تقييم' : section.target.key === 'maintenance_guide' ? 'خطوة' : 'مدينة';
  const editingCities = section.target.sector === 'hvac' && section.target.key === 'service_areas';

  useEffect(() => {
    const controller = new AbortController();
    setForm(undefined);
    setMessage('');
    setLoading(true);
    readSectorSection<Json>(section.target, controller.signal).then((body) => {
      if (!controller.signal.aborted) setForm(body ?? JSON.parse(JSON.stringify(section.fallback)));
    }).catch(() => {
      if (!controller.signal.aborted) setMessage('تعذر تحميل القسم. أعد فتحه للمحاولة مرة أخرى.');
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [section]);

  function edit(path: FieldPath, value: Json) {
    setForm((current) => {
      if (current === undefined) return current;
      const next = structuredClone(current);
      let node: Record<string | number, Json> = next as Record<string | number, Json>;
      for (const key of path.slice(0, -1)) node = node[key] as Record<string | number, Json>;
      node[path[path.length - 1]] = value;
      return next;
    });
  }

  async function upload(file: File, path: FieldPath) {
    if (!file.type.startsWith('image/')) return;
    setBusy(true);
    setMessage('');
    try {
      const asset = await uploadMediaAsset({ file, sector: section.target.sector });
      edit(path, asset.downloadUrl);
      setMessage('تم رفع الصورة. اضغط حفظ ونشر لتظهر على الموقع.');
    } catch {
      setMessage('تعذر رفع الصورة.');
    } finally {
      setBusy(false);
    }
  }

  function renderField(value: Json, path: FieldPath = []) {
    const key = String(path.at(-1) ?? '');
    if (fixedKeys.has(key) || value === null) return null;
    if (typeof value === 'object') {
      const fields = Object.entries(value).map(([child, item]) => renderField(item, [...path, child]));
      return path.length ? <fieldset key={path.join('.')} className="space-y-3 rounded border p-3">
        <legend className="px-2 text-sm font-semibold">{Array.isArray(value) ? labels[key] ?? key : /^\d+$/.test(key) ? 'العنصر ' + (Number(key) + 1) : labels[key] ?? key}</legend>
        {fields}
      </fieldset> : fields;
    }
    const localizedName = key === 'nameAr' ? 'بالعربية' : key === 'nameEn' ? 'بالإنجليزية' : null;
    const nameLabel = localizedName && editingTypes ? 'اسم النوع ' + localizedName
      : localizedName && editingPortal ? 'اسم القطاع ' + localizedName : undefined;
    const label = nameLabel ?? labels[key] ?? (/^\d+$/.test(key) ? 'البند ' + (Number(key) + 1) : key);
    return <div key={path.join('.')} className="space-y-1">
      <label className="block text-sm font-medium">
        {label}{' '}
        {typeof value === 'boolean' ? <input type="checkbox" checked={value} onChange={(event) => edit(path, event.target.checked)} />
          : typeof value === 'number' ? <input type="number" step="any" min={key === 'lat' ? -90 : key === 'lng' ? -180 : undefined} max={key === 'lat' ? 90 : key === 'lng' ? 180 : undefined} required className={inputStyle} value={value} onChange={(event) => edit(path, Number(event.target.value))} />
          : <textarea className={inputStyle} rows={value.length > 80 ? 3 : 1} dir="auto" required={editingCities && (key === 'cityNameAr' || key === 'cityNameEn')} value={value} onChange={(event) => edit(path, event.target.value)} />}
      </label>
      {(key === 'bgImageUrl' || /image$/i.test(key)) && <label className="text-sm">رفع الصورة <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void upload(file, path);
      }} /></label>}
    </div>;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || typeof form !== 'object' || busy) return;
    if (editingCities && (!Array.isArray(form) || form.some((city) =>
      !city || typeof city !== 'object' || Array.isArray(city) ||
      typeof city.cityNameAr !== 'string' || !city.cityNameAr.trim() ||
      typeof city.cityNameEn !== 'string' || !city.cityNameEn.trim()
    ))) {
      setMessage('أدخل اسم كل مدينة بالعربية والإنجليزية.');
      return;
    }
    if (editingTypes && !validPropertyTypes(form)) {
      setMessage('أدخل اسم كل نوع بالعربية والإنجليزية وأبقِ نوعًا واحدًا على الأقل مفعّلًا.');
      return;
    }
    if (invalidLink(form)) {
      setMessage('استخدم روابط عامة ثابتة عبر HTTPS أو روابط نسبية من الموقع.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await saveSectorSection(section.target, form);
      setMessage('حُفظ القسم ونُشر على الموقع.');
    } catch {
      setMessage('تعذر حفظ القسم. لم يتم تأكيد النشر.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="space-y-4">
    <h2 className="text-xl font-bold">محتوى قطاعات هارد</h2>
    <label className="block">القسم <select disabled={busy} value={active} onChange={(event) => setActive(Number(event.target.value))} className={inputStyle}>
      {sections.map((item, index) => <option value={index} key={item.title}>{item.title}</option>)}
    </select></label>
    {section.target.sector === 'construction' && section.target.key === 'offices' && (
      <p className="text-sm text-slate-600">لتثبيت الدبوس، أدخل خط العرض والطول للمقر ثم اضغط «حفظ ونشر». إذا تركت القيمتين صفرًا، تبحث الخريطة باستخدام عنوان المقر.</p>
    )}
    {editingTypes && <p className="text-sm text-slate-600">لإزالة نوع من القوائم، ألغِ تفعيله. يظل الاسم محفوظًا للعقارات والطلبات السابقة.</p>}
    {message && <p role="status">{message}</p>}
    {loading && <p role="status">جارٍ تحميل القسم…</p>}
    {form !== undefined && <form key={active} onSubmit={save}>
      <fieldset disabled={busy} className="grid gap-4">
        {editingList && Array.isArray(form) ? <>
          {form.map((city, index) => (
            <div key={city && typeof city === 'object' && !Array.isArray(city) ? String(city.id ?? index) : index} className="space-y-2">
              {renderField(city, [index])}
              {!editingTypes && <button type="button" className="rounded border px-3 py-1 text-rose-700" onClick={() =>
                setForm((current) => Array.isArray(current) ? current.filter((_, i) => i !== index) : current)
              }>حذف {itemLabel} من القائمة</button>}
            </div>
          ))}
          <button type="button" className="w-fit rounded border px-3 py-1" onClick={() => {
            const template = (section.fallback as Json[])[0];
            if (!template || typeof template !== 'object' || Array.isArray(template)) return;
            const item = Object.fromEntries(Object.entries(template).map(([key, value]) =>
              [key, key === 'id' ? crypto.randomUUID() : key === 'active' ? true : key === 'rating' ? 5 : typeof value === 'string' ? '' : typeof value === 'number' ? 0 : false]
            ));
            setForm((current) => Array.isArray(current) ? [...current, item] : current);
          }}>إضافة {itemLabel}</button>
        </> : renderField(form)}
        <button type="submit" className="w-fit rounded bg-slate-900 px-4 py-2 text-white">حفظ ونشر</button>
      </fieldset>
    </form>}
  </section>;
}
