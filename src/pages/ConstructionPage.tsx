import React, { useState, useEffect } from 'react';
import { Language, PageId } from '../types';
import { ConstructionProvider, useConstruction } from '../construction/context/ConstructionContext';
import { Navbar } from '../construction/components/Navbar';
import { Hero } from '../construction/components/Hero';
import { AboutSection } from '../construction/components/AboutSection';
import { ProjectsSection } from '../construction/components/ProjectsSection';
import { ServicesSection } from '../construction/components/ServicesSection';
import { ContactSection } from '../construction/components/ContactSection';
import { Footer } from '../construction/components/Footer';
import { CostEstimatorModal } from '../construction/components/CostEstimatorModal';
import { QuoteModal } from '../construction/components/QuoteModal';
import { ProjectDetailModal } from '../construction/components/ProjectDetailModal';
import { FloatingWidgets } from '../construction/components/FloatingWidgets';
import { ConstructionCMS } from '../construction/components/cms/ConstructionCMS';

interface ConstructionPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (page: PageId) => void;
}

function ConstructionPageInner({
  onNavigate,
}: {
  onNavigate: (page: PageId) => void;
}) {
  const [isCMSActive, setIsCMSActive] = useState(false);

  // Listen for #cms in hash
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('cms') || hash.includes('admin')) {
        setIsCMSActive(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleOpenCMS = () => {
    setIsCMSActive(true);
    try {
      window.location.hash = 'construction/cms';
    } catch {
      // fallback
    }
  };

  const handleExitCMS = () => {
    setIsCMSActive(false);
    try {
      window.location.hash = 'construction';
    } catch {
      // fallback
    }
  };

  if (isCMSActive) {
    return <ConstructionCMS onExit={handleExitCMS} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-ui-sans selection:bg-[#009ee2] selection:text-white">
      {/* Sticky Top Header */}
      <Navbar
        onNavigate={onNavigate}
        onOpenCMS={handleOpenCMS}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <ProjectsSection />
        <ServicesSection />
        <ContactSection />
      </main>

      {/* Detailed Corporate Footer */}
      <Footer onNavigate={onNavigate} onOpenCMS={handleOpenCMS} />

      {/* Interactive Global Modals */}
      <CostEstimatorModal />
      <QuoteModal />
      <ProjectDetailModal />

      {/* Floating Speed Actions (WhatsApp & Quick Estimator) */}
      <FloatingWidgets />
    </div>
  );
}

export function ConstructionPage({
  language,
  onLanguageChange,
  onNavigate,
}: ConstructionPageProps) {
  return (
    <ConstructionProvider
      initialLanguage={language}
      onLanguageChangeExternal={onLanguageChange}
    >
      <ConstructionPageInner onNavigate={onNavigate} />
    </ConstructionProvider>
  );
}
