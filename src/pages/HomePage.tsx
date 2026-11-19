import { LocalizedValue } from '../components/ui/LocalizedValue';
import { WhatsAppIcon } from '../components/ui/WhatsAppIcon';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { InterfaceText } from '../components/ui/InterfaceText';
import { ManagedImg } from '../components/ui/ManagedElements';
import { usePropertyTypes } from '../lib/usePropertyTypes';
import { getLocalizedText } from '../lib/utils';
import { SECTOR_CONTACT_DETAILS } from '../lib/sectors';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { subscribeSectorSection } from '../lib/db/hardSectorSections';
import { defaultRealEstateHero, publicRealEstateImage, realEstateHeroSection } from '../lib/realEstateHomeContent';
import React, { useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Home,
  CheckCircle2,
  Building,
  Key,
  TrendingUp,
  SlidersHorizontal,
  Compass,
  ShieldAlert,
} from 'lucide-react';
import { Language, PageId, Property, PropertyFilterParams, Project } from '../types';
import { translations as defaultTranslations } from '../lib/translations';
import { getHeroPropertyFilters } from '../lib/heroPropertySearch';
import { CitySearchDropdown } from '../components/ui/CitySearchDropdown';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PropertyCard } from '../components/ui/PropertyCard';
import { ServicesSection } from '../components/home/ServicesSection';
import { loadPublishedProjects } from '../lib/db/hardCatalog';
import { useData } from '../context/DataContext';
import { useTextOverride } from '../context/TextOverrideContext';
import { BrandLogo } from '../components/ui/BrandLogo';
import { getPageHref, handleSemanticClick } from '../lib/navigation';

interface HomePageProps {
  onNavigate: (page: PageId, filters?: PropertyFilterParams) => void;
  onSelectProperty: (property: Property) => void;
  language: Language;
  onOpenBookViewingModal: (property: Property) => void;
  onOpenListPropertyModal: () => void;
  onOpenInquiryModal: () => void;
}

