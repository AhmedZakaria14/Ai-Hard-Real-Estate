import React, { useState, useEffect } from 'react';
import { Language, PageId, Property, PropertyFilterParams } from './types';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MarketingPage } from './pages/MarketingPage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { ContactPage } from './pages/ContactPage';
import { CMSApp } from './cms/CMSApp';
import { GroupPortalDashboard } from './pages/GroupPortalDashboard';
import { ConstructionPage } from './pages/ConstructionPage';
import { HVACPage } from './pages/HVACPage';
import { BookViewingModal } from './components/modals/BookViewingModal';
import { ListPropertyModal } from './components/modals/ListPropertyModal';
import { InquiryModal } from './components/modals/InquiryModal';
import { FloatingTextEditor } from './components/ui/FloatingTextEditor';
import { DataProvider, useData } from './context/DataContext';
import { TextOverrideProvider } from './context/TextOverrideContext';

function AppContent() {
  const [language, setLanguage] = useState<Language>('ar');
  const [currentPage, setCurrentPage] = useState<PageId>('portal');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilterParams | null>(null);
  const { properties } = useData();

  // Modals state
  const [bookViewingProperty, setBookViewingProperty] = useState<Property | null>(null);
  const [isListPropertyModalOpen, setIsListPropertyModalOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState('');

  // Handle URL pathname and hash routing
  useEffect(() => {
    const handleUrlRoute = () => {
      let rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');

      let detectedPage: PageId = 'portal';

      if (rawPath.startsWith('/construction') || hash.startsWith('construction')) {
        detectedPage = 'construction';
      } else if (rawPath.startsWith('/realestate') || hash.startsWith('realestate')) {
        let sub = rawPath.startsWith('/realestate')
          ? rawPath.substring('/realestate'.length).replace(/^\/+/, '')
          : hash.replace(/^realestate\/?/, '');

        if (sub === '' || sub === 'home') {
          detectedPage = 'home';
        } else if (sub === 'admin' || sub === 'cms') {
          detectedPage = 'admin';
        } else if (sub === 'properties') {
          detectedPage = 'properties';
        } else if (sub === 'projects') {
          detectedPage = 'projects';
        } else if (sub === 'about') {
          detectedPage = 'about';
        } else if (sub === 'contact') {
          detectedPage = 'contact';
        } else if (sub === 'marketing' || sub === 'services') {
          detectedPage = 'marketing';
        } else if (sub === 'blog') {
          detectedPage = 'blog';
        } else if (sub === 'property-details') {
          detectedPage = 'property-details';
        } else {
          detectedPage = 'home';
        }
      } else if (rawPath === '/admin' || hash === 'admin' || hash === 'cms') {
        detectedPage = 'admin';
      } else if (
        rawPath === '/hvac' ||
        rawPath === '/maintenance' ||
        hash === 'hvac' ||
        hash === 'maintenance' ||
        hash.startsWith('hvac') ||
        hash.startsWith('maintenance')
      ) {
        detectedPage = 'hvac';
      } else {
        // Main path root (/) or default
        detectedPage = 'portal';
      }

      // Check query params if on property-details
      const params = new URLSearchParams(window.location.search);
      const propId = params.get('id');
      if (propId && properties.length > 0) {
        const match = properties.find((p) => p.id === propId || p.slug === propId);
        if (match) {
          setSelectedProperty(match);
        }
      }

      setCurrentPage(detectedPage);
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, [properties]);

  // Synchronize document dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const handleNavigate = (page: PageId, filters?: PropertyFilterParams) => {
    if (filters) {
      setPropertyFilters(filters);
    }
    setCurrentPage(page);

    // Update URL bar based on page
    let newPath = '/';
    let newHash = '';

    if (page === 'portal') {
      newPath = '/';
      newHash = '';
    } else if (page === 'construction') {
      newPath = '/construction';
      newHash = 'construction';
    } else if (page === 'hvac') {
      newPath = '/hvac';
      newHash = 'hvac';
    } else if (page === 'home') {
      newPath = '/realestate';
      newHash = 'realestate';
    } else {
      newPath = `/realestate/${page}`;
      newHash = `realestate/${page}`;
    }

    try {
      window.history.pushState({ page }, '', newPath);
      window.location.hash = newHash;
    } catch {
      // fallback
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setCurrentPage('property-details');
    try {
      window.history.pushState({ page: 'property-details', slug: property.slug }, '', `/realestate/property-details?id=${property.id}`);
      window.location.hash = `realestate/property-details`;
    } catch {
      // fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBookViewing = (property: Property) => {
    setBookViewingProperty(property);
  };

  const handleOpenInquiryModal = (subject?: string) => {
    setInquirySubject(subject || '');
    setInquiryModalOpen(true);
  };

  // 1. Root HARD Group Corporate Multi-Division Dashboard (assigned to /)
  if (currentPage === 'portal') {
    return (
      <GroupPortalDashboard
        language={language}
        onLanguageChange={setLanguage}
        onNavigateToRealEstate={(targetPage = 'home') => handleNavigate(targetPage)}
        onNavigateToConstruction={() => handleNavigate('construction')}
        onNavigateToHVAC={() => handleNavigate('hvac')}
      />
    );
  }

  // 2. HARD Construction Division Page (/construction)
  if (currentPage === 'construction') {
    return (
      <ConstructionPage
        language={language}
        onLanguageChange={setLanguage}
        onNavigate={handleNavigate}
      />
    );
  }

  // 3. HARD HVAC Maintenance Division Page (/hvac or /maintenance)
  if (currentPage === 'hvac') {
    return <HVACPage onNavigatePage={handleNavigate} />;
  }

  // 3. Dedicated Full-Screen Enterprise CMS Mode (/realestate/admin or /admin)
  if (currentPage === 'admin') {
    return (
      <CMSApp
        onReturnToSite={() => handleNavigate('home')}
        onViewPropertyOnSite={(prop) => handleSelectProperty(prop)}
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  // 3. HARD Real Estate Sub-Website (/realestate)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-ui-sans">
      {/* Global Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        language={language}
        onLanguageChange={setLanguage}
        onOpenListPropertyModal={() => setIsListPropertyModalOpen(true)}
      />

      {/* Main Page Layout Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProperty={handleSelectProperty}
            language={language}
            onOpenBookViewingModal={handleOpenBookViewing}
            onOpenListPropertyModal={() => setIsListPropertyModalOpen(true)}
            onOpenInquiryModal={() => handleOpenInquiryModal('General Inquiry')}
          />
        )}

        {currentPage === 'properties' && (
          <PropertiesPage
            onNavigate={handleNavigate}
            onSelectProperty={handleSelectProperty}
            language={language}
            onOpenBookViewingModal={handleOpenBookViewing}
            initialFilters={propertyFilters}
          />
        )}

        {currentPage === 'property-details' && (
          <PropertyDetailPage
            property={selectedProperty || properties[0]}
            onBack={() => handleNavigate('properties')}
            onNavigate={handleNavigate}
            onSelectProperty={handleSelectProperty}
            language={language}
            onOpenBookViewingModal={handleOpenBookViewing}
          />
        )}

        {currentPage === 'projects' && (
          <ProjectsPage
            onNavigate={handleNavigate}
            language={language}
            onOpenInquiryModal={handleOpenInquiryModal}
          />
        )}

        {currentPage === 'marketing' && (
          <MarketingPage
            onNavigate={handleNavigate}
            language={language}
            onOpenListPropertyModal={() => setIsListPropertyModalOpen(true)}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} language={language} />
        )}

        {currentPage === 'blog' && (
          <BlogPage onNavigate={handleNavigate} language={language} />
        )}

        {currentPage === 'contact' && (
          <ContactPage onNavigate={handleNavigate} language={language} />
        )}
      </main>

      {/* Global 4-Column Footer */}
      <Footer onNavigate={handleNavigate} language={language} />

      {/* Floating Developer Text Editor (Centered at Bottom) */}
      <FloatingTextEditor
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      {/* Global Dialog Modals */}
      <BookViewingModal
        isOpen={!!bookViewingProperty}
        onClose={() => setBookViewingProperty(null)}
        property={bookViewingProperty}
        language={language}
      />

      <ListPropertyModal
        isOpen={isListPropertyModalOpen}
        onClose={() => setIsListPropertyModalOpen(false)}
        language={language}
      />

      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        language={language}
        initialSubject={inquirySubject}
      />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <TextOverrideProvider>
        <AppContent />
      </TextOverrideProvider>
    </DataProvider>
  );
}
