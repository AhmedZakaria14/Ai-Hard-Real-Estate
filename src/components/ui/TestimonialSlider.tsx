import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, ShieldCheck } from 'lucide-react';
import type { Language, Testimonial } from '../../types';
import { getLocalizedText } from '../../lib/utils';
import { ComplianceVerificationModal } from '../modals/ComplianceVerificationModal';

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  language: Language;
}

const storiesPerPage = 2;

export function TestimonialSlider({ testimonials, language }: TestimonialSliderProps) {
  const [page, setPage] = useState(0);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const ar = language === 'ar';
  if (!testimonials.length) return null;

  const pageCount = Math.ceil(testimonials.length / storiesPerPage);
  const currentPage = page % pageCount;
  const start = currentPage * storiesPerPage;
  const stories = testimonials.slice(start, start + storiesPerPage);
  const ArrowBack = ar ? ChevronRight : ChevronLeft;
  const ArrowNext = ar ? ChevronLeft : ChevronRight;
  const arrowClass = 'flex size-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-white hover:bg-blue-700';

  return <div className="space-y-4">
    <div id="client-story-cards" className="grid gap-4 md:grid-cols-2" aria-live="polite">
      {stories.map((story) => {
        const rating = Math.max(0, Math.min(5, Number(story.rating) || 0));
        const name = getLocalizedText(story.name, language);
        const identity = [getLocalizedText(story.role, language), getLocalizedText(story.location, language)].filter(Boolean);
        return <article key={story.id} className="flex flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white sm:p-7">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <Star className="size-4 fill-current" aria-hidden="true" />
            <bdi dir="ltr">{rating.toFixed(1)} / 5</bdi>
          </p>
          <blockquote className="grow text-base leading-relaxed text-slate-100 sm:text-lg">
            {getLocalizedText(story.quote, language)}
          </blockquote>
          <div className="flex items-center gap-3 border-t border-slate-700 pt-4">
            {story.avatar && <img src={story.avatar} alt="" width={48} height={48} loading="lazy" referrerPolicy="no-referrer" className="size-12 shrink-0 rounded-full object-cover" />}
            <div>
              <h3 className="font-bold">{name}</h3>
              {identity.length > 0 && <p className="text-xs text-slate-300">{identity.join(' · ')}</p>}
              <p className="mt-1 text-xs text-blue-200">{getLocalizedText(story.dealHighlight, language)}</p>
            </div>
          </div>
        </article>;
      })}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button type="button" onClick={() => setComplianceOpen(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 underline">
        <ShieldCheck className="size-4 text-emerald-700" aria-hidden="true" />
        {ar ? 'سياسة توثيق التقييمات' : 'Review verification policy'}
      </button>
      {pageCount > 1 && <nav aria-label={ar ? 'تصفح قصص العملاء' : 'Browse client stories'} className="flex items-center gap-3">
        <button type="button" aria-controls="client-story-cards" onClick={() => setPage((currentPage + pageCount - 1) % pageCount)}
          aria-label={ar ? 'السابق' : 'Previous'} className={arrowClass}><ArrowBack className="size-5" aria-hidden="true" /></button>
        <bdi dir="ltr" className="text-sm text-slate-600">{currentPage + 1} / {pageCount}</bdi>
        <button type="button" aria-controls="client-story-cards" onClick={() => setPage((currentPage + 1) % pageCount)}
          aria-label={ar ? 'التالي' : 'Next'} className={arrowClass}><ArrowNext className="size-5" aria-hidden="true" /></button>
      </nav>}
    </div>
    <ComplianceVerificationModal isOpen={complianceOpen} onClose={() => setComplianceOpen(false)} language={language} initialTab="reviews" />
  </div>;
}
