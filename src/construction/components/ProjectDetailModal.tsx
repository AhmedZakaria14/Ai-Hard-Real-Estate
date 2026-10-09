import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  Coins,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { constructionTranslations } from '../utils/translations';

export function ProjectDetailModal() {
  const {
    language,
    selectedProjectForModal,
    closeProjectModal,
    openQuoteModal,
  } = useConstruction();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedProjectForModal) return null;

  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const proj = selectedProjectForModal;
  const images = proj.galleryImages && proj.galleryImages.length > 0 ? proj.galleryImages : [proj.image];
  const scopes = isAr ? proj.scopeAr : proj.scopeEn;
  const highlights = isAr ? proj.highlightsAr : proj.highlightsEn;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-start space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-[#eef7ff] text-[#009ee2] border border-sky-100 uppercase">
                {proj.category}
              </span>
              <span className="text-xs text-slate-500">
                {isAr ? proj.cityAr : proj.cityEn} • {proj.year}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display-serif text-[#0f243e]">
              {isAr ? proj.titleAr : proj.titleEn}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeProjectModal}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto text-start">
          {/* Main Gallery Display */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={images[activeImageIndex] || proj.image}
                alt={isAr ? proj.titleAr : proj.titleEn}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-[#009ee2] scale-105' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt={`thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500">{t.projects.buaLabel}</div>
              <div className="text-sm sm:text-base font-bold text-[#0f243e] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#009ee2]" />
                <span>{proj.buaM2.toLocaleString()} m²</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500">{t.projects.durationLabel}</div>
              <div className="text-sm sm:text-base font-bold text-[#0f243e] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>{proj.durationMonths} {isAr ? 'أشهر' : 'Months'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500">{t.projects.valueLabel}</div>
              <div className="text-sm sm:text-base font-bold text-emerald-600 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>{proj.valueSAR}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500">{isAr ? 'الموقع الجغرافي:' : 'Location:'}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#009ee2]" />
                <span className="truncate">{isAr ? proj.locationAr : proj.locationEn}</span>
              </div>
            </div>
          </div>

          {/* Detailed Narrative */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
              {isAr ? 'الوصف الهندسي والمعماري' : 'Architectural & Engineering Overview'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isAr ? proj.descriptionAr : proj.descriptionEn}
            </p>
          </div>

          {/* Technical Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-[#009ee2]">
                {isAr ? 'النظام الإنشائي المعتمد:' : 'Structural System:'}
              </div>
              <div className="text-xs text-slate-700 font-medium">
                {isAr ? proj.structuralSystemAr : proj.structuralSystemEn}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-[#009ee2]">
                {isAr ? 'مستوى وجودة التشطيب:' : 'Finishing Specification:'}
              </div>
              <div className="text-xs text-slate-700 font-medium">
                {isAr ? proj.finishingLevelAr : proj.finishingLevelEn}
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          {scopes && scopes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#0f243e] font-display-serif">
                {isAr ? 'نطاق الأعمال والمخرجات المنفذة' : 'Scope of Execution & Deliverables'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {scopes.map((scope, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#009ee2] shrink-0 mt-0.5" />
                    <span>{scope}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.credentials.sbc}</span>
            </div>

            <button
              type="button"
              onClick={handleInquire}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-sky-500/20"
            >
              <FileText className="w-4 h-4" />
              <span>{t.projects.inquireSimilar}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
