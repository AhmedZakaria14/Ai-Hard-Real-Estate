import { LocalizedValue } from '../../components/ui/LocalizedValue';
import { useTextOverride } from '../../context/TextOverrideContext';
import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { pick } from '../translations';

export function HVACFAQSection() {
  const { hvac: T } = useTextOverride();
  const { language, isAr, faqItems } = useHVAC();
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            <LocalizedValue value={pick(T.faq.title, language)} />
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            <LocalizedValue value={pick(T.faq.subtitle, language)} />
          </p>
        </div>

        {/* Shadcn-style Accordion */}
        <div className="space-y-3">
          {faqItems.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden text-start ${
                  isOpen
                    ? 'border-[#0EA5E9]/50 shadow-sm ring-1 ring-[#0EA5E9]/20'
                    : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-start font-semibold text-slate-900 text-sm sm:text-base cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={`${isOpen ? 'text-[#0EA5E9]' : 'text-slate-900'} transition-colors`}>
                    <LocalizedValue value={isAr ? faq.questionAr : faq.questionEn} />
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'rotate-180 bg-sky-50 text-[#0EA5E9]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Accordion Content */}
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-200">
                    <p><LocalizedValue value={isAr ? faq.answerAr : faq.answerEn} /></p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
