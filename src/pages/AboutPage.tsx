import { LocalizedValue } from '../components/ui/LocalizedValue';
import { InterfaceText } from '../components/ui/InterfaceText';
import { ManagedImg } from '../components/ui/ManagedElements';
import { usePageMedia } from '../lib/pageMedia';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Users,
  Building2,
} from 'lucide-react';
import { Language, PageId } from '../types';
import { useTextOverride } from '../context/TextOverrideContext';
import { BrandLogo } from '../components/ui/BrandLogo';
import { getPageHref, handleSemanticClick } from '../lib/navigation';
import { useData } from '../context/DataContext';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export function AboutPage({ onNavigate, language }: AboutPageProps) {
  const { translations } = useTextOverride();
  const { aboutImage } = usePageMedia();
  const { teamMembers, offices, statistics, partnerBrands } = useData();
  const t = translations[language];

  const publishedForRealEstate = <T extends { sector: string; status: string; order: number }>(items: T[]) =>
    items
      .filter((item) => item.status === 'published' && ['realestate', 'group', 'all'].includes(item.sector))
      .sort((a, b) => a.order - b.order);

  const publishedTeam = publishedForRealEstate(teamMembers);
  const publishedOffices = publishedForRealEstate(offices);
  const publishedStatistics = publishedForRealEstate(statistics);
  const publishedPartners = publishedForRealEstate(partnerBrands);
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
      <div className="bg-[#034DA2] text-slate-100 rounded-3xl p-8 sm:p-10 border border-blue-800/60 shadow-xl space-y-6">
        <h2 className="border-b border-white/20 pb-6 text-2xl font-bold font-display-serif text-white">
          {language === 'en' ? <InterfaceText id="realestate.AboutPage.kgqvfj4" source="HARD Real Estate" /> : <InterfaceText id="realestate.AboutPage.kbrh0q0" source="هارد العقارية" />}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="space-y-1 p-4 bg-white/10 rounded-2xl border border-white/15">
            <span className="text-xs text-blue-100/80 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.k1kp5qmi" source="FAL License | Real Estate General Authority" /> : <InterfaceText id="realestate.AboutPage.kfxs5ub" source="رخصة فال | الهيئة العامة للعقار" />}</span>
            <bdi dir="ltr" className="font-mono font-bold text-white"><LocalizedValue value="1200048912" /></bdi>
          </div>

          <div className="space-y-1 p-4 bg-white/10 rounded-2xl border border-white/15">
            <span className="text-xs text-blue-100/80 block">{language === 'en' ? 'Commercial Registration' : 'السجل التجاري'}</span>
            <bdi dir="ltr" className="font-mono font-bold text-white"><LocalizedValue value="1111111111" /></bdi>
            <span className="text-[11px] text-blue-100/80 block">{language === 'en' ? 'Dammam, Eastern Province' : 'الدمام، المنطقة الشرقية'}</span>
          </div>

          <div className="space-y-1 p-4 bg-white/10 rounded-2xl border border-white/15">
            <span className="text-xs text-blue-100/80 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.k1mx5fby" source="Headquarters" /> : <InterfaceText id="realestate.AboutPage.k1ajuqev" source="المقر الرئيسي" />}</span>
            <span className="font-bold text-white">{language === 'en' ? <InterfaceText id="realestate.AboutPage.k1lcr57c" source="Dammam, Saudi Arabia" /> : <InterfaceText id="realestate.AboutPage.kqzmrka" source="الدمام، المملكة العربية السعودية" />}</span>
            <span className="text-[11px] text-blue-100/80 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.ku3v7om" source="Prince Mutaib bin Abdulaziz Road, Hajr District" /> : <InterfaceText id="realestate.AboutPage.k1l8zqf8" source="طريق الأمير متعب بن عبد العزيز، حي هجر" />}</span>
          </div>

          <div className="space-y-1 p-4 bg-white/10 rounded-2xl border border-white/15">
            <span className="text-xs text-blue-100/80 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.kufr8gf" source="Core Jurisdiction" /> : <InterfaceText id="realestate.AboutPage.k1ivtchn" source="نطاق العمل الرئيسي" />}</span>
            <span className="font-bold text-white">{language === 'en' ? <InterfaceText id="realestate.AboutPage.kpl1125" source="Eastern Province" /> : <InterfaceText id="realestate.AboutPage.k1cw9xe4" source="المنطقة الشرقية" />}</span>
            <span className="text-[11px] text-blue-100/80 block">{language === 'en' ? <InterfaceText id="realestate.AboutPage.kldi7o" source="Residential, commercial, industrial and development" /> : <InterfaceText id="realestate.AboutPage.k1kakw04" source="سكني وتجاري وصناعي وتطوير" />}</span>
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

      {/* Managed business statistics */}
      {publishedStatistics.length > 0 && (
        <section className="space-y-6" aria-labelledby="about-managed-statistics">
          <div className="text-center space-y-2">
            <h3 id="about-managed-statistics" className="text-2xl sm:text-3xl font-bold text-slate-900 font-display-serif">
              {language === 'ar' ? 'مؤشرات وأرقام هارد' : 'HARD at a Glance'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {language === 'ar' ? 'المؤشرات المنشورة من لوحة الإدارة.' : 'Published metrics managed from the administration dashboard.'}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {publishedStatistics.map((stat) => (
              <div key={stat.id} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-blue-700 font-display-serif">
                  <LocalizedValue value={stat.value} />
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900">
                  <LocalizedValue value={stat.label[language]} />
                </div>
                {stat.description?.[language] && (
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    <LocalizedValue value={stat.description[language]} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Managed team members */}
      {publishedTeam.length > 0 && (
        <section className="space-y-6" aria-labelledby="about-managed-team">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <h3 id="about-managed-team" className="text-2xl sm:text-3xl font-bold text-slate-900 font-display-serif">
              {language === 'ar' ? 'فريق هارد' : 'HARD Team'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publishedTeam.map((member) => (
              <article key={member.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
                <div className="aspect-4/3 bg-slate-100">
                  {member.avatar ? (
                    <ManagedImg copyScope="realestate.AboutPage" src={member.avatar}
                      alt={member.name[language]} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300"><Users className="h-12 w-12" /></div>
                  )}
                </div>
                <div className="p-5 space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900"><LocalizedValue value={member.name[language]} /></h4>
                  <p className="text-xs font-semibold text-blue-700"><LocalizedValue value={member.role[language]} /></p>
                  {member.bio?.[language] && <p className="pt-1 text-xs leading-relaxed text-slate-600"><LocalizedValue value={member.bio[language]} /></p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Managed offices */}
      {publishedOffices.length > 0 && (
        <section className="space-y-6" aria-labelledby="about-managed-offices">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <h3 id="about-managed-offices" className="text-2xl sm:text-3xl font-bold text-slate-900 font-display-serif">
              {language === 'ar' ? 'فروع ومقرات هارد' : 'HARD Offices'}
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {publishedOffices.map((office) => (
              <article key={office.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
                {office.image && (
                  <div className="aspect-16/7 bg-slate-100">
                    <ManagedImg copyScope="realestate.AboutPage" src={office.image}
                      alt={office.name[language]} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900"><LocalizedValue value={office.name[language]} /></h4>
                    <p className="text-xs text-slate-500"><LocalizedValue value={office.city[language]} /></p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <span><LocalizedValue value={office.address[language]} /></span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-700">
                    {office.phone && <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-blue-700"><Phone className="h-3.5 w-3.5" /> <bdi>{office.phone}</bdi></a>}
                    {office.email && <a href={`mailto:${office.email}`} className="inline-flex items-center gap-1.5 hover:text-blue-700"><Mail className="h-3.5 w-3.5" /> {office.email}</a>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Managed partner brands */}
      {publishedPartners.length > 0 && (
        <section className="space-y-6" aria-labelledby="about-managed-partners">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
            <h3 id="about-managed-partners" className="text-2xl sm:text-3xl font-bold text-slate-900 font-display-serif">
              {language === 'ar' ? 'شركاؤنا' : 'Our Partners'}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {publishedPartners.map((partner) => {
              const content = (
                <div className="flex h-28 items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  {partner.logoUrl ? (
                    <ManagedImg copyScope="realestate.AboutPage" src={partner.logoUrl}
                      alt={partner.name[language]} referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-slate-700"><LocalizedValue value={partner.name[language]} /></span>
                  )}
                </div>
              );
              return partner.websiteUrl ? (
                <a key={partner.id} href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={partner.name[language]}>
                  {content}
                </a>
              ) : <div key={partner.id}>{content}</div>;
            })}
          </div>
        </section>
      )}

      {/* CTA Box */}
      <div className="bg-[#034DA2] text-white rounded-3xl p-8 sm:p-10 w-full space-y-5 text-center flex flex-col items-center">
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