export function HomePage({
  onNavigate,
  onSelectProperty,
  language,
  onOpenBookViewingModal,
  onOpenListPropertyModal,
  onOpenInquiryModal,
}: HomePageProps) {
  const propertyTypes = usePropertyTypes();
  const { translations } = useTextOverride();
  const t = translations[language] || defaultTranslations[language];
  const { properties } = useData();
  const [hero, setHero] = useState(defaultRealEstateHero);
  React.useEffect(() => subscribeSectorSection(realEstateHeroSection, defaultRealEstateHero, setHero), []);
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  // Search Filter State in Hero
  const [activeTab, setActiveTab] = useState<'all' | 'buy' | 'rent'>('all');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchBudget, setSearchBudget] = useState('all');

  // Featured properties: 3-column top listings fetched directly from the database layer
  const featuredProperties = properties.filter((p) => p.featured).slice(0, 3).length > 0
    ? properties.filter((p) => p.featured).slice(0, 3)
    : properties.slice(0, 3);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectIndex, setProjectIndex] = useState(0);
  const spotlightProject = projects[projectIndex];
  const PreviousProjectIcon = language === 'ar' ? ChevronRight : ChevronLeft;
  const NextProjectIcon = language === 'ar' ? ChevronLeft : ChevronRight;
  const { getEffectiveSettings } = useSiteSettings();
  const realEstateBrand = getEffectiveSettings('realestate');
  const projectWhatsapp = (realEstateBrand.whatsappNumber || SECTOR_CONTACT_DETAILS.realestate.whatsapp).replace(/\D/g, '');
  React.useEffect(() => {
    const controller = new AbortController();
    loadPublishedProjects(controller.signal).then((items) => {
      if (!controller.signal.aborted) setProjects(items.map(({ content }) => content));
    }).catch(() => {});
    return () => controller.abort();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();

    onNavigate('properties', getHeroPropertyFilters(activeTab, searchLocation, searchType, searchBudget));
  };

  const statList = [
    { value: t.home.stats.volume, label: t.home.stats.volumeLabel },
    { value: t.home.stats.properties, label: t.home.stats.propertiesLabel },
    { value: t.home.stats.clients, label: t.home.stats.clientsLabel },
    { value: t.home.stats.advisors, label: t.home.stats.advisorsLabel },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 lg:space-y-32 pb-20">
      <div className="space-y-8 sm:space-y-12">
      {/* 1. HERO SECTION */}
      <section
        id="home-hero-section"
        className="relative bg-[#034DA2] text-white min-h-[660px] sm:min-h-[720px] flex items-center overflow-visible pb-24 sm:pb-32"
      >
        {/* High-End Architectural Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <ManagedImg copyScope="realestate.HomePage"
            src={publicRealEstateImage(hero?.bgImageUrl, defaultRealEstateHero.bgImageUrl)}
            alt="Luxury Modern Architecture"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-65 brightness-110 contrast-105 scale-105 transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#034DA2]/90 via-[#034DA2]/45 to-[#034DA2]/15" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#034DA2]/25 to-[#034DA2]/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full space-y-10 overflow-visible">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200 shadow-sm">
              <span><LocalizedValue value={t.home.heroTag} /></span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display-serif leading-tight">
              <LocalizedValue value={t.home.heroTitlePrefix} /><LocalizedValue value={' '} />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-blue-400">
                <LocalizedValue value={t.home.heroTitleHighlight} />
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              <LocalizedValue value={t.home.heroSubtitle} />
            </p>
          </div>

          {/* Prominent, Simplified Search Bar (Location, Property Type, Price Range) - 25% wider container with full dropdown visibility */}
          <div className="relative z-30 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/20 text-slate-900 max-w-5xl lg:max-w-6xl w-full overflow-visible">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200/80 pb-3">
              {(['all', 'buy', 'rent'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={activeTab === mode}
                  onClick={() => {
                    if (activeTab !== mode) setSearchBudget('all');
                    setActiveTab(mode);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === mode ? 'bg-hard-gradient text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LocalizedValue value={mode === 'all' ? (language === 'ar' ? 'الكل' : 'All') : t.home.searchTabs[mode]} />
                </button>
              ))}
            </div>

            {/* Filter Form Bar: Location, Property Type, Price Range */}
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-30 overflow-visible">
              {/* Location / City Input with embedded 50 Saudi cities dropdown & search */}
              <div>
                <label htmlFor="hero-city-search" className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  <LocalizedValue value={t.properties.filters.city} />
                </label>
                <CitySearchDropdown
                  value={searchLocation}
                  onChange={(city) => setSearchLocation(city === 'all' ? '' : city)}
                  language={language}
                  placeholder={language === 'en' ? 'Search by city name' : 'ابحث باسم المدينة'}
                  showAllOption
                  id="hero-city-search"
                />
              </div>

              {/* Property Type Dropdown */}
              <div>
                <label htmlFor="hero-property-type" className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  <LocalizedValue value={t.properties.filters.type} />
                </label>
                <SearchableSelect
                  id="hero-property-type"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">{t.properties.filters.allTypes}</option>
                  {propertyTypes.filter((item) => item.active).map((item) => (
                    <option key={item.id} value={item.id}>{language === 'ar' ? item.nameAr : item.nameEn}</option>
                  ))}
                </SearchableSelect>
              </div>

              {/* Price Range Dropdown */}
              <div>
                <label htmlFor="hero-property-budget" className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  <LocalizedValue value={t.properties.filters.priceRange} />
                </label>
                <SearchableSelect
                  id="hero-property-budget"
                  value={searchBudget}
                  onChange={(e) => setSearchBudget(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {activeTab === 'rent' ? (
                    <>
                      <option value="all">{language === 'en' ? 'Any Rental Budget' : 'جميع ميزانيات الإيجار'}</option>
                      <option value="rent-under-100k">{language === 'en' ? 'Under 100,000 SAR / yr' : 'أقل من 100,000 ر.س / سنوياً'}</option>
                      <option value="rent-100k-200k">{language === 'en' ? '100,000 - 200,000 SAR / yr' : '100,000 - 200,000 ر.س / سنوياً'}</option>
                      <option value="rent-200k-350k">{language === 'en' ? '200,000 - 350,000 SAR / yr' : '200,000 - 350,000 ر.س / سنوياً'}</option>
                      <option value="rent-350k+">{language === 'en' ? '350,000+ SAR / yr' : 'أكثر من 350,000 ر.س / سنوياً'}</option>
                    </>
                  ) : (
                    <>
                      <option value="all">{language === 'en' ? 'Any Purchase Budget' : 'جميع ميزانيات الشراء'}</option>
                      <option value="500k-1m">{language === 'en' ? '500,000 - 1,000,000 SAR' : '500,000 - 1,000,000 ريال'}</option>
                      <option value="1m-3m">{language === 'en' ? '1,000,000 - 3,000,000 SAR' : '1,000,000 - 3,000,000 ريال'}</option>
                      <option value="3m-6m">{language === 'en' ? '3,000,000 - 6,000,000 SAR' : '3,000,000 - 6,000,000 ريال'}</option>
                      <option value="6m-12m">{language === 'en' ? '6,000,000 - 12,000,000 SAR' : '6,000,000 - 12,000,000 ريال'}</option>
                      <option value="12m+">{language === 'en' ? '12,000,000+ SAR' : '12,000,000+ ريال'}</option>
                    </>
                  )}
                </SearchableSelect>
              </div>

              {/* Search Submit Button */}
              <div className="flex items-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center h-11 font-bold shadow-md cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span><LocalizedValue value={t.cta.viewAvailableProperties} /></span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* GLOBAL LISTING CTA BANNER */}
      <section id="property-listing-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-hard-gradient text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-xl border border-white/75 bg-white p-2 shadow-sm">
                <BrandLogo size="xs" language={language} variant="dark" isIconOnly />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-100">
                {language === 'en' ? <InterfaceText id="realestate.HomePage.k1kzx879" source="Sell or Lease with HARD" /> : <InterfaceText id="realestate.HomePage.k1mk62gy" source="اعرض عقارك للبيع أو الإيجار" />}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display-serif">
              <LocalizedValue value={t.home.marketingBannerTitle} />
            </h3>
            <p className="text-xs sm:text-sm text-blue-50 leading-relaxed">
              <LocalizedValue value={t.home.marketingBannerSubtitle} />
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="white"
              size="lg"
              onClick={onOpenListPropertyModal}
              className="font-bold text-blue-900 shadow-xl"
            >
              <span><LocalizedValue value={t.cta.listProperty} /></span>
              <ArrowIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* TRUST STATS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse sm:divide-slate-100">
          {statList.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center text-center space-y-1.5 px-3 py-2"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-700 font-display-serif tracking-tight text-center">
                <bdi dir="ltr"><LocalizedValue value={stat.value} /></bdi>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium text-center leading-snug">
                <LocalizedValue value={stat.label} />
              </div>
            </div>
          ))}
        </div>

      </section>

      </div>

      {/* 2. FEATURED LISTINGS GRID (3-Column Card Layout) */}
      <section id="featured-listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
              <LocalizedValue value={t.home.featuredSectionTitle} />
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <LocalizedValue value={t.home.featuredSectionSubtitle} />
            </p>
          </div>

          <a
            href={getPageHref('properties')}
            onClick={(e) => handleSemanticClick(e, () => onNavigate('properties'))}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span><LocalizedValue value={t.cta.viewAvailableProperties} /></span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 3-Column Card Grid displaying top properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredProperties.map((property, idx) => (
            <PropertyCard
              key={property.id}
              property={property}
              language={language}
              onSelectProperty={onSelectProperty}
              onOpenBookViewingModal={onOpenBookViewingModal}
              badgeType={idx === 0 ? 'featured' : idx === 2 ? 'new' : 'featured'}
            />
          ))}
        </div>
      </section>

      {/* 3. OUR SERVICES: ALTERNATING ROWS (Brokerage, Marketing, Advisory) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ServicesSection
          language={language}
          onNavigate={onNavigate}
          onOpenListPropertyModal={onOpenListPropertyModal}
          onOpenInquiryModal={onOpenInquiryModal}
        />
      </section>



      {/* MASTER PROJECT SPOTLIGHT */}
      {spotlightProject && (
        <section id="project-spotlight" className="max-w-7xl mx-auto space-y-4 px-4 sm:px-6 lg:px-8">
          <div id="project-spotlight-slide" aria-live="polite" className="bg-[#034DA2] text-white rounded-3xl overflow-hidden border border-blue-800/60 shadow-2xl grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 relative aspect-16/10 lg:aspect-auto overflow-hidden bg-[#034DA2]">
              <ManagedImg copyScope="realestate.HomePage"
                key={spotlightProject.id}
                src={spotlightProject.image || spotlightProject.gallery?.[0]}
                alt={getLocalizedText(spotlightProject.title, language)}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
              />
              {spotlightProject.financialMetric?.isVerified ? (
                <div className="absolute top-4 start-4 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span><LocalizedValue value={spotlightProject.financialMetric.value} /> <LocalizedValue value={spotlightProject.financialMetric.metricLabel?.[language]} /></span>
                </div>
              ) : (
                <div
                  className="absolute top-4 start-4 bg-[#034DA2]/95 backdrop-blur-md text-amber-200 border border-white/20 text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg flex items-center gap-1.5"
                  title={spotlightProject.financialMetric?.statusNote?.[language]}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><LocalizedValue value={spotlightProject.financialMetric?.verificationStatus?.[language] || spotlightProject.roiProjected} /></span>
                </div>
              )}
            </div>

            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{language === 'en' ? <InterfaceText id="realestate.HomePage.k1k7jzz2" source="Exclusive Master Project" /> : <InterfaceText id="realestate.HomePage.k1j15a47" source="مشروع تطويري حصري" />}</Badge>
                  <span className="text-xs text-blue-300 font-medium"><LocalizedValue value={getLocalizedText(spotlightProject.developer, language)} /></span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold font-display-serif">
                  <LocalizedValue value={getLocalizedText(spotlightProject.title, language)} />
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <LocalizedValue value={getLocalizedText(spotlightProject.description, language)} />
                </p>

                {spotlightProject.financialMetric && !spotlightProject.financialMetric.isVerified && spotlightProject.financialMetric.statusNote && (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200 leading-relaxed">
                    <strong className="text-amber-400 block mb-0.5">{language === 'en' ? <InterfaceText id="realestate.HomePage.kdk6zv1" source="Financial Audit Notice:" /> : <InterfaceText id="realestate.HomePage.k1iwuaoc" source="إشعار التدقيق المالي:" />}</strong>
                    <span><LocalizedValue value={spotlightProject.financialMetric.statusNote[language]} /></span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15">
                    <span className="text-[11px] text-slate-400 block font-medium"><LocalizedValue value={t.projects.startingFrom} />:</span>
                    <strong className="text-base sm:text-lg text-blue-400 font-display-serif">
                      <LocalizedValue value={spotlightProject.startingPriceSAR} />
                    </strong>
                  </div>
                  <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 block font-medium"><LocalizedValue value={t.projects.handover} />:</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        <LocalizedValue value={spotlightProject.lastUpdated || '2026-10-09'} />
                      </span>
                    </div>
                    <strong className="text-base sm:text-lg text-slate-200 font-medium block">
                      <LocalizedValue value={getLocalizedText(spotlightProject.handoverDate, language)} />
                    </strong>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span><LocalizedValue value={t.projects.progress} />: <LocalizedValue value={spotlightProject.progressPercentage ?? 0} />%</span>
                      <span className="text-blue-400 font-semibold"><LocalizedValue value={t.projects.underConstruction} /></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={getPageHref('projects')}
                  onClick={(e) => handleSemanticClick(e, () => onNavigate('projects'))}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold justify-center shadow-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <span><LocalizedValue value={t.cta.exploreProjects} /></span>
                  <ArrowIcon className="w-4 h-4" />
                </a>
                <Button
                  href={`https://wa.me/${projectWhatsapp}?text=${encodeURIComponent(language === 'ar'
                    ? 'مرحبًا، أود الاستفسار عن مشروع ' + getLocalizedText(spotlightProject.title, language)
                    : 'Hello, I would like to ask about ' + getLocalizedText(spotlightProject.title, language))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                  className="justify-center"
                >
                  <WhatsAppIcon className="size-4" aria-hidden="true" />
                  <span>{language === 'ar' ? <InterfaceText id="realestate.HomePage.k1bmgmig" source="واتساب" /> : <InterfaceText id="realestate.HomePage.k1d5zzif" source="WhatsApp" />}</span>
                </Button>
              </div>
            </div>
          </div>
          {projects.length > 1 && <nav className="flex items-center justify-center gap-3" aria-label={language === 'ar' ? 'تصفح المشاريع' : 'Browse projects'}>
            <Button type="button" size="icon" variant="outline" aria-controls="project-spotlight-slide"
              aria-label={language === 'ar' ? 'المشروع السابق' : 'Previous project'}
              onClick={() => setProjectIndex((index) => (index + projects.length - 1) % projects.length)}>
              <PreviousProjectIcon className="size-5" aria-hidden="true" />
            </Button>
            <bdi dir="ltr" className="text-sm text-slate-600"><LocalizedValue value={projectIndex + 1} /> / <LocalizedValue value={projects.length} /></bdi>
            <Button type="button" size="icon" variant="outline" aria-controls="project-spotlight-slide"
              aria-label={language === 'ar' ? 'المشروع التالي' : 'Next project'}
              onClick={() => setProjectIndex((index) => (index + 1) % projects.length)}>
              <NextProjectIcon className="size-5" aria-hidden="true" />
            </Button>
          </nav>}
        </section>
      )}


    </div>
  );
}
