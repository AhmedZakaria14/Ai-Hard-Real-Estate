import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ConstructionLanguage,
  ConstructionProject,
  ConstructionQuoteLead,
  CostEstimateParams,
  CostEstimateResult,
} from '../types';
import { INITIAL_PROJECTS, INITIAL_LEADS } from '../data/seedData';
import { calculateConstructionCost } from '../utils/costCalculator';

interface ConstructionContextType {
  language: ConstructionLanguage;
  setLanguage: (lang: ConstructionLanguage) => void;
  toggleLanguage: () => void;
  projects: ConstructionProject[];
  addProject: (proj: Omit<ConstructionProject, 'id'>) => void;
  updateProject: (id: string, proj: Partial<ConstructionProject>) => void;
  deleteProject: (id: string) => void;
  resetProjectsToDefault: () => void;
  leads: ConstructionQuoteLead[];
  addLead: (lead: Omit<ConstructionQuoteLead, 'id' | 'referenceNumber' | 'createdAt' | 'status'>) => ConstructionQuoteLead;
  updateLeadStatus: (id: string, status: ConstructionQuoteLead['status'], adminNotes?: string) => void;
  deleteLead: (id: string) => void;
  // Modals
  isCostEstimatorOpen: boolean;
  openCostEstimator: () => void;
  closeCostEstimator: () => void;
  isQuoteModalOpen: boolean;
  openQuoteModal: (initialData?: Partial<ConstructionQuoteLead>) => void;
  closeQuoteModal: () => void;
  quoteModalInitialData: Partial<ConstructionQuoteLead> | null;
  selectedProjectForModal: ConstructionProject | null;
  openProjectModal: (project: ConstructionProject) => void;
  closeProjectModal: () => void;
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

  // Projects State with LocalStorage
  const [projects, setProjects] = useState<ConstructionProject[]>(() => {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return INITIAL_PROJECTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  const addProject = (proj: Omit<ConstructionProject, 'id'>) => {
    const newProj: ConstructionProject = {
      ...proj,
      id: `hard-proj-${Date.now()}`,
    };
    setProjects((prev) => [newProj, ...prev]);
  };

  const updateProject = (id: string, updated: Partial<ConstructionProject>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const resetProjectsToDefault = () => {
    setProjects(INITIAL_PROJECTS);
  };

  // Leads State with LocalStorage
  const [leads, setLeads] = useState<ConstructionQuoteLead[]>(() => {
    try {
      const stored = localStorage.getItem(LEADS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return INITIAL_LEADS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    } catch {
      // ignore
    }
  }, [leads]);

  const addLead = (
    data: Omit<ConstructionQuoteLead, 'id' | 'referenceNumber' | 'createdAt' | 'status'>
  ) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const year = new Date().getFullYear();
    const referenceNumber = `HARD-REQ-${year}-${randomSuffix}`;
    const newLead: ConstructionQuoteLead = {
      ...data,
      id: `lead-${Date.now()}`,
      referenceNumber,
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  const updateLeadStatus = (
    id: string,
    status: ConstructionQuoteLead['status'],
    adminNotes?: string
  ) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              adminNotes: adminNotes !== undefined ? adminNotes : l.adminNotes,
            }
          : l
      )
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  // Modals state
  const [isCostEstimatorOpen, setIsCostEstimatorOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteModalInitialData, setQuoteModalInitialData] = useState<Partial<ConstructionQuoteLead> | null>(null);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<ConstructionProject | null>(null);

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

  const openProjectModal = (project: ConstructionProject) => {
    setSelectedProjectForModal(project);
  };
  const closeProjectModal = () => {
    setSelectedProjectForModal(null);
  };

  // Live Cost Estimator state
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

  const currentEstimate = calculateConstructionCost(costParams);

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
        addProject,
        updateProject,
        deleteProject,
        resetProjectsToDefault,
        leads,
        addLead,
        updateLeadStatus,
        deleteLead,
        isCostEstimatorOpen,
        openCostEstimator,
        closeCostEstimator,
        isQuoteModalOpen,
        openQuoteModal,
        closeQuoteModal,
        quoteModalInitialData,
        selectedProjectForModal,
        openProjectModal,
        closeProjectModal,
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
