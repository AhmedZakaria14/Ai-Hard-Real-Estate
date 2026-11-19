import { subscribeSectorSection, saveSectorSection } from '../../lib/db/hardSectorSections';
import { isConstructionProjectCategory, loadPublishedConstructionProjects } from '../../lib/db/hardCatalog';
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ConstructionLanguage,
  ConstructionProject,
  ConstructionProjectCategory,
  ConstructionQuoteLead,
  ConstructionService,
  CostEstimateParams,
  CostEstimateResult,
} from '../types';
import { INITIAL_PROJECTS, INITIAL_SERVICES } from '../data/seedData';
import { calculateConstructionCost } from '../utils/costCalculator';
import { subscribeToPublishedCalculatorConfig } from '../../lib/calculators/calculatorConfigService';
import { calculateConstructionCostWithConfig } from '../../lib/calculators/calculatorEngine';
import { ConstructionCalculatorConfigDoc } from '../../lib/calculators/calculatorTypes';
import {
  parseConstructionUrl,
  syncConstructionUrl,
} from '../utils/constructionUrlParams';
import {
  ConstructionHeroContent,
  ConstructionCompanyContent,
  ConstructionWorkStage,
  ConstructionOfficeLocation,
  DEFAULT_HERO_CONTENT,
  DEFAULT_COMPANY_CONTENT,
  DEFAULT_WORK_STAGES,
  DEFAULT_OFFICES,
} from '../services/sectionDefaults';

