import { defaultRealEstateHero, defaultRealEstateServiceMedia, realEstateHeroSection, realEstateServiceMediaSection } from '../../lib/realEstateHomeContent';
import { useEffect, useState, type FormEvent } from 'react';
import { DEFAULT_HERO_CONTENT, DEFAULT_COMPANY_CONTENT, DEFAULT_WORK_STAGES, DEFAULT_OFFICES } from '../../construction/services/sectionDefaults';
import { DEFAULT_HVAC_HERO, DEFAULT_HVAC_HOURS_CONTACT, DEFAULT_HVAC_BOOKING_COPY, DEFAULT_HVAC_CITIES } from '../../hvac/services/sectionDefaults';
import { readSectorSection, saveSectorSection, type SectorSection } from '../../lib/db/hardSectorSections';
import { uploadMediaAsset } from '../../lib/cmsMediaLibrary';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type FieldPath = (string | number)[];
const sections: { target: SectorSection; title: string; fallback: object }[] = [
  { target: realEstateHeroSection, title: 'العقارات — صورة الهيرو', fallback: defaultRealEstateHero },
  { target: realEstateServiceMediaSection, title: 'العقارات — صور وأرقام الخدمات', fallback: defaultRealEstateServiceMedia },
  { target: { sector: 'construction', key: 'hero' }, title: 'الإنشاءات — الصفحة الرئيسية', fallback: DEFAULT_HERO_CONTENT },
  { target: { sector: 'construction', key: 'company' }, title: 'الإنشاءات — عن الشركة', fallback: DEFAULT_COMPANY_CONTENT },
  { target: { sector: 'construction', key: 'stages' }, title: 'الإنشاءات — مراحل العمل', fallback: DEFAULT_WORK_STAGES },
  { target: { sector: 'construction', key: 'offices' }, title: 'الإنشاءات — المكاتب', fallback: DEFAULT_OFFICES },
  { target: { sector: 'hvac', key: 'hero' }, title: 'التكييف — الصفحة الرئيسية', fallback: DEFAULT_HVAC_HERO },
  { target: { sector: 'hvac', key: 'hours_contact' }, title: 'التكييف — الاتصال وساعات العمل', fallback: DEFAULT_HVAC_HOURS_CONTACT },
  { target: { sector: 'hvac', key: 'booking_copy' }, title: 'التكييف — نصوص الحجز', fallback: DEFAULT_HVAC_BOOKING_COPY },
  { target: { sector: 'hvac', key: 'service_areas' }, title: 'التكييف — مناطق الخدمة', fallback: DEFAULT_HVAC_CITIES },
];
const labels: Record<string, string> = {
  badgeAr: 'العبارة العلوية بالعربية', badgeEn: 'العبارة العلوية بالإنجليزية',
  headlineAr: 'العنوان بالعربية', headlineEn: 'العنوان بالإنجليزية',
  subtitleAr: 'الوصف بالعربية', subtitleEn: 'الوصف بالإنجليزية',
  'serv-1': 'الوساطة العقارية', 'serv-2': 'التسويق العقاري', 'serv-3': 'الاستشارات الاستثمارية',
  stats: 'الأرقام المعروضة فوق الصورة', value: 'القيمة',
  bgImageUrl: 'رابط صورة الغلاف', googleMapsUrl: 'رابط الخريطة',
  officeEmail: 'البريد الإلكتروني للمكتب', emergencyPhone: 'هاتف الطوارئ',
  cityNameAr: 'اسم المدينة بالعربية', cityNameEn: 'اسم المدينة بالإنجليزية',
  regionAr: 'المنطقة بالعربية', regionEn: 'المنطقة بالإنجليزية',
  responseTimeMin: 'مدة الاستجابة بالدقائق', isPrimaryArea: 'منطقة رئيسية',
  whatsappNumber: 'رقم واتساب', active: 'مفعّل',
};
const inputStyle = 'block w-full rounded border px-2 py-1';
const fixedKeys = new Set(['id', 'isPublished']);
const urlKey = /url$/i;
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
    const label = labels[key] ?? (/^\d+$/.test(key) ? 'البند ' + (Number(key) + 1) : key);
    return <div key={path.join('.')} className="space-y-1">
      <label className="block text-sm font-medium">
        {label}{' '}
        {typeof value === 'boolean' ? <input type="checkbox" checked={value} onChange={(event) => edit(path, event.target.checked)} />
          : typeof value === 'number' ? <input type="number" step="any" required className={inputStyle} value={value} onChange={(event) => edit(path, Number(event.target.value))} />
          : <textarea className={inputStyle} rows={value.length > 80 ? 3 : 1} dir="auto" required={editingCities && (key === 'cityNameAr' || key === 'cityNameEn')} value={value} onChange={(event) => edit(path, event.target.value)} />}
      </label>
      {key === 'bgImageUrl' && <label className="text-sm">رفع صورة الغلاف <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={(event) => {
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
    {message && <p role="status">{message}</p>}
    {loading && <p role="status">جارٍ تحميل القسم…</p>}
    {form !== undefined && <form key={active} onSubmit={save}>
      <fieldset disabled={busy} className="grid gap-4">
        {editingCities && Array.isArray(form) ? <>
          {form.map((city, index) => (
            <div key={city && typeof city === 'object' && !Array.isArray(city) ? String(city.id ?? index) : index} className="space-y-2">
              {renderField(city, [index])}
              <button type="button" className="rounded border px-3 py-1 text-rose-700" onClick={() =>
                setForm((current) => Array.isArray(current) ? current.filter((_, i) => i !== index) : current)
              }>حذف المدينة من القائمة</button>
            </div>
          ))}
          <button type="button" className="w-fit rounded border px-3 py-1" onClick={() => {
            const city = { id: 'city-' + crypto.randomUUID(), cityNameAr: '', cityNameEn: '', regionAr: '', regionEn: '', responseTimeMin: 0, isPrimaryArea: false, active: true };
            setForm((current) => Array.isArray(current) ? [...current, city] : current);
          }}>إضافة مدينة</button>
        </> : renderField(form)}
        <button type="submit" className="w-fit rounded bg-slate-900 px-4 py-2 text-white">حفظ ونشر</button>
      </fieldset>
    </form>}
  </section>;
}
