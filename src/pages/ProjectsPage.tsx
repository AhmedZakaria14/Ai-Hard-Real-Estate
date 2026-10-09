import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Download,
  Building,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Language, PageId, Project } from '../types';
import { translations } from '../lib/translations';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface ProjectsPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
  onOpenInquiryModal: (subject?: string) => void;
}

export function ProjectsPage({
  onNavigate,
  language,
  onOpenInquiryModal,
}: ProjectsPageProps) {
  const t = translations[language];
  const { projects } = useData();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const handleDownloadBrochure = (proj: Project) => {
    setDownloadSuccessId(proj.id);
    setTimeout(() => {
      setDownloadSuccessId(null);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="primary">{language === 'en' ? 'Exclusive Allocations' : 'طروحات حصرية'}</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
          {t.projects.pageTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          {t.projects.pageSubtitle}
        </p>
      </div>

      {/* Projects List */}
      <div className="space-y-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Image side (5 cols) */}
            <div className="lg:col-span-5 relative aspect-16/10 lg:aspect-auto bg-slate-950 overflow-hidden">
              <img
                src={project.image}
                alt={project.title[language]}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 start-4 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>ROI: {project.roiProjected}</span>
              </div>
            </div>

            {/* Content side (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    {project.developer[language]}
                  </span>
                  <Badge variant="secondary">{project.category[language]}</Badge>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display-serif">
                  {project.title[language]}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {project.description[language]}
                </p>

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {project.highlights[language].map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats and Action row */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 block">{t.projects.startingFrom}:</span>
                  <div className="text-xl font-bold text-blue-700 font-display-serif">
                    {project.startingPriceSAR}
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {t.projects.handover}: {project.handoverDate[language]}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadBrochure(project)}
                    className="flex-1 sm:flex-initial text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {downloadSuccessId === project.id
                        ? language === 'en'
                          ? 'Brochure Sent!'
                          : 'تم إرسال الكتيب!'
                        : t.projects.downloadBrochure}
                    </span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onOpenInquiryModal(`Project Allocation: ${project.title[language]}`)}
                    className="flex-1 sm:flex-initial text-xs font-semibold"
                  >
                    <span>{t.projects.inquireProject}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
