import { SearchableSelect } from '../../components/ui/SearchableSelect';
import { hardAdminClient } from '../../lib/db/hardAdminClient';
import { useEffect, useState, type FormEvent } from 'react';
import { emptySiteText, siteTextDefaults, siteTextSection, type SiteText } from '../../context/TextOverrideContext';
import { readSectorSection, notifySectorSectionSaved } from '../../lib/db/hardSectorSections';
import type { Language } from '../../types';

const paths = [...new Set([...Object.keys(siteTextDefaults.ar), ...Object.keys(siteTextDefaults.en)])].sort();

export function CMSSiteText({ language }: { language: Language }) {
  const ar = language === 'ar';
  const [text, setText] = useState<SiteText | null>(null);
  const [path, setPath] = useState('');
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const needle = search.trim().toLowerCase();
  const results = paths.filter((key) => {
    const matchesSector = sector === 'all' || (sector === 'realestate'
      ? !key.startsWith('construction.') && !key.startsWith('hvac.') && !key.startsWith('interface.construction.') && !key.startsWith('interface.hvac.') && !key.startsWith('interface.portal.')
      : key.startsWith(sector + '.') || key.startsWith('interface.' + sector + '.'));
    return matchesSector && [key, siteTextDefaults.ar[key], siteTextDefaults.en[key],
    text?.ar?.[key], text?.en?.[key]].some((value) => value?.toLowerCase().includes(needle));
  });

  useEffect(() => {
    const controller = new AbortController();
    void readSectorSection<SiteText>(siteTextSection, controller.signal).then((data) => {
      if (!controller.signal.aborted) setText(data ?? emptySiteText);
    }).catch(() => {
      if (!controller.signal.aborted) setMessage(ar ? 'تعذر تحميل النصوص.' : 'Could not load copy.');
    });
    return () => controller.abort();
  }, [ar]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text || !path || busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setMessage('');
    try {
      const override = (locale: 'ar' | 'en') => {
        const value = data.get(locale);
        return typeof value === 'string' && value !== siteTextDefaults[locale][path] ? value : null;
      };
      const { data: next, error } = await hardAdminClient.rpc('hard_patch_site_text', {
        copy_path: path, arabic_value: override('ar'), english_value: override('en'),
      });
      if (error || !next) throw error ?? Error('Missing published copy');
      setText(next as SiteText);
      notifySectorSectionSaved(siteTextSection);
      setMessage(ar ? 'حُفظ النص ونُشر.' : 'Copy published.');
    } catch {
      setMessage(ar ? 'تعذر حفظ النص.' : 'Could not publish copy.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
    <h2 className="text-lg font-bold">{ar ? 'نصوص الواجهة والقطاعات' : 'Interface and sector copy'}</h2>
    {message && <p role="status">{message}</p>}
    <label className="block">{ar ? 'القطاع' : 'Sector'}
      <SearchableSelect className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none" value={sector} onChange={(event) => setSector(event.target.value)}>
        <option value="all">{ar ? 'جميع القطاعات' : 'All sectors'}</option>
        <option value="realestate">{ar ? 'العقارات' : 'Real estate'}</option>
        <option value="construction">{ar ? 'المقاولات' : 'Construction'}</option>
        <option value="hvac">{ar ? 'التكييف' : 'AC maintenance'}</option>
        <option value="portal">{ar ? 'بوابة المجموعة' : 'Group portal'}</option>
      </SearchableSelect>
    </label>
    <label className="block">{ar ? 'ابحث بالعربية أو الإنجليزية' : 'Search in Arabic or English'}
      <input className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none" value={search} onChange={(event) => setSearch(event.target.value)} />
    </label>
    <label className="block">{ar ? 'النص المطلوب' : 'Text to edit'}
      <SearchableSelect className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none" value={path} disabled={!text || busy} onChange={(event) => setPath(event.target.value)}>
        <option value="">{ar ? 'اختر نصًا' : 'Select a text'}</option>
        {results.map((key) => <option key={key} value={key}>{key} · {(text?.[language]?.[key] ?? siteTextDefaults[language][key] ?? '').slice(0, 90)}</option>)}
      </SearchableSelect>
    </label>
    {text && path && <form key={path} onSubmit={save} className="grid gap-3">
      {(['ar', 'en'] as const).filter((lang) => Object.hasOwn(siteTextDefaults[lang], path)).map((lang) =>
        <label key={lang}>{lang === 'ar' ? 'العربية' : 'English'}
          <textarea dir={lang === 'ar' ? 'rtl' : 'ltr'} name={lang} maxLength={6000} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none" defaultValue={text[lang]?.[path] ?? siteTextDefaults[lang][path]} />
        </label>
      )}
      <button disabled={busy} className="w-fit rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-40">{ar ? 'حفظ ونشر النص' : 'Publish copy'}</button>
    </form>}
  </section>;
}
