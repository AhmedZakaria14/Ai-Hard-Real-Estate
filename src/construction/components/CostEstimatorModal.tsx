import React, { useState } from 'react';
import {
  X,
  Calculator,
  Building2,
  Layers,
  Sparkles,
  Sliders,
  Check,
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { useConstruction } from '../context/ConstructionContext';
import { constructionTranslations } from '../utils/translations';
import { ConstructionProjectType, FinishingLevel } from '../types';
import { formatSAR } from '../utils/costCalculator';

export function CostEstimatorModal() {
  const {
    language,
    isCostEstimatorOpen,
    closeCostEstimator,
    costParams,
    setCostParams,
    currentEstimate,
    transferEstimateToQuote,
  } = useConstruction();

  const t = constructionTranslations[language];
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  if (!isCostEstimatorOpen) return null;

  const projectTypes: { id: ConstructionProjectType; label: string; icon: string }[] = [
    { id: 'villa', label: t.calculator.types.villa, icon: '🏡' },
    { id: 'commercial-building', label: t.calculator.types.commercial, icon: '🏢' },
    { id: 'duplex', label: t.calculator.types.duplex, icon: '🏘️' },
    { id: 'residential-compound', label: t.calculator.types.compound, icon: '🏰' },
    { id: 'warehouse', label: t.calculator.types.warehouse, icon: '🏭' },
  ];

  const finishingLevels: { id: FinishingLevel; label: string; desc: string }[] = [
    {
      id: 'skeleton',
      label: t.calculator.finishing.skeleton,
      desc: isAr
        ? 'يشمل أعمال الحفر، الأساسات، الهيكل الخرساني، وتأسيس السباكة والكهرباء.'
        : 'Includes deep foundations, reinforced concrete frame, and initial MEP rough-in.',
    },
    {
      id: 'commercial',
      label: t.calculator.finishing.commercial,
      desc: isAr
        ? 'تشطيب تجاري قياسي معتمد للمكاتب والمباني الاستثمارية.'
        : 'Standard commercial fit-out for corporate offices and rental plazas.',
    },
    {
      id: 'deluxe',
      label: t.calculator.finishing.deluxe,
      desc: isAr
        ? 'تشطيب سكني وتجاري راقٍ يشمل البورسلان الإسباني وتكييف الكونسيلد.'
        : 'Premium residential turnkey with Spanish porcelain & concealed AC.',
    },
    {
      id: 'super-luxury',
      label: t.calculator.finishing.superLuxury,
      desc: isAr
        ? 'أعلى درجات الفخامة: رخام إيطالي طبيعي، واجهات زجاجية، وأنظمة ذكية متكاملة.'
        : 'Super VIP Luxury: Imported Italian marble, structural glazing & smart systems.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3 text-start">
            <div className="p-2.5 rounded-xl bg-[#eef7ff] border border-sky-100 text-[#009ee2]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display-serif text-[#0f243e]">
                {t.calculator.title}
              </h2>
              <p className="text-xs text-slate-500">{t.calculator.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCostEstimator}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-3 bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`py-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeStep === 1
                ? 'border-[#009ee2] text-[#009ee2] bg-sky-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.calculator.step1}
          </button>
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`py-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeStep === 2
                ? 'border-[#009ee2] text-[#009ee2] bg-sky-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.calculator.step2}
          </button>
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`py-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeStep === 3
                ? 'border-[#009ee2] text-[#009ee2] bg-sky-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.calculator.step3}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-8 text-start max-h-[70vh] overflow-y-auto">
          {/* Step 1: Project Type */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in-50">
              <label className="text-sm font-bold text-[#0f243e] block">
                {t.calculator.step1}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {projectTypes.map((pt) => {
                  const isSelected = costParams.projectType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setCostParams((prev) => ({ ...prev, projectType: pt.id }))}
                      className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#eef7ff] border-[#009ee2] text-[#0f243e] shadow-xs ring-1 ring-[#009ee2]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-sky-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{pt.icon}</span>
                        <span className="text-xs sm:text-sm font-bold">{pt.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#009ee2]" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span>{isAr ? 'التالي: مستوى التشطيب' : 'Next: Finishing Level'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Finishing Level */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in-50">
              <label className="text-sm font-bold text-[#0f243e] block">
                {t.calculator.step2}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {finishingLevels.map((fl) => {
                  const isSelected = costParams.finishingLevel === fl.id;
                  return (
                    <button
                      key={fl.id}
                      type="button"
                      onClick={() => setCostParams((prev) => ({ ...prev, finishingLevel: fl.id }))}
                      className={`p-5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-[#eef7ff] border-[#009ee2] text-[#0f243e] shadow-xs ring-1 ring-[#009ee2]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-sky-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-bold text-[#0f243e]">{fl.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#009ee2]" />}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{fl.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  {isAr ? 'السابق' : 'Previous'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span>{isAr ? 'التالي: المساحة والإضافات' : 'Next: Area & Addons'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Area, Floors & Addons */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-in fade-in-50">
              {/* Built-up Area Slider */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-[#0f243e] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#009ee2]" />
                    <span>{t.calculator.buaLabel}</span>
                  </label>
                  <span className="px-3 py-1 rounded-lg bg-[#e8f4fc] text-[#009ee2] font-extrabold text-sm border border-[#d0e9fa]">
                    {costParams.builtUpArea.toLocaleString()} {isAr ? 'م²' : 'm²'}
                  </span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={5000}
                  step={50}
                  value={costParams.builtUpArea}
                  onChange={(e) =>
                    setCostParams((prev) => ({ ...prev, builtUpArea: Number(e.target.value) }))
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#009ee2]"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>150 m²</span>
                  <span>1,500 m²</span>
                  <span>3,000 m²</span>
                  <span>5,000 m²</span>
                </div>
              </div>

              {/* Number of Floors */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="text-xs sm:text-sm font-bold text-[#0f243e] block">
                  {t.calculator.floorsLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCostParams((prev) => ({ ...prev, floors: num }))}
                      className={`w-12 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        costParams.floors === num
                          ? 'bg-[#009ee2] text-white font-black shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-200'
                      }`}
                    >
                      {num} {isAr ? 'أدوار' : 'Fl.'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Addons Grid */}
              <div className="space-y-3">
                <label className="text-xs sm:text-sm font-bold text-[#0f243e] block">
                  {isAr ? 'الإضافات والمرافق الإنشائية:' : 'Structural Addons & Features:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Basement Toggle */}
                  <label className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-200">
                    <span className="text-xs font-semibold text-slate-700">
                      {t.calculator.addons.basement}
                    </span>
                    <input
                      type="checkbox"
                      checked={costParams.hasBasement}
                      onChange={(e) =>
                        setCostParams((prev) => ({ ...prev, hasBasement: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#009ee2] rounded cursor-pointer"
                    />
                  </label>

                  {/* Pool Toggle */}
                  <label className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-200">
                    <span className="text-xs font-semibold text-slate-700">
                      {t.calculator.addons.pool}
                    </span>
                    <input
                      type="checkbox"
                      checked={costParams.hasPool}
                      onChange={(e) =>
                        setCostParams((prev) => ({ ...prev, hasPool: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#009ee2] rounded cursor-pointer"
                    />
                  </label>

                  {/* Elevator Toggle */}
                  <label className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-200">
                    <span className="text-xs font-semibold text-slate-700">
                      {t.calculator.addons.elevator}
                    </span>
                    <input
                      type="checkbox"
                      checked={costParams.hasElevator}
                      onChange={(e) =>
                        setCostParams((prev) => ({ ...prev, hasElevator: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#009ee2] rounded cursor-pointer"
                    />
                  </label>

                  {/* Smart Home Toggle */}
                  <label className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-200">
                    <span className="text-xs font-semibold text-slate-700">
                      {t.calculator.addons.smartHome}
                    </span>
                    <input
                      type="checkbox"
                      checked={costParams.hasSmartHome}
                      onChange={(e) =>
                        setCostParams((prev) => ({ ...prev, hasSmartHome: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#009ee2] rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Live Estimate Result Display Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-[#eef7ff]/50 to-slate-50 border border-sky-200 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#009ee2]">
                  {t.calculator.resultsTitle}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-display-serif text-[#0f243e] pt-1">
                  {formatSAR(currentEstimate.minTotalSAR, isAr)} -{' '}
                  {formatSAR(currentEstimate.maxTotalSAR, isAr)}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {t.calculator.breakdown.averageM2}{' '}
                  <span className="font-bold text-[#009ee2]">
                    {formatSAR(currentEstimate.pricePerM2SAR, isAr)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white border border-sky-100 text-start shadow-2xs">
                  <div className="text-[10px] text-slate-500">{t.calculator.estimatedDuration}</div>
                  <div className="text-base font-bold text-[#009ee2] flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {currentEstimate.estimatedDurationMonths} {t.calculator.months}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-start space-y-1 shadow-2xs">
                <div className="text-[10px] text-slate-500">
                  {t.calculator.breakdown.structural}
                </div>
                <div className="font-bold text-[#0f243e]">
                  {formatSAR(currentEstimate.structuralCostSAR, isAr)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 text-start space-y-1 shadow-2xs">
                <div className="text-[10px] text-slate-500">
                  {t.calculator.breakdown.finishing}
                </div>
                <div className="font-bold text-[#0f243e]">
                  {formatSAR(currentEstimate.finishingCostSAR, isAr)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 text-start space-y-1 shadow-2xs">
                <div className="text-[10px] text-slate-500">{t.calculator.breakdown.mep}</div>
                <div className="font-bold text-[#0f243e]">
                  {formatSAR(currentEstimate.mepCostSAR, isAr)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 text-start space-y-1 shadow-2xs">
                <div className="text-[10px] text-slate-500">{t.calculator.breakdown.addons}</div>
                <div className="font-bold text-[#0f243e]">
                  {formatSAR(currentEstimate.addonsCostSAR, isAr)}
                </div>
              </div>
            </div>

            {/* Transfer to Proposal Button */}
            <button
              type="button"
              onClick={transferEstimateToQuote}
              className="w-full py-3.5 px-6 rounded-xl bg-[#009ee2] hover:bg-[#008bc7] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{t.calculator.exportBtn}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-slate-500 text-center">{t.calculator.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
