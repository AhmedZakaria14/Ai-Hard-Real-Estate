import React, { useState } from 'react';
import { HVACProvider } from '../hvac/context/HVACContext';
import { EmergencyTopBar } from '../hvac/components/EmergencyTopBar';
import { HVACNavbar } from '../hvac/components/HVACNavbar';
import { HVACHero } from '../hvac/components/HVACHero';
import { HVACServicesSection } from '../hvac/components/HVACServicesSection';
import { HVACWhyChooseUs } from '../hvac/components/HVACWhyChooseUs';
import { HVACWorkGallery } from '../hvac/components/HVACWorkGallery';
import { HVACEfficiencyCalculator } from '../hvac/components/HVACEfficiencyCalculator';
import { HVACSeasonalChecklist } from '../hvac/components/HVACSeasonalChecklist';
import { HVACTestimonials } from '../hvac/components/HVACTestimonials';
import { HVACFAQSection } from '../hvac/components/HVACFAQSection';
import { HVACContactSection } from '../hvac/components/HVACContactSection';
import { HVACEmergencyBanner } from '../hvac/components/HVACEmergencyBanner';
import { HVACFooter } from '../hvac/components/HVACFooter';
import { HVACFloatingWidgets } from '../hvac/components/HVACFloatingWidgets';
import { HVACQuoteDialog } from '../hvac/components/HVACQuoteDialog';
import { HVACBookingModal } from '../hvac/components/HVACBookingModal';
import { HVACCMS } from '../hvac/components/HVACCMS';
import { PageId } from '../types';

interface HVACPageProps {
  onNavigatePage?: (page: PageId) => void;
}

function HVACPageContent({ onNavigatePage }: HVACPageProps) {
  const [showCMS, setShowCMS] = useState(false);

  if (showCMS) {
    return <HVACCMS onExit={() => setShowCMS(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-ui-sans selection:bg-[#0EA5E9] selection:text-white">
      {/* 1. Emergency Top Bar (Sticky dark navy strip) */}
      <EmergencyTopBar />

      {/* 2. Main HVAC Navbar (Sticky header with brand lockup & links) */}
      <HVACNavbar
        onNavigatePage={onNavigatePage}
        onOpenCMS={() => setShowCMS(true)}
      />

      {/* Main Single Page Sections */}
      <main className="flex-1">
        {/* 3. Hero with inline quote form */}
        <HVACHero />

        {/* 4. Services Grid (6 cards, title + desc only) */}
        <HVACServicesSection />

        {/* 5. Why Choose Us (trust badges) */}
        <HVACWhyChooseUs />

        {/* 6. Work Gallery (real field photos with captions) */}
        <HVACWorkGallery />

        {/* 7. Efficiency Incentives Calculator */}
        <HVACEfficiencyCalculator />

        {/* 8. Seasonal Maintenance Checklist (Summer/Winter tabs) */}
        <HVACSeasonalChecklist />

        {/* 9. Reviews / Testimonials */}
        <HVACTestimonials />

        {/* 10. FAQ Accordion */}
        <HVACFAQSection />

        {/* 11. Contact Section (form + map + hours) */}
        <HVACContactSection />

        {/* 12. Emergency CTA Banner */}
        <HVACEmergencyBanner />
      </main>

      {/* 13. Footer */}
      <HVACFooter
        onNavigatePage={onNavigatePage}
        onOpenCMS={() => setShowCMS(true)}
      />

      {/* 14. Floating Widgets (WhatsApp + Blue Back to Top) */}
      <HVACFloatingWidgets />

      {/* 15. Instant Quote Dialog */}
      <HVACQuoteDialog />

      {/* 16. Global Booking Modal */}
      <HVACBookingModal />
    </div>
  );
}

export function HVACPage({ onNavigatePage }: HVACPageProps) {
  return (
    <HVACProvider>
      <HVACPageContent onNavigatePage={onNavigatePage} />
    </HVACProvider>
  );
}