interface ConstructionContextType {
  language: ConstructionLanguage;
  setLanguage: (lang: ConstructionLanguage) => void;
  toggleLanguage: () => void;
  projects: ConstructionProject[];
  services: ConstructionService[];
  addService: (svc: Omit<ConstructionService, 'id'>) => Promise<void>;
  updateService: (id: string, svc: Partial<ConstructionService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  heroContent: ConstructionHeroContent;
  updateHeroContent: (data: Partial<ConstructionHeroContent>) => Promise<void>;
  companyContent: ConstructionCompanyContent;
  updateCompanyContent: (data: Partial<ConstructionCompanyContent>) => Promise<void>;
  workStages: ConstructionWorkStage[];
  updateWorkStages: (stages: ConstructionWorkStage[]) => Promise<void>;
  officeLocations: ConstructionOfficeLocation[];
  updateOfficeLocations: (offices: ConstructionOfficeLocation[]) => Promise<void>;
  // Modals & Project routing
  isCostEstimatorOpen: boolean;
  openCostEstimator: () => void;
  closeCostEstimator: () => void;
  isQuoteModalOpen: boolean;
  openQuoteModal: (initialData?: Partial<ConstructionQuoteLead>) => void;
  closeQuoteModal: () => void;
  quoteModalInitialData: Partial<ConstructionQuoteLead> | null;
  selectedProjectForModal: ConstructionProject | null;
  unknownProjectId: string | null;
  openProjectModal: (project: ConstructionProject, options?: { replace?: boolean }) => void;
  openProjectById: (id: string, options?: { replace?: boolean }) => void;
  closeProjectModal: () => void;
  // Project list filters & URL synchronization
  activeCategory: ConstructionProjectCategory;
  setActiveCategory: (cat: ConstructionProjectCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resetProjectFilters: () => void;
  // Cost calculation live
  costParams: CostEstimateParams;
  setCostParams: React.Dispatch<React.SetStateAction<CostEstimateParams>>;
  currentEstimate: CostEstimateResult;
  transferEstimateToQuote: () => void;
}

const ConstructionContext = createContext<ConstructionContextType | undefined>(undefined);

const PROJECTS_STORAGE_KEY = 'hard_construction_projects_v2';
const LEADS_STORAGE_KEY = 'hard_construction_leads_v2';

export const ConstructionProvider: React.FC<{
  children: React.ReactNode;
  initialLanguage?: ConstructionLanguage;
  onLanguageChangeExternal?: (lang: ConstructionLanguage) => void;
}> = ({ children, initialLanguage = 'ar', onLanguageChangeExternal }) => {
  const [language, setLanguageState] = useState<ConstructionLanguage>(initialLanguage);

  useEffect(() => {
    setLanguageState(initialLanguage);
  }, [initialLanguage]);

  const setLanguage = (lang: ConstructionLanguage) => {
    setLanguageState(lang);
    if (onLanguageChangeExternal) {
      onLanguageChangeExternal(lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    setLanguage(nextLang);
  };

  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    loadPublishedConstructionProjects(controller.signal).then((entries) => {
      if (controller.signal.aborted) return;
      setProjects(entries.map(({ content }) => ({
        year: '', durationMonths: 0, valueSAR: '', clientAr: '', clientEn: '',
        scopeAr: [], scopeEn: [], structuralSystemAr: '', structuralSystemEn: '',
        finishingLevelAr: '', finishingLevelEn: '', highlightsAr: [], highlightsEn: [],
        ...content,
        category: isConstructionProjectCategory(content.category) ? content.category : 'residential',
      })));
    }).catch((error) => {
      if (!controller.signal.aborted) console.error('Unable to load construction projects', error);
    });
    return () => controller.abort();
  }, []);

  // Services State
  const [services, setServices] = useState<ConstructionService[]>(INITIAL_SERVICES);
  useEffect(() => subscribeSectorSection({ sector: 'construction', key: 'services' }, INITIAL_SERVICES, setServices), []);

  const addService = async (svc: Omit<ConstructionService, 'id'>) => {
    const newSvc: ConstructionService = {
      ...svc,
      id: `svc-${Date.now()}`,
    };
    const next = [newSvc, ...services];
    await saveSectorSection({ sector: 'construction', key: 'services' }, next);
    setServices(next);
  };

  const updateService = async (id: string, updated: Partial<ConstructionService>) => {
    const next = services.map((s) => (s.id === id ? { ...s, ...updated } : s));
    await saveSectorSection({ sector: 'construction', key: 'services' }, next);
    setServices(next);
  };

  const deleteService = async (id: string) => {
    const next = services.filter((s) => s.id !== id);
    await saveSectorSection({ sector: 'construction', key: 'services' }, next);
    setServices(next);
  };

  // Hero & Company Section Content
  const [heroContent, setHeroContent] = useState<ConstructionHeroContent>(DEFAULT_HERO_CONTENT);
  const [companyContent, setCompanyContent] = useState<ConstructionCompanyContent>(DEFAULT_COMPANY_CONTENT);
  const [workStages, setWorkStages] = useState<ConstructionWorkStage[]>(DEFAULT_WORK_STAGES);
  const [officeLocations, setOfficeLocations] = useState<ConstructionOfficeLocation[]>(DEFAULT_OFFICES);

  useEffect(() => {
    const unsubHero = subscribeSectorSection<ConstructionHeroContent>({ sector: 'construction', key: 'hero' },
      DEFAULT_HERO_CONTENT,
      (data) => setHeroContent(data)
    );
    const unsubCompany = subscribeSectorSection<ConstructionCompanyContent>({ sector: 'construction', key: 'company' },
      DEFAULT_COMPANY_CONTENT,
      (data) => setCompanyContent(data)
    );
    const unsubStages = subscribeSectorSection<ConstructionWorkStage[]>({ sector: 'construction', key: 'stages' },
      DEFAULT_WORK_STAGES,
      (data) => setWorkStages(data)
    );
    const unsubOffices = subscribeSectorSection<ConstructionOfficeLocation[]>({ sector: 'construction', key: 'offices' },
      DEFAULT_OFFICES,
      (data) => setOfficeLocations(data)
    );

    return () => {
      unsubHero();
      unsubCompany();
      unsubStages();
      unsubOffices();
    };
  }, []);

  const updateHeroContent = async (data: Partial<ConstructionHeroContent>) => {
    const updated = { ...heroContent, ...data };
    await saveSectorSection({ sector: 'construction', key: 'hero' }, updated);
    setHeroContent(updated);
  };

  const updateCompanyContent = async (data: Partial<ConstructionCompanyContent>) => {
    const updated = { ...companyContent, ...data };
    await saveSectorSection({ sector: 'construction', key: 'company' }, updated);
    setCompanyContent(updated);
  };

  const updateWorkStages = async (stages: ConstructionWorkStage[]) => {
    await saveSectorSection({ sector: 'construction', key: 'stages' }, stages);
    setWorkStages(stages);
  };

  const updateOfficeLocations = async (offices: ConstructionOfficeLocation[]) => {
    await saveSectorSection({ sector: 'construction', key: 'offices' }, offices);
    setOfficeLocations(offices);
  };

  // Project list filters state (initialized from URL)
  const [activeCategory, setActiveCategoryState] = useState<ConstructionProjectCategory>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseConstructionUrl();
      return parsed.category;
    }
    return 'all';
  });

  const [searchQuery, setSearchQueryState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseConstructionUrl();
      return parsed.search;
    }
    return '';
  });

  // Modals state
  const [isCostEstimatorOpen, setIsCostEstimatorOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteModalInitialData, setQuoteModalInitialData] = useState<Partial<ConstructionQuoteLead> | null>(null);

  // Selected project for modal (initialized synchronously from URL)
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<ConstructionProject | null>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseConstructionUrl();
      if (parsed.projectId) {
        const stored = (() => {
          try {
            const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
            return raw ? JSON.parse(raw) : INITIAL_PROJECTS;
          } catch {
            return INITIAL_PROJECTS;
          }
        })();
        const match = stored.find((p: ConstructionProject) => p.id === parsed.projectId);
        return match || null;
      }
    }
    return null;
  });

  // Unknown project ID state (when user accesses an unknown project URL)
  const [unknownProjectId, setUnknownProjectId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseConstructionUrl();
      if (parsed.projectId) {
        const stored = (() => {
          try {
            const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
            return raw ? JSON.parse(raw) : INITIAL_PROJECTS;
          } catch {
            return INITIAL_PROJECTS;
          }
        })();
        const match = stored.find((p: ConstructionProject) => p.id === parsed.projectId);
        return match ? null : parsed.projectId;
      }
    }
    return null;
  });

  // Synchronize URL and state on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseConstructionUrl();

      if (parsed.projectId) {
        const found = projects.find((p) => p.id === parsed.projectId);
        if (found) {
          setSelectedProjectForModal(found);
          setUnknownProjectId(null);
        } else {
          setSelectedProjectForModal(null);
          setUnknownProjectId(parsed.projectId);
        }
      } else {
        setSelectedProjectForModal(null);
        setUnknownProjectId(null);
      }

      // Restore list filters from URL
      setActiveCategoryState(parsed.category);
      setSearchQueryState(parsed.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [projects]);

  // Keep project selection in sync if project list loads or changes
  useEffect(() => {
    const parsed = parseConstructionUrl();
    if (parsed.projectId) {
      const found = projects.find((p) => p.id === parsed.projectId);
      if (found) {
        setSelectedProjectForModal(found);
        setUnknownProjectId(null);
      } else {
        setSelectedProjectForModal(null);
        setUnknownProjectId(parsed.projectId);
      }
    }
  }, [projects]);

  const openCostEstimator = () => setIsCostEstimatorOpen(true);
  const closeCostEstimator = () => setIsCostEstimatorOpen(false);

  const openQuoteModal = (initialData?: Partial<ConstructionQuoteLead>) => {
    setQuoteModalInitialData(initialData || null);
    setIsQuoteModalOpen(true);
  };
  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setQuoteModalInitialData(null);
  };

  const openProjectModal = (project: ConstructionProject, options?: { replace?: boolean }) => {
    setSelectedProjectForModal(project);
    setUnknownProjectId(null);
    syncConstructionUrl(
      {
        projectId: project.id,
        category: activeCategory,
        search: searchQuery,
      },
      options
    );
  };

  const openProjectById = (id: string, options?: { replace?: boolean }) => {
    const found = projects.find((p) => p.id === id);
    if (found) {
      setSelectedProjectForModal(found);
      setUnknownProjectId(null);
      syncConstructionUrl(
        {
          projectId: found.id,
          category: activeCategory,
          search: searchQuery,
        },
        options
      );
    } else {
      setSelectedProjectForModal(null);
      setUnknownProjectId(id);
      syncConstructionUrl(
        {
          projectId: id,
          category: activeCategory,
          search: searchQuery,
        },
        options
      );
    }
  };

  const closeProjectModal = () => {
    setSelectedProjectForModal(null);
    setUnknownProjectId(null);

    // If history has a previous entry for construction list within session, use history.back()
    if (typeof window !== 'undefined' && window.history.state?.projectId) {
      window.history.back();
    } else {
      // Direct entry or refresh fallback: navigate cleanly to list preserving filters
      syncConstructionUrl(
        {
          projectId: null,
          category: activeCategory,
          search: searchQuery,
          includeAnchor: true,
        },
        { replace: false }
      );
      if (typeof document !== 'undefined') {
        const el = document.getElementById('projects');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  const setActiveCategory = (cat: ConstructionProjectCategory) => {
    setActiveCategoryState(cat);
    if (!selectedProjectForModal && !unknownProjectId) {
      syncConstructionUrl(
        {
          projectId: null,
          category: cat,
          search: searchQuery,
        },
        { replace: true }
      );
    }
  };

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    if (!selectedProjectForModal && !unknownProjectId) {
      syncConstructionUrl(
        {
          projectId: null,
          category: activeCategory,
          search: query,
        },
        { replace: true }
      );
    }
  };

  const resetProjectFilters = () => {
    setActiveCategoryState('all');
    setSearchQueryState('');
    if (!selectedProjectForModal && !unknownProjectId) {
      syncConstructionUrl(
        {
          projectId: null,
          category: 'all',
          search: '',
        },
        { replace: true }
      );
    }
  };

  // Live Cost Estimator state
  const [publishedCalcConfig, setPublishedCalcConfig] = useState<ConstructionCalculatorConfigDoc | null>(null);

  useEffect(() => {
    const unsub = subscribeToPublishedCalculatorConfig('construction', (docData) => {
      setPublishedCalcConfig(docData as ConstructionCalculatorConfigDoc);
    });
    return () => unsub();
  }, []);

  const [costParams, setCostParams] = useState<CostEstimateParams>({
    projectType: 'villa',
    finishingLevel: 'deluxe',
    builtUpArea: 1200,
    floors: 2,
    hasBasement: false,
    hasPool: true,
    hasElevator: true,
    hasSmartHome: true,
    location: 'Riyadh',
  });

  const currentEstimate = calculateConstructionCostWithConfig(
    costParams,
    publishedCalcConfig?.coefficients
  );

  const transferEstimateToQuote = () => {
    const formattedRange = `${new Intl.NumberFormat('en-US').format(
      currentEstimate.minTotalSAR
    )} - ${new Intl.NumberFormat('en-US').format(currentEstimate.maxTotalSAR)} SAR`;

    openQuoteModal({
      projectType: costParams.projectType,
      finishingLevel: costParams.finishingLevel,
      builtUpArea: costParams.builtUpArea,
      budgetRangeSAR: formattedRange,
      timeline: `${currentEstimate.estimatedDurationMonths} months`,
      source: 'cost_estimator',
      estimatedValueSAR: currentEstimate.avgTotalSAR,
      calculatorVersion: publishedCalcConfig?.version || 1,
      inputSnapshot: costParams,
      calculationSnapshot: currentEstimate as unknown as Record<string, any>,
      notes: `Built-up Area: ${costParams.builtUpArea} m², Floors: ${costParams.floors}, Basement: ${costParams.hasBasement ? 'Yes' : 'No'}, Pool: ${costParams.hasPool ? 'Yes' : 'No'}, Smart Home: ${costParams.hasSmartHome ? 'Yes' : 'No'}`,
    });
    setIsCostEstimatorOpen(false);
  };

  return (
    <ConstructionContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        projects,
        services,
        addService,
        updateService,
        deleteService,
        heroContent,
        updateHeroContent,
        companyContent,
        updateCompanyContent,
        workStages,
        updateWorkStages,
        officeLocations,
        updateOfficeLocations,
        isCostEstimatorOpen,
        openCostEstimator,
        closeCostEstimator,
        isQuoteModalOpen,
        openQuoteModal,
        closeQuoteModal,
        quoteModalInitialData,
        selectedProjectForModal,
        unknownProjectId,
        openProjectModal,
        openProjectById,
        closeProjectModal,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        resetProjectFilters,
        costParams,
        setCostParams,
        currentEstimate,
        transferEstimateToQuote,
      }}
    >
      {children}
    </ConstructionContext.Provider>
  );
};

export const useConstruction = () => {
  const context = useContext(ConstructionContext);
  if (!context) {
    throw new Error('useConstruction must be used within a ConstructionProvider');
  }
  return context;
};
