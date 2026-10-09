import React from 'react';
import {
  ShieldCheck,
  Award,
  Users2,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { Language, PageId } from '../types';
import { translations } from '../lib/translations';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BrandLogo } from '../components/ui/BrandLogo';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export function AboutPage({ onNavigate, language }: AboutPageProps) {
  const t = translations[language];
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <Badge variant="primary">{language === 'en' ? 'Who We Are' : 'عن شركتنا'}</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-display-serif tracking-tight">
          {t.about.pageTitle}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {t.about.pageSubtitle}
        </p>
      </div>

      {/* Mission Section with visual card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display-serif">
            {t.about.missionTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {t.about.missionText}
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              {language === 'en' ? 'Regulated Brokerage' : 'وساطة مرخصة رسمياً'}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Award className="w-4 h-4 text-blue-600" />
              {language === 'en' ? 'Global Investor Network' : 'شبكة مستثمرين دولية'}
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
            alt="HARD Headquarters"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display-serif">
            {language === 'en' ? 'Our Core Brokerage Pillars' : 'أركان العمل والوساطة الأساسية'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'en' ? 'The foundational principles that guide every property transaction.' : 'المبادئ التوجيهية التي تحكم كل صفقة عقارية واستشارة نقدمها.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.about.values.map((val, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm font-display-serif">
                0{idx + 1}
              </div>
              <h4 className="text-base font-bold text-slate-900 font-display-serif">
                {val.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-5 max-w-3xl mx-auto flex flex-col items-center">
        <BrandLogo size="lg" language={language} variant="light" />
        <h3 className="text-xl sm:text-2xl font-bold font-display-serif">
          {language === 'en' ? 'Ready to Work with HARD Real Estate?' : 'جاهز للبدء مع هارد للعقارات؟'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          {language === 'en'
            ? 'Connect with a senior brokerage advisor today for tailored acquisition and listing solutions.'
            : 'تواصل مع أحد كبار مستشارينا اليوم للحصول على حلول شراء واستثمار مخصصة.'}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="primary" onClick={() => onNavigate('contact')}>
            <span>{t.cta.getInTouch}</span>
            <ArrowIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
