import type { Language } from '../../types';
import { mockTestimonials } from '../../data/mockData';
import { useTextOverride } from '../../context/TextOverrideContext';
import { usePublishedCompanyContent } from '../ui/PublishedCompanyContent';
import { TestimonialSlider } from '../ui/TestimonialSlider';

export function ClientStoriesSection({ language }: { language: Language }) {
  const { translations } = useTextOverride();
  const copy = translations[language].home;
  const { stories } = usePublishedCompanyContent();

  return <section id="testimonials-section" className="mx-auto max-w-7xl space-y-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl space-y-3 text-center">
      <p className="text-sm font-semibold text-blue-700">{copy.testimonialsTag}</p>
      <h2 className="text-2xl font-extrabold text-slate-900 sm:text-4xl">{copy.testimonialsSectionTitle}</h2>
      <p className="text-sm text-slate-600">{copy.testimonialsSectionSubtitle}</p>
    </div>
    <TestimonialSlider testimonials={stories.length ? stories : mockTestimonials} language={language} />
  </section>;
}
