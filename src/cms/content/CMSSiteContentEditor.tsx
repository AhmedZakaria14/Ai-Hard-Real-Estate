import React, { useState, useEffect } from 'react';
import { Save, Send, Sparkles, RefreshCw, CheckCircle2, Globe, FileText, Layers, Layers3, AlertCircle } from 'lucide-react';
import { Language } from '../../types';
import {
  saveCmsSectionDraft,
  publishCmsSection,
  getCmsSection,
  subscribeCmsSection,
  CmsSectionData,
} from '../../lib/firebaseService';

interface CMSSiteContentEditorProps {
  language: Language;
}

export const CMSSiteContentEditor: React.FC<CMSSiteContentEditorProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [activeSector, setActiveSector] = useState<'portal' | 'realestate' | 'construction' | 'hvac'>('portal');
  const [sectionData, setSectionData] = useState<CmsSectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form states for active section
  const [heroTitleEn, setHeroTitleEn] = useState('');
  const [heroTitleAr, setHeroTitleAr] = useState('');
  const [heroSubEn, setHeroSubEn] = useState('');
  const [heroSubAr, setHeroSubAr] = useState('');
  const [phoneContact, setPhoneContact] = useState('');
  const [emailContact, setEmailContact] = useState('');
  const [aboutTextEn, setAboutTextEn] = useState('');
  const [aboutTextAr, setAboutTextAr] = useState('');

  const sectionId = `${activeSector}_content`;

  useEffect(() => {
    setIsLoading(true);
    const unsub = subscribeCmsSection(sectionId, (data) => {
      if (data) {
        setSectionData(data);
        const draft = data.draft || data.published || {};
        setHeroTitleEn(draft.heroTitleEn || defaultTitles[activeSector].en);
        setHeroTitleAr(draft.heroTitleAr || defaultTitles[activeSector].ar);
        setHeroSubEn(draft.heroSubEn || defaultSubtitles[activeSector].en);
        setHeroSubAr(draft.heroSubAr || defaultSubtitles[activeSector].ar);
        setPhoneContact(draft.phoneContact || '+966 13 800 4273');
        setEmailContact(draft.emailContact || 'info@hardgp.com');
        setAboutTextEn(draft.aboutTextEn || 'HARD Group delivers world-class solutions across real estate, construction, and HVAC.');
        setAboutTextAr(draft.aboutTextAr || 'مجموعة هارد تقدم حلولاً عالمية المستوى عبر العقارات والمقاولات والتكييف.');
      } else {
        // Init default
        setHeroTitleEn(defaultTitles[activeSector].en);
        setHeroTitleAr(defaultTitles[activeSector].ar);
        setHeroSubEn(defaultSubtitles[activeSector].en);
        setHeroSubAr(defaultSubtitles[activeSector].ar);
        setPhoneContact('+966 13 800 4273');
        setEmailContact('info@hardgp.com');
        setAboutTextEn('HARD Group delivers world-class solutions across real estate, construction, and HVAC.');
        setAboutTextAr('مجموعة هارد تقدم حلولاً عالمية المستوى عبر العقارات والمقاولات والتكييف.');
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, [activeSector, sectionId]);

  const defaultTitles: Record<string, { en: string; ar: string }> = {
    portal: { en: 'Pioneering Excellence Across Real Estate, Construction & HVAC', ar: 'الريادة والتميز في العقارات والمقاولات وأنظمة التكييف' },
    realestate: { en: 'Luxury Real Estate & Prime Saudi Investment Portfolio', ar: 'العقارات الفاخرة ومحفظة الاستثمار العقاري بالمملكة' },
    construction: { en: 'Turnkey Contracting & Engineering Excellence', ar: 'مقاولات متكاملة وتميز هندسي معتمد' },
    hvac: { en: 'Advanced HVAC Systems & Precision Climate Maintenance', ar: 'أنظمة التكييف المتقدمة والصيانة الدقيقة للمناخ' },
  };

  const defaultSubtitles: Record<string, { en: string; ar: string }> = {
    portal: { en: 'Building sustainable infrastructure and premium living experiences across KSA.', ar: 'نبني البنية التحتية المستدامة ونوفر تجارب سكنية وفاخرة عبر المملكة.' },
    realestate: { en: 'Exclusive villas, commercial towers, and prime land plots in KSA.', ar: 'فلل حصرية، أبراج تجارية، وأراضٍ ممتازة في المملكة العربية السعودية.' },
    construction: { en: 'High-rise developments, civil engineering, and infrastructure projects.', ar: 'مشاريع الأبراج، الهندسة المدنية، ومشاريع البنية التحتية المتكاملة.' },
    hvac: { en: 'VRF, chillers, ductwork installation, and 24/7 emergency response.', ar: 'أنظمة VRF، المبردات، تركيب مجاري الهواء، وصيانة الطوارئ على مدار 24/7.' },
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setStatusMessage(null);
    try {
      const draftContent = {
        heroTitleEn,
        heroTitleAr,
        heroSubEn,
        heroSubAr,
        phoneContact,
        emailContact,
        aboutTextEn,
        aboutTextAr,
        updatedAt: new Date().toISOString(),
      };
      await saveCmsSectionDraft(sectionId, activeSector, draftContent, 'Admin User');
      setStatusMessage(isAr ? 'تم حفظ المسودة بنجاح في Firestore.' : 'Draft autosaved to Firestore successfully.');
    } catch (e: any) {
      setStatusMessage(isAr ? 'حدث خطأ أثناء حفظ المسودة.' : 'Failed to save draft to Firestore.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      // First save current draft
      await handleSaveDraft();
      // Explicit publish
      await publishCmsSection(sectionId, 'Admin User');
      setStatusMessage(isAr ? 'تم نشر المحتوى مباشرة إلى الموقع المباشر!' : 'Content published live to website successfully!');
    } catch (e: any) {
      setStatusMessage(isAr ? 'حدث خطأ أثناء النشر.' : 'Failed to publish section.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'إدارة محتوى أقسام الموقع' : 'CMS Section Content Manager'}</span>
          </div>
          <h2 className="text-xl font-bold font-display-serif">
            {isAr ? 'المسودات والنشر المباشر (Firebase Firestore CMS)' : 'Autosaved Drafts & Explicit Live Publishing'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            {isAr
              ? 'قم بتعديل محتوى الصفحة وتجربة المسودات دون التأثير على الموقع المباشر. عند النقر على "نشر المباشر"، يتحدث الموقع فوراً عبر Firestore.'
              : 'Edit content, autosave drafts, and review changes safely. Click "Publish Live" to push changes instantly to visitors.'}
          </p>
        </div>

        {/* Sector Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {(['portal', 'realestate', 'construction', 'hvac'] as const).map((sector) => (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSector === sector
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {sector === 'portal' && (isAr ? 'بوابة المجموعة' : 'Group Portal')}
              {sector === 'realestate' && (isAr ? 'العقارات' : 'Real Estate')}
              {sector === 'construction' && (isAr ? 'المقاولات' : 'Construction')}
              {sector === 'hvac' && (isAr ? 'التكييف' : 'HVAC')}
            </button>
          ))}
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          {sectionData?.updatedAt && (
            <span className="text-[10px] text-emerald-400 font-mono">
              {new Date(sectionData.updatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Editor Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">
              {isAr ? `محتوى قسم (${activeSector.toUpperCase()})` : `${activeSector.toUpperCase()} Section CMS Content`}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              sectionData?.isPublished ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {sectionData?.isPublished ? (isAr ? 'منشور مباشرة' : 'Published Live') : (isAr ? 'مسودة معلقة' : 'Draft Pending')}
            </span>
          </div>
        </div>

        {/* Hero Section Form Fields */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isAr ? 'عنوان البانر الرئيسي (Hero Section)' : 'Hero Banner Headline & Subtitle'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAr ? 'العنوان بالعربية' : 'Arabic Headline'}
              </label>
              <textarea
                rows={2}
                value={heroTitleAr}
                onChange={(e) => setHeroTitleAr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAr ? 'العنوان بالإنجليزية' : 'English Headline'}
              </label>
              <textarea
                rows={2}
                value={heroTitleEn}
                onChange={(e) => setHeroTitleEn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAr ? 'الوصف الفرعي بالعربية' : 'Arabic Subtitle'}
              </label>
              <textarea
                rows={2}
                value={heroSubAr}
                onChange={(e) => setHeroSubAr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAr ? 'الوصف الفرعي بالإنجليزية' : 'English Subtitle'}
              </label>
              <textarea
                rows={2}
                value={heroSubEn}
                onChange={(e) => setHeroSubEn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Fields */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isAr ? 'معلومات التواصل المباشرة' : 'Direct Contact & Phone Line'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAr ? 'رقم الهاتف المعتمد' : 'Official Hotline'}
              </label>
              <input
                type="text"
                value={phoneContact}
                onChange={(e) => setPhoneContact(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAr ? 'البريد الإلكتروني الرسمي' : 'Official Email Address'}
              </label>
              <input
                type="email"
                value={emailContact}
                onChange={(e) => setEmailContact(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* About Overview */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isAr ? 'نبذة عن القسم (About Summary)' : 'Section Overview & Copy'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAr ? 'النبذة بالعربية' : 'Arabic Overview'}
              </label>
              <textarea
                rows={3}
                value={aboutTextAr}
                onChange={(e) => setAboutTextAr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAr ? 'النبذة بالإنجليزية' : 'English Overview'}
              </label>
              <textarea
                rows={3}
                value={aboutTextEn}
                onChange={(e) => setAboutTextEn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {sectionData?.updatedAt && (
              <span>
                {isAr ? 'آخر تحديث للمسودة: ' : 'Draft Last Updated: '}
                <strong className="text-slate-200">{new Date(sectionData.updatedAt).toLocaleString()}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold inline-flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-blue-400" />
              <span>{isSavingDraft ? (isAr ? 'جارٍ الحفظ...' : 'Saving Draft...') : (isAr ? 'حفظ مسودة' : 'Save Draft')}</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold shadow-lg shadow-blue-900/40 inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
              <span>{isPublishing ? (isAr ? 'جارٍ النشر المباشر...' : 'Publishing Live...') : (isAr ? 'نشر مباشر للموقع' : 'Publish Live to Website')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
