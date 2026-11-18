import { LocalizedValue } from '../components/ui/LocalizedValue';
import { InterfaceText } from '../components/ui/InterfaceText';
import { ManagedImg } from '../components/ui/ManagedElements';
import { usePageMedia } from '../lib/pageMedia';
import { getLocalizedText } from '../lib/utils';
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
  Mail,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Activity,
} from 'lucide-react';
import { Language, PageId, Project } from '../types';
import { useTextOverride } from '../context/TextOverrideContext';
import { loadPublishedProjects } from '../lib/db/hardCatalog';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RequestBrochureModal } from '../components/modals/RequestBrochureModal';

interface ProjectsPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
  onOpenInquiryModal: (subject?: string) => void;
  onOpenProjectInquiryModal?: (project: Project) => void;
}

export function ProjectsPage({
  onNavigate,
  language,
  onOpenInquiryModal,
  onOpenProjectInquiryModal,
}: ProjectsPageProps) {
  const { translations } = useTextOverride();
  const { projectPlaceholderImage } = usePageMedia();
  const t = translations[language];
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  React.useEffect(() => {
    const controller = new AbortController();
    loadPublishedProjects(controller.signal).then((items) => {
      if (controller.signal.aborted) return;
      setProjects(items.map(({ content }) => content));
      setLoadStatus('ready');
    }).catch(() => {
      if (!controller.signal.aborted) setLoadStatus('error');
    });
    return () => controller.abort();
  }, [loadAttempt]);
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const [selectedBrochureProject, setSelectedBrochureProject] = useState<Project | null>(null);

  const handleBrochureClick = (proj: Project) => {
    if (proj.brochureUrl) {
      // Verified brochure file exists: trigger actual file download/viewing
      window.open(proj.brochureUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Delivery by email: open request modal to collect destination and show confirmed acceptance
      setSelectedBrochureProject(proj);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="primary">{language === 'en' ? <InterfaceText id="realestate.ProjectsPage.k157hdhc" source="Exclusive Allocations" /> : <InterfaceText id="realestate.ProjectsPage.k1bx2vin" source="طروحات حصرية" />}</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
          <LocalizedValue value={t.projects.pageTitle} />
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          <LocalizedValue value={t.projects.pageSubtitle} />
        </p>
      </div>

      {loadStatus === 'loading' && <p role="status">{language === 'ar' ? <InterfaceText id="realestate.ProjectsPage.k1z9sn3" source="جارٍ تحميل المشاريع…" /> : <InterfaceText id="realestate.ProjectsPage.kvjado3" source="Loading projects…" />}</p>}
      {loadStatus === 'error' && <div role="alert" className="flex flex-wrap items-center gap-3">
        <span>{language === 'ar' ? <InterfaceText id="realestate.ProjectsPage.km8iuv7" source="تعذّر تحميل المشاريع." /> : <InterfaceText id="realestate.ProjectsPage.kfytthh" source="Unable to load projects." />}</span>
        <Button type="button" variant="outline" size="sm" onClick={() => {
          setLoadStatus('loading');
          setLoadAttempt((attempt) => attempt + 1);
        }}>{language === 'ar' ? <InterfaceText id="realestate.ProjectsPage.k1tratnt" source="إعادة المحاولة" /> : <InterfaceText id="realestate.ProjectsPage.k982hh6" source="Try again" />}</Button>
      </div>}

      {/* Projects List */}
      <div className="space-y-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Image side (5 cols) */}
            <div className="lg:col-span-5 relative aspect-16/10 lg:aspect-auto bg-slate-950 overflow-hidden">
              <ManagedImg copyScope="realestate.ProjectsPage"
                src={project.image || project.gallery?.[0] || projectPlaceholderImage}
                alt={getLocalizedText(project.title, language)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {project.financialMetric?.isVerified ? (
                <div className="absolute top-4 start-4 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span><LocalizedValue value={project.financialMetric.value} /> <LocalizedValue value={project.financialMetric.metricLabel?.[language]} /></span>
                </div>
              ) : (
                <div
                  className="absolute top-4 start-4 bg-slate-900/90 backdrop-blur-md text-amber-300 border border-amber-500/40 text-xs px-3 py-1 rounded-full font-semibold shadow-md flex items-center gap-1.5"
                  title={project.financialMetric?.statusNote?.[language]}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><LocalizedValue value={project.financialMetric?.verificationStatus?.[language] || project.roiProjected} /></span>
                </div>
              )}
            </div>

            {/* Content side (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    <LocalizedValue value={getLocalizedText(project.developer, language)} />
                  </span>
                  <div className="flex items-center gap-2">
                    {project.isOverdue && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span><LocalizedValue value={t.projects.overdueFlag} /></span>
                      </span>
                    )}
                    <Badge variant="secondary"><LocalizedValue value={getLocalizedText(project.category, language)} /></Badge>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display-serif">
                  <LocalizedValue value={getLocalizedText(project.title, language)} />
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <LocalizedValue value={getLocalizedText(project.description, language)} />
                </p>

                {/* Construction Progress & Schedule Status */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span><LocalizedValue value={t.projects.constructionStatus} />: <LocalizedValue value={t.projects.underConstruction} /></span>
                    </span>
                    <span className="text-blue-700 font-bold">
                      <LocalizedValue value={project.progressPercentage ?? 0} />%
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        project.isOverdue ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${project.progressPercentage ?? 0}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span><LocalizedValue value={t.projects.lastUpdated} />: <LocalizedValue value={project.lastUpdated || project.deliveryAudit?.lastUpdated || '2026-10-09'} /></span>
                    </span>
                    <span>
                      <LocalizedValue value={t.projects.handover} />: <strong className="text-slate-800 font-semibold"><LocalizedValue value={getLocalizedText(project.handoverDate, language)} /></strong>
                    </span>
                  </div>
                </div>

                {/* Audit Observation Callout for Overdue / Flagged Projects */}
                {project.deliveryAudit?.auditNote && (
                  <div
                    className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                      project.isOverdue
                        ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <ShieldAlert className={`w-3.5 h-3.5 ${project.isOverdue ? 'text-amber-600' : 'text-slate-500'}`} />
                      <span><LocalizedValue value={t.projects.auditObservation} /></span>
                      {project.flaggedForAdminReview && (
                        <span className="ms-auto text-[10px] uppercase font-bold tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                          <LocalizedValue value={t.projects.adminReviewFlag} />
                        </span>
                      )}
                    </div>
                    <p><LocalizedValue value={project.deliveryAudit.auditNote[language]} /></p>
                  </div>
                )}

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(project.highlights?.[language] ?? []).map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span><LocalizedValue value={hl} /></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats and Action row */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 block"><LocalizedValue value={t.projects.startingFrom} />:</span>
                  <div className="text-xl font-bold text-blue-700 font-display-serif">
                    <LocalizedValue value={project.startingPriceSAR} />
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    <LocalizedValue value={t.projects.handover} />: <LocalizedValue value={getLocalizedText(project.handoverDate, language)} />
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBrochureClick(project)}
                    className="flex-1 sm:flex-initial text-xs"
                  >
                    {project.brochureUrl ? (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? <InterfaceText id="realestate.ProjectsPage.k3wk23p" source="Download PDF Brochure" /> : <InterfaceText id="realestate.ProjectsPage.ku0000p" source="تحميل الكتيب PDF" />}</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? <InterfaceText id="realestate.ProjectsPage.knkqyrm" source="Request Brochure" /> : <InterfaceText id="realestate.ProjectsPage.koxq2cy" source="طلب الكتيب" />}</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (onOpenProjectInquiryModal) {
                        onOpenProjectInquiryModal(project);
                      } else {
                        onOpenInquiryModal(`Project Allocation: ${getLocalizedText(project.title, language)}`);
                      }
                    }}
                    className="flex-1 sm:flex-initial text-xs font-semibold"
                  >
                    <span><LocalizedValue value={t.projects.inquireProject} /></span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Request Brochure Modal */}
      <RequestBrochureModal
        isOpen={Boolean(selectedBrochureProject)}
        onClose={() => setSelectedBrochureProject(null)}
        language={language}
        project={selectedBrochureProject}
      />
    </div>
  );
}
