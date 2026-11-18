import { LocalizedValue } from '../components/ui/LocalizedValue';
import { InterfaceText } from '../components/ui/InterfaceText';
import { ManagedImg } from '../components/ui/ManagedElements';
import { usePageMedia } from '../lib/pageMedia';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Language, PageId } from '../types';
import { useTextOverride } from '../context/TextOverrideContext';
import { BrandLogo } from '../components/ui/BrandLogo';
import { getPageHref, handleSemanticClick } from '../lib/navigation';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export function AboutPage({ onNavigate, language }: AboutPageProps) {
  const { translations } = useTextOverride();
  const { aboutImage } = usePageMedia();
  const t = translations[language];
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-display-serif tracking-tight">
          <LocalizedValue value={t.about.pageTitle} />
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          <LocalizedValue value={t.about.pageSubtitle} />
        </p>
      </div>

      {/* Mission Section with visual card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display-serif">
            <LocalizedValue value={t.about.missionTitle} />
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            <LocalizedValue value={t.about.missionText} />
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-900">
              <ShieldCheck className="size-4 text-blue-600" aria-hidden="true" />
              {language === 'en' ? <InterfaceText id="realestate.AboutPage.kpqvebp" source="Officially licensed real estate marketing and brokerage" /> : <InterfaceText id="realestate.AboutPage.k16sgmwr" source="تسويق وساطة مرخصة رسمياً" />}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Award className="w-4 h-4 text-blue-600" />
              {language === 'en' ? <InterfaceText id="realestate.AboutPage.k38x75h" source="Local and International Investor Network" /> : <InterfaceText id="realestate.AboutPage.k17kaqmv" source="شبكة مستثمرين محلية ودولية" />}
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100">
          <ManagedImg copyScope="realestate.AboutPage"
            src={aboutImage}
            alt="HARD Headquarters"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Governance & Legal Identity Card */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl space-y-6">
        <h2 className="border-b border-slate-800 pb-6 text-2xl font-bold font-display-serif text-white">
          {language === 'en' ? <InterfaceText id="realestate.AboutPage.kgqvfj4" source="HARD Real Estate" /> : <InterfaceText id="realestate.AboutPage.kbrh0q0" source="هارد العقارية" />}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="space-y-1 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.k1kp5qmi" source="FAL License | Real Estate General Authority" /> : <InterfaceText id="realestate.AboutPage.kfxs5ub" source="رخصة فال | الهيئة العامة للعقار" />}</span>
            <bdi dir="ltr" className="font-mono font-bold text-slate-200"><LocalizedValue value="1200048912" /></bdi>
          </div>

          <div className="space-y-1 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.k1npru84" source="Commercial Registration (CR)" /> : <InterfaceText id="realestate.AboutPage.k12tkn22" source="السجل التجاري" />}</span>
            <bdi dir="ltr" className="font-mono font-bold text-slate-200"><LocalizedValue value="1111111111" /></bdi>
            <span className="text-[11px] text-slate-400 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.kfgbbxm" source="Dammam, Eastern Province" /> : <InterfaceText id="realestate.AboutPage.k386c7p" source="الدمام، المنطقة الشرقية" />}</span>
          </div>

          <div className="space-y-1 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.k1mx5fby" source="Headquarters" /> : <InterfaceText id="realestate.AboutPage.k1ajuqev" source="المقر الرئيسي" />}</span>
            <span className="font-bold text-slate-200">{language === 'en' ? <InterfaceText id="realestate.AboutPage.k1lcr57c" source="Dammam, Saudi Arabia" /> : <InterfaceText id="realestate.AboutPage.kqzmrka" source="الدمام، المملكة العربية السعودية" />}</span>
            <span className="text-[11px] text-slate-400 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.ku3v7om" source="Prince Mutaib bin Abdulaziz Road, Hajr District" /> : <InterfaceText id="realestate.AboutPage.k1l8zqf8" source="طريق الأمير متعب بن عبد العزيز، حي هجر" />}</span>
          </div>

          <div className="space-y-1 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.kufr8gf" source="Core Jurisdiction" /> : <InterfaceText id="realestate.AboutPage.k1ivtchn" source="نطاق العمل الرئيسي" />}</span>
            <span className="font-bold text-slate-200">{language === 'en' ? <InterfaceText id="realestate.AboutPage.kpl1125" source="Eastern Province" /> : <InterfaceText id="realestate.AboutPage.k1cw9xe4" source="المنطقة الشرقية" />}</span>
            <span className="text-[11px] text-slate-400 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.kldi7o" source="Residential, commercial, industrial and development" /> : <InterfaceText id="realestate.AboutPage.k1kakw04" source="سكني وتجاري وصناعي وتطوير" />}</span>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display-serif">
            {language === 'en' ? <InterfaceText id="realestate.AboutPage.kxvbhgm" source="Pillars of Real Estate Brokerage and Marketing" /> : <InterfaceText id="realestate.AboutPage.k1bx1gsa" source="أركان الوساطة والتسويق العقاري" />}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'en' ? <InterfaceText id="realestate.AboutPage.kgvcrhp" source="The principles that guide every property transaction and consultation we provide." /> : <InterfaceText id="realestate.AboutPage.k1w94dxc" source="المبادئ التي تحكم كل صفقة عقارية واستشارة نقدمها" />}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.about.values.map((val, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm font-display-serif"><LocalizedValue value="0" /><LocalizedValue value={idx + 1} />
              </div>
              <h4 className="text-base font-bold text-slate-900 font-display-serif">
                <LocalizedValue value={val.title} />
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                <LocalizedValue value={val.desc} />
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 w-full space-y-5 text-center flex flex-col items-center">
        <BrandLogo size="lg" language={language} variant="light" className="max-w-full p-1 sm:p-2" />
        <h3 className="text-xl sm:text-2xl font-bold font-display-serif">
          {language === 'en' ? <InterfaceText id="realestate.AboutPage.kmka5b8" source="Ready to Work with HARD Real Estate?" /> : <InterfaceText id="realestate.AboutPage.k13opqhu" source="جاهز للبدء مع هارد للعقارات؟" />}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          {language === 'en'
            ? <InterfaceText id="realestate.AboutPage.k5djckw" source="Connect with a senior brokerage advisor today for tailored acquisition and listing solutions." />
            : <InterfaceText id="realestate.AboutPage.k1cmfebg" source="تواصل مع أحد كبار مستشارينا اليوم للحصول على حلول شراء واستثمار مخصصة." />}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <a
            href={getPageHref('contact')}
            onClick={(e) => handleSemanticClick(e, () => onNavigate('contact'))}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-md"
          >
            <span><LocalizedValue value={t.cta.getInTouch} /></span>
            <ArrowIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
