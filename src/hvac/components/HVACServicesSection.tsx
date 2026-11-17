import { useTextOverride } from '../../context/TextOverrideContext';
import React from 'react';
import { useHVAC } from '../context/HVACContext';
import { pick } from '../translations';

export function HVACServicesSection() {
  const { hvac: T } = useTextOverride();
  const { language, isAr, services } = useHVAC();

  const activeServices = services.filter((s) => s.active);

  return (
    <section id="services" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            {pick(T.services.title, language)}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {pick(T.services.subtitle, language)}
          </p>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {activeServices.map((service) => {
            const serviceTitle = isAr ? service.titleAr : service.titleEn;
            return (
              <div
                key={service.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Card Image with Badge */}
                <div className="aspect-16/10 overflow-hidden relative bg-slate-100">
                  <img
                    src={service.image}
                    alt={serviceTitle}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    loading="lazy"
                  />
                  {(service.badgeAr || service.badgeEn) && (
                    <div className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-[#034DA2] backdrop-blur-sm text-white text-[11px] font-semibold">
                      {isAr ? service.badgeAr : service.badgeEn}
                    </div>
                  )}
                </div>

                {/* Title and description */}
                <div className="p-6 flex-1 flex flex-col text-start justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#0EA5E9] transition-colors leading-snug">
                      {serviceTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {isAr ? service.descriptionAr : service.descriptionEn}
                    </p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
