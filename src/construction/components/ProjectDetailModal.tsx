import { LocalizedValue } from '../../components/ui/LocalizedValue';
import { InterfaceText } from '../../components/ui/InterfaceText';
import { ManagedButton, ManagedImg } from '../../components/ui/ManagedElements';
import { useTextOverride } from '../../context/TextOverrideContext';
import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  Coins,
  Share2,
  AlertTriangle,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { buildConstructionProjectUrl } from '../utils/constructionUrlParams';
import { getLocalizedCategoryLabel, formatAreaBUA, formatConstructionDigits } from '../utils/constructionFormatters';

export function ProjectDetailModal() {
  const {
    language,
    selectedProjectForModal,
    unknownProjectId,
    closeProjectModal,
    openQuoteModal,
  } = useConstruction();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Reset active image index when project changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsCopied(false);
  }, [selectedProjectForModal?.id, unknownProjectId]);

  // Handle keyboard Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeProjectModal();
      }
    };
    if (selectedProjectForModal || unknownProjectId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProjectForModal, unknownProjectId, closeProjectModal]);

  if (!selectedProjectForModal && !unknownProjectId) return null;

  const { construction: constructionTranslations } = useTextOverride();
  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const ReturnIcon = isAr ? ArrowRight : ArrowLeft;

  // Unknown project fallback state
  if (unknownProjectId && !selectedProjectForModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-hidden bg-slate-950/70 p-0 sm:p-4 backdrop-blur-sm [padding-top:env(safe-area-inset-top)] sm:[padding-top:1rem]"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeProjectModal();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="unknown-project-title"
      >
        <div className="relative w-full min-w-0 max-w-lg overflow-y-auto overscroll-contain border border-slate-200 bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-center text-slate-900 shadow-2xl max-h-[calc(100dvh-env(safe-area-inset-top))] sm:max-h-[calc(100dvh-2rem)] rounded-t-3xl sm:rounded-3xl sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <ManagedButton copyScope="construction.ProjectDetailModal"
            type="button"
            onClick={closeProjectModal}
            className="absolute top-4 end-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </ManagedButton>

          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              <span><LocalizedValue value={t.projects.notFoundTitle} /></span>
            </div>
            <h2 id="unknown-project-title" className="text-xl sm:text-2xl font-bold font-display-serif text-[#0f243e]">
              {isAr ? <InterfaceText id="construction.ProjectDetailModal.k1jw6m93" source="لم نتمكن من العثور على المشروع" /> : <InterfaceText id="construction.ProjectDetailModal.k1p3ejjz" source="Project Not Found" />}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              <LocalizedValue value={isAr
                ? `المعرف "${unknownProjectId}" غير موجود في قائمة مشاريع شركة هارد للإنشاءات أو ربما تم حذفه.`
                : `The project ID "${unknownProjectId}" was not found in our construction portfolio or may have been removed.`} />
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              type="button"
              onClick={closeProjectModal}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-sky-500/20"
            >
              <ReturnIcon className="w-4 h-4" />
              <span><LocalizedValue value={t.projects.backToAllProjects} /></span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const proj = selectedProjectForModal!;
  const images = proj.galleryImages && proj.galleryImages.length > 0 ? proj.galleryImages : [proj.image];
  const scopes = isAr ? proj.scopeAr : proj.scopeEn;

  const handleCopyStableUrl = async () => {
    if (typeof window === 'undefined') return;
    const stableUrl = window.location.origin + buildConstructionProjectUrl(proj.id);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(stableUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }
    } catch {
      // Fallback if clipboard API is blocked
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleInquire = () => {
    closeProjectModal();
    openQuoteModal({
      projectType:
        proj.category === 'residential'
          ? 'villa'
          : proj.category === 'commercial'
          ? 'commercial-building'
          : proj.category === 'industrial'
          ? 'warehouse'
          : 'villa',
      builtUpArea: proj.buaM2,
      source: 'project_inquiry',
      inquiredProjectId: proj.id,
      notes: `Inquiry regarding: ${isAr ? proj.titleAr : proj.titleEn} (${isAr ? proj.locationAr : proj.locationEn})`,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-hidden bg-slate-950/60 p-0 sm:p-4 backdrop-blur-sm [padding-top:env(safe-area-inset-top)] sm:[padding-top:1rem]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeProjectModal();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div className="relative flex w-full min-w-0 max-w-4xl flex-col overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-2xl max-h-[calc(100dvh-env(safe-area-inset-top))] sm:max-h-[calc(100dvh-2rem)] rounded-t-3xl sm:rounded-3xl my-0 sm:my-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Navigation & Actions Top Bar */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-100/90 px-3 py-3 sm:gap-3 sm:px-6 sm:py-3.5">
          {/* Return Path to Project List */}
          <ManagedButton copyScope="construction.ProjectDetailModal"
            type="button"
            onClick={closeProjectModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#009ee2] bg-white border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer shadow-2xs"
            aria-label={t.projects.backToList}
          >
            <ReturnIcon className="w-4 h-4 text-[#009ee2]" />
            <span><LocalizedValue value={t.projects.backToList} /></span>
          </ManagedButton>

          {/* Action buttons (Share & Close) */}
          <div className="flex items-center gap-2">
            <ManagedButton copyScope="construction.ProjectDetailModal"
              type="button"
              onClick={handleCopyStableUrl}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                isCopied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-white text-slate-700 hover:text-[#009ee2] border border-slate-200 hover:border-sky-300'
              }`}
              title={t.projects.copyLink}
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span><LocalizedValue value={t.projects.linkCopied} /></span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#009ee2]" />
                  <span><LocalizedValue value={t.projects.shareProject} /></span>
                </>
              )}
            </ManagedButton>

            <ManagedButton copyScope="construction.ProjectDetailModal"
              type="button"
              onClick={closeProjectModal}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
              aria-label={isAr ? 'إغلاق نافذة تفاصيل المشروع' : 'Close project details modal'}
            >
              <X className="w-5 h-5" />
            </ManagedButton>
          </div>
        </div>

        {/* Title Header */}
        <div className="shrink-0 space-y-1 border-b border-slate-200 bg-slate-50 p-4 text-start sm:p-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-[#eef7ff] text-[#009ee2] border border-sky-100 uppercase">
              <LocalizedValue value={getLocalizedCategoryLabel(proj.category, language)} />
            </span>
            <span className="text-xs text-slate-500">
              <LocalizedValue value={isAr ? proj.cityAr : proj.cityEn} /><LocalizedValue value={proj.year && ' • ' + formatConstructionDigits(proj.year, language)} />
            </span>
          </div>
          <h2 id="project-modal-title" className="text-xl sm:text-2xl font-bold font-display-serif text-[#0f243e]">
            <LocalizedValue value={isAr ? proj.titleAr : proj.titleEn} />
          </h2>
        </div>

        {/* Modal Scrollable Body */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-start sm:space-y-8 sm:p-8 sm:pb-8">
          {/* Main Gallery Display */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <ManagedImg copyScope="construction.ProjectDetailModal"
                src={images[activeImageIndex] || proj.image}
                alt={
                  isAr
                    ? `معرض صور مشروع ${proj.titleAr} - صورة ${activeImageIndex + 1}`
                    : `${proj.titleEn} gallery photo ${activeImageIndex + 1}`
                }
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label={isAr ? 'معرض الصور المصغرة' : 'Image gallery thumbnails'}>
                {images.map((img, idx) => (
                  <ManagedButton copyScope="construction.ProjectDetailModal"
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={
                      isAr
                        ? `عرض الصورة ${idx + 1} من ${images.length} لمشروع ${proj.titleAr}`
                        : `View image ${idx + 1} of ${images.length} for ${proj.titleEn}`
                    }
                    aria-current={activeImageIndex === idx ? 'true' : undefined}
                    className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009ee2] ${
                      activeImageIndex === idx ? 'border-[#009ee2] scale-105' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <ManagedImg copyScope="construction.ProjectDetailModal"
                      src={img}
                      alt={
                        isAr
                          ? `معاينة مصغرة ${idx + 1} لمشروع ${proj.titleAr}`
                          : `Thumbnail ${idx + 1} for ${proj.titleEn}`
                      }
                      className="w-full h-full object-cover"
                    />
                  </ManagedButton>
                ))}
              </div>
            )}
          </div>

          {/* Project Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500"><LocalizedValue value={t.projects.buaLabel} /></div>
              <div className="text-sm sm:text-base font-bold text-[#0f243e] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#009ee2]" />
                <span><LocalizedValue value={formatAreaBUA(proj.buaM2, language)} /></span>
              </div>
            </div>

            {proj.durationMonths > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500"><LocalizedValue value={t.projects.durationLabel} /></div>
              <div className="text-sm sm:text-base font-bold text-[#0f243e] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-600" />
                <span><LocalizedValue value={formatConstructionDigits(proj.durationMonths, language)} /> {isAr ? <InterfaceText id="construction.ProjectDetailModal.kaf33fe" source="أشهر" /> : <InterfaceText id="construction.ProjectDetailModal.k2777qa" source="Months" />}</span>
              </div>
            </div>
            )}

            {proj.valueSAR && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500"><LocalizedValue value={t.projects.valueLabel} /></div>
              <div className="text-sm sm:text-base font-bold text-emerald-600 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span><LocalizedValue value={formatConstructionDigits(proj.valueSAR, language)} /></span>
              </div>
            </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500">{isAr ? <InterfaceText id="construction.ProjectDetailModal.kn6u0qe" source="الموقع الجغرافي:" /> : <InterfaceText id="construction.ProjectDetailModal.ku00eyc" source="Location:" />}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#009ee2]" />
                <span className="truncate"><LocalizedValue value={isAr ? proj.locationAr : proj.locationEn} /></span>
              </div>
            </div>
          </div>

          {/* Detailed Narrative */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
              {isAr ? <InterfaceText id="construction.ProjectDetailModal.k1gzudho" source="الوصف الهندسي والمعماري" /> : <InterfaceText id="construction.ProjectDetailModal.k7n509e" source="Architectural & Engineering Overview" />}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <LocalizedValue value={formatConstructionDigits(isAr ? proj.descriptionAr : proj.descriptionEn, language)} />
            </p>
          </div>

          {/* Technical Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-[#009ee2]">
                {isAr ? <InterfaceText id="construction.ProjectDetailModal.k1qy4bvq" source="النظام الإنشائي المعتمد:" /> : <InterfaceText id="construction.ProjectDetailModal.k18x5x73" source="Structural System:" />}
              </div>
              <div className="text-xs text-slate-700 font-medium">
                <LocalizedValue value={isAr ? proj.structuralSystemAr : proj.structuralSystemEn} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-[#009ee2]">
                {isAr ? <InterfaceText id="construction.ProjectDetailModal.k1inraoc" source="مستوى وجودة التشطيب:" /> : <InterfaceText id="construction.ProjectDetailModal.k5vw2nf" source="Finishing Specification:" />}
              </div>
              <div className="text-xs text-slate-700 font-medium">
                <LocalizedValue value={isAr ? proj.finishingLevelAr : proj.finishingLevelEn} />
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          {scopes && scopes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
                {isAr ? <InterfaceText id="construction.ProjectDetailModal.k110qc82" source="نطاق الأعمال والمخرجات المنفذة" /> : <InterfaceText id="construction.ProjectDetailModal.k11trrum" source="Scope of Execution & Deliverables" />}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {scopes.map((scope, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#009ee2] shrink-0 mt-0.5" />
                    <span><LocalizedValue value={scope} /></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span><LocalizedValue value={t.credentials.sbc} /></span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={closeProjectModal}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-slate-200"
              >
                <ReturnIcon className="w-4 h-4" />
                <span><LocalizedValue value={t.projects.backToList} /></span>
              </button>

              <button
                type="button"
                onClick={handleInquire}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-sky-500/20"
              >
                <FileText className="w-4 h-4" />
                <span><LocalizedValue value={t.projects.inquireSimilar} /></span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
