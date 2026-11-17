import { useTextOverride } from '../../context/TextOverrideContext';
import React from 'react';
import {
  Sparkles,
  Gauge,
  Droplets,
  Zap,
  Flame,
  Wind,
  Shield,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { pick } from '../translations';

export function HVACSeasonalChecklist() {
  const { hvac: T } = useTextOverride();
  const { language, isAr, openBookingModal, maintenanceGuides } = useHVAC();

  const iconComponents: Record<string, React.ElementType> = {
    Sparkles,
    Gauge,
    Droplets,
    Zap,
    Flame,
    Wind,
    Shield,
    Cpu,
  };


  return (
    <section id="checklist" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            {pick(T.checklist.title, language)}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {pick(T.checklist.subtitle, language)}
          </p>

        </div>

        {/* Maintenance guide cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {maintenanceGuides.map((item) => {
            const Icon = iconComponents[item.iconName] || CheckCircle2;
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 text-start flex items-start gap-4 shadow-xs hover:border-[#0EA5E9]/40 hover:shadow-md transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-sky-50 text-[#034DA2]`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      {isAr ? item.titleAr : item.titleEn}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 bg-sky-50 text-[#034DA2]`}
                    >
                      {isAr ? item.importanceAr : item.importanceEn}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {isAr ? item.descAr : item.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Callout action */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => openBookingModal()}
            className="px-6 py-3 rounded-xl bg-[#007EBA] hover:bg-[#034DA2] text-white font-semibold text-xs sm:text-sm transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>
              {isAr
                ? 'احجز خدمة الفحص الدوري الكامل الآن'
                : 'Book a Full Periodic Inspection'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
