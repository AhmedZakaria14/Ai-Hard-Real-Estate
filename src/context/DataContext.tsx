import { hardAdminClient } from '../lib/db/hardAdminClient';
import { readAdminCompanyContent, saveCompanyContent, deleteCompanyContent } from '../lib/db/companyContent';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Property, Project, BlogPost, Testimonial, JoinListSubscriber } from '../types';
import {
  TeamMember,
  FaqEntity,
  OfficeLocation,
  Certification,
  BusinessStatistic,
  PartnerBrand,
  EnhancedTestimonial,
} from '../types/businessEntities';
import {
  LeadsRepository,
  JoinListRepository,
} from '../lib/db/repository';
import {
  FaqsRepository,
  CertificationsRepository,
  EnhancedTestimonialsRepository,
} from '../lib/db/entitiesRepository';
import {
  FirestoreFaqsRepository,
  FirestoreCertificationsRepository,
  FirestoreEnhancedTestimonialsRepository,
} from '../lib/db/firestoreEntitiesRepository';
import {
  LeadRecord,
  CrmSyncLog,
  subscribeToCrmLogs,
  getCrmSyncLogs,
} from '../lib/integrations/crmSync';
import { isSupabaseConfigured } from '../lib/db/supabaseClient';
import { loadPublishedArticles, loadPublishedProjects, loadPublishedProperties, type PublicProperty } from '../lib/db/hardCatalog';
import { createPublishedProperty, archivePublishedCatalog, createPublishedProject, createPublishedArticle, updatePublishedCatalog } from '../lib/db/hardCatalogWrites';
import { SECTOR_CONTACT_DETAILS } from '../lib/sectors';

interface DataContextType {
  properties: Property[];
  leads: LeadRecord[];
  projects: Project[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  subscribers: JoinListSubscriber[];
  crmLogs: CrmSyncLog[];
  // Reusable Business Entities
  teamMembers: TeamMember[];
  faqs: FaqEntity[];
  offices: OfficeLocation[];
  certifications: Certification[];
  statistics: BusinessStatistic[];
  partnerBrands: PartnerBrand[];
  enhancedTestimonials: EnhancedTestimonial[];
  isLoading: boolean;
  isSupabaseConnected: boolean;

  addProperty: (propertyData: Partial<Property>) => Promise<Property>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<Property>;
  deleteProperty: (id: string) => Promise<boolean>;
  propertyLoadStatus: 'loading' | 'ready' | 'error';
  refreshProperties: () => Promise<void>;

  // Projects CRUD
  addProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;

  // Blog Posts CRUD
  addBlogPost: (postData: Partial<BlogPost>) => Promise<BlogPost>;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => Promise<BlogPost | null>;
  deleteBlogPost: (id: string) => Promise<boolean>;

  // Testimonials / Client Success Stories CRUD
  addTestimonial: (data: Partial<Testimonial>) => Promise<Testimonial>;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => Promise<Testimonial | null>;
  deleteTestimonial: (id: string) => Promise<boolean>;

  // Join List Subscribers CRUD
  addSubscriber: (email: string, source?: string, notes?: string) => Promise<JoinListSubscriber>;
  updateSubscriber: (id: string, updates: Partial<JoinListSubscriber>) => Promise<JoinListSubscriber | null>;
  deleteSubscriber: (id: string) => Promise<boolean>;
  toggleSubscriberStatus: (id: string) => Promise<JoinListSubscriber | null>;
  resetSubscribersToDefault: () => void;

  // --- REUSABLE BUSINESS ENTITIES CRUD ---
  // Team Members
  addTeamMember: (data: Partial<TeamMember>) => Promise<TeamMember>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<TeamMember | null>;
  deleteTeamMember: (id: string) => Promise<boolean>;

  // FAQs
  addFaq: (data: Partial<FaqEntity>) => Promise<FaqEntity>;
  updateFaq: (id: string, updates: Partial<FaqEntity>) => Promise<FaqEntity | null>;
  deleteFaq: (id: string) => Promise<boolean>;
  resetFaqsToDefault: () => void;

  // Offices
  addOffice: (data: Partial<OfficeLocation>) => Promise<OfficeLocation>;
  updateOffice: (id: string, updates: Partial<OfficeLocation>) => Promise<OfficeLocation | null>;
  deleteOffice: (id: string) => Promise<boolean>;

  // Certifications
  addCertification: (data: Partial<Certification>) => Promise<Certification>;
  updateCertification: (id: string, updates: Partial<Certification>) => Promise<Certification | null>;
  deleteCertification: (id: string) => Promise<boolean>;
  resetCertificationsToDefault: () => void;

  // Business Statistics
  addStatistic: (data: Partial<BusinessStatistic>) => Promise<BusinessStatistic>;
  updateStatistic: (id: string, updates: Partial<BusinessStatistic>) => Promise<BusinessStatistic | null>;
  deleteStatistic: (id: string) => Promise<boolean>;

  // Partner Brands
  addPartnerBrand: (data: Partial<PartnerBrand>) => Promise<PartnerBrand>;
  updatePartnerBrand: (id: string, updates: Partial<PartnerBrand>) => Promise<PartnerBrand | null>;
  deletePartnerBrand: (id: string) => Promise<boolean>;

  // Enhanced Testimonials
  addEnhancedTestimonial: (data: Partial<EnhancedTestimonial>) => Promise<EnhancedTestimonial>;
  updateEnhancedTestimonial: (id: string, updates: Partial<EnhancedTestimonial>) => Promise<EnhancedTestimonial | null>;
  deleteEnhancedTestimonial: (id: string) => Promise<boolean>;
  resetEnhancedTestimonialsToDefault: () => void;

  // Leads & CRM
  submitLead: (leadInput: {
    name: string;
    email: string;
    phone: string;
    property_id?: string;
    property_title?: string;
    inquiry_type: LeadRecord['inquiry_type'];
    recipient_email?: string;
    message?: string;
    source?: string;
    metadata?: Record<string, any>;
  }) => Promise<{ lead: LeadRecord; crmResult: { success: boolean; crmReferenceId: string; crmSystem: string } }>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function withPropertyContact(content: PublicProperty): Property {
  const { phone, whatsapp, email } = SECTOR_CONTACT_DETAILS.realestate;
  return {
    ...content,
    agent: {
      name: { ar: 'هارد للعقارات', en: 'HARD Real Estate' },
      title: { ar: 'الاستشارات العقارية', en: 'Real Estate Advisory' },
      phone, whatsapp, email, avatar: '',
    },
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [subscribers, setSubscribers] = useState<JoinListSubscriber[]>([]);
  const [crmLogs, setCrmLogs] = useState<CrmSyncLog[]>(getCrmSyncLogs());

  // Entities state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [faqs, setFaqs] = useState<FaqEntity[]>([]);
  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [statistics, setStatistics] = useState<BusinessStatistic[]>([]);
  const [partnerBrands, setPartnerBrands] = useState<PartnerBrand[]>([]);
  const [enhancedTestimonials, setEnhancedTestimonials] = useState<EnhancedTestimonial[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [propertyLoadStatus, setPropertyLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const propertyReadVersion = useRef(0);

  const refreshProperties = useCallback(async () => {
    const version = ++propertyReadVersion.current;
    setPropertyLoadStatus((status) => status === 'ready' ? 'ready' : 'loading');
    try {
      const items = await loadPublishedProperties();
      if (version !== propertyReadVersion.current) return;
      setProperties(items.map(({ content }) => withPropertyContact(content)));
      setPropertyLoadStatus('ready');
    } catch (error) {
      if (version !== propertyReadVersion.current) return;
      setPropertyLoadStatus('error');
      console.error('Could not load published properties:', error);
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let version = 0;
    const { data: { subscription } } = hardAdminClient.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') return;
      const current = ++version;
      clearTimeout(timer);
      if (session?.user.app_metadata.hard_role !== 'superadmin') {
        setTeamMembers([]); setOffices([]); setStatistics([]); setPartnerBrands([]); setTestimonials([]);
        return;
      }
      timer = setTimeout(() => {
        void readAdminCompanyContent().then((rows) => {
          if (current !== version) return;
          const list = <T,>(kind: string) => rows.filter((row) => row.kind === kind).map((row) => row.body as T);
          setTeamMembers(list<TeamMember>('team'));
          setOffices(list<OfficeLocation>('offices'));
          setStatistics(list<BusinessStatistic>('statistics'));
          setPartnerBrands(list<PartnerBrand>('partners'));
          setTestimonials(list<Testimonial>('stories'));
        }).catch((error) => console.error('Could not load company content', error));
      }, 0);
    });
    return () => { version++; clearTimeout(timer); subscription.unsubscribe(); };
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const propertiesRequest = refreshProperties();
    try {
      const [
        lds,
        projs,
        posts,
        subs,
        fq,
        certs,
        enhTests,
      ] = await Promise.all([
        LeadsRepository.getAll(),
        loadPublishedProjects().then((rows) => rows.map(({ content }) => content)),
        loadPublishedArticles().then((rows) => rows.map(({ content }) => content)),
        JoinListRepository.getAll(),
        FirestoreFaqsRepository.getAll().catch(() => FaqsRepository.getAll()),
        FirestoreCertificationsRepository.getAll().catch(() => CertificationsRepository.getAll()),
        FirestoreEnhancedTestimonialsRepository.getAll().catch(() => EnhancedTestimonialsRepository.getAll()),
      ]);

      setLeads(lds);
      setProjects(projs);
      setBlogPosts(posts);
      setSubscribers(subs);
      setFaqs(fq);
      setCertifications(certs);
      setEnhancedTestimonials(enhTests);
    } catch (err) {
      console.error('Failed to load data from repositories:', err);
    } finally {
      await propertiesRequest;
      setIsLoading(false);
    }
  }, [refreshProperties]);

  useEffect(() => {
    refreshData();

    // 3. Listener for CRM sync logs
    const unsubCrm = subscribeToCrmLogs((newLogs) => {
      setCrmLogs(newLogs);
    });

    return () => {
      unsubCrm();
    };
  }, [refreshData]);

  // Properties CRUD
  const addProperty = async (propertyData: Partial<Property>): Promise<Property> => {
    const created = withPropertyContact(await createPublishedProperty(propertyData));
    setProperties((previous) => [created, ...previous.filter((property) => property.id !== created.id)]);
    void refreshProperties();
    return created;
  };

  const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property> => {
    const updated = withPropertyContact(await updatePublishedCatalog<PublicProperty>('properties', id, updates));
    setProperties((previous) => previous.map((property) => property.id === id ? updated : property));
    void refreshProperties();
    return updated;
  };

  const deleteProperty = async (id: string): Promise<boolean> => {
    const archived = await archivePublishedCatalog('properties', id);
    if (archived) {
      setProperties((previous) => previous.filter((property) => property.id !== id));
      void refreshProperties();
    }
    return archived;
  };

  // Projects CRUD
  const addProject = async (projectData: Partial<Project>): Promise<Project> => {
    const created = await createPublishedProject(projectData);
    setProjects((prev) => [created, ...prev]);
    return created;
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    const updated = await updatePublishedCatalog<Project>('projects', id, updates);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    return updated;
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    const success = await archivePublishedCatalog('projects', id);
    if (success) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
    return success;
  };

  // Blog Posts CRUD
  const addBlogPost = async (postData: Partial<BlogPost>): Promise<BlogPost> => {
    const created = await createPublishedArticle(postData);
    setBlogPosts((prev) => [created, ...prev]);
    return created;
  };

  const updateBlogPost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> => {
    const updated = await updatePublishedCatalog<BlogPost>('blog_posts', id, updates);
    if (updated) {
      setBlogPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    return updated;
  };

  const deleteBlogPost = async (id: string): Promise<boolean> => {
    const success = await archivePublishedCatalog('blog_posts', id);
    if (success) {
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    }
    return success;
  };


  const addTestimonial = async (data: Partial<Testimonial>): Promise<Testimonial> => {
    const item = await saveCompanyContent('stories', { ...data, id: crypto.randomUUID() } as Testimonial, true);
    setTestimonials((previous) => [item, ...previous]);
    return item;
  };
  const updateTestimonial = async (id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> => {
    const current = testimonials.find((item) => item.id === id);
    if (!current) return null;
    const saved = await saveCompanyContent('stories', { ...current, ...updates, id });
    setTestimonials((previous) => previous.map((item) => item.id === id ? saved : item));
    return saved;
  };
  const deleteTestimonial = async (id: string): Promise<boolean> => {
    const removed = await deleteCompanyContent('stories', id);
    if (removed) setTestimonials((previous) => previous.filter((item) => item.id !== id));
    return removed;
  };

  // Join List Subscribers CRUD
  const addSubscriber = async (email: string, source = 'Website Footer', notes = ''): Promise<JoinListSubscriber> => {
    const subscriber = await JoinListRepository.create({ email, source, notes });
    setSubscribers((prev) => {
      const exists = prev.some((s) => s.id === subscriber.id);
      if (exists) {
        return prev.map((s) => (s.id === subscriber.id ? subscriber : s));
      }
      return [subscriber, ...prev];
    });
    return subscriber;
  };

  const updateSubscriber = async (id: string, updates: Partial<JoinListSubscriber>): Promise<JoinListSubscriber | null> => {
    const updated = await JoinListRepository.update(id, updates);
    if (updated) {
      setSubscribers((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
    return updated;
  };

  const deleteSubscriber = async (id: string): Promise<boolean> => {
    const success = await JoinListRepository.delete(id);
    if (success) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    }
    return success;
  };

  const toggleSubscriberStatus = async (id: string): Promise<JoinListSubscriber | null> => {
    const target = subscribers.find((s) => s.id === id);
    if (!target) return null;
    const newStatus = target.status === 'active' ? 'unsubscribed' : 'active';
    return updateSubscriber(id, { status: newStatus });
  };

  const resetSubscribersToDefault = () => {
    const defaultData = JoinListRepository.resetToDefaults();
    setSubscribers(defaultData);
  };

  // --- REUSABLE BUSINESS ENTITIES CRUD METHODS ---

  const addTeamMember = async (data: Partial<TeamMember>): Promise<TeamMember> => {
    const item = await saveCompanyContent('team', { ...data, id: crypto.randomUUID() } as TeamMember, true);
    setTeamMembers((previous) => [item, ...previous]);
    return item;
  };
  const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> => {
    const current = teamMembers.find((item) => item.id === id);
    if (!current) return null;
    const saved = await saveCompanyContent('team', { ...current, ...updates, id });
    setTeamMembers((previous) => previous.map((item) => item.id === id ? saved : item));
    return saved;
  };
  const deleteTeamMember = async (id: string): Promise<boolean> => {
    const removed = await deleteCompanyContent('team', id);
    if (removed) setTeamMembers((previous) => previous.filter((item) => item.id !== id));
    return removed;
  };

  // 2. FAQs
  const addFaq = async (data: Partial<FaqEntity>): Promise<FaqEntity> => {
    const item = FaqsRepository.create(data);
    await FirestoreFaqsRepository.create(item).catch(() => {});
    setFaqs((prev) => [item, ...prev.filter((f) => f.id !== item.id)].sort((a, b) => a.order - b.order));
    return item;
  };
  const updateFaq = async (id: string, updates: Partial<FaqEntity>): Promise<FaqEntity | null> => {
    const item = FaqsRepository.update(id, updates);
    if (item) {
      await FirestoreFaqsRepository.update(id, updates).catch(() => {});
      setFaqs((prev) => prev.map((f) => (f.id === id ? item : f)).sort((a, b) => a.order - b.order));
    }
    return item;
  };
  const deleteFaq = async (id: string): Promise<boolean> => {
    const ok = FaqsRepository.delete(id);
    if (ok) {
      await FirestoreFaqsRepository.delete(id).catch(() => {});
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    }
    return ok;
  };
  const resetFaqsToDefault = () => {
    const defaults = FaqsRepository.resetToDefaults();
    setFaqs(defaults);
  };

  const addOffice = async (data: Partial<OfficeLocation>): Promise<OfficeLocation> => {
    const item = await saveCompanyContent('offices', { ...data, id: crypto.randomUUID() } as OfficeLocation, true);
    setOffices((previous) => [item, ...previous]);
    return item;
  };
  const updateOffice = async (id: string, updates: Partial<OfficeLocation>): Promise<OfficeLocation | null> => {
    const current = offices.find((item) => item.id === id);
    if (!current) return null;
    const saved = await saveCompanyContent('offices', { ...current, ...updates, id });
    setOffices((previous) => previous.map((item) => item.id === id ? saved : item));
    return saved;
  };
  const deleteOffice = async (id: string): Promise<boolean> => {
    const removed = await deleteCompanyContent('offices', id);
    if (removed) setOffices((previous) => previous.filter((item) => item.id !== id));
    return removed;
  };

  // 4. Certifications
  const addCertification = async (data: Partial<Certification>): Promise<Certification> => {
    const item = CertificationsRepository.create(data);
    await FirestoreCertificationsRepository.create(item).catch(() => {});
    setCertifications((prev) => [item, ...prev.filter((c) => c.id !== item.id)].sort((a, b) => a.order - b.order));
    return item;
  };
  const updateCertification = async (id: string, updates: Partial<Certification>): Promise<Certification | null> => {
    const item = CertificationsRepository.update(id, updates);
    if (item) {
      await FirestoreCertificationsRepository.update(id, updates).catch(() => {});
      setCertifications((prev) => prev.map((c) => (c.id === id ? item : c)).sort((a, b) => a.order - b.order));
    }
    return item;
  };
  const deleteCertification = async (id: string): Promise<boolean> => {
    const ok = CertificationsRepository.delete(id);
    if (ok) {
      await FirestoreCertificationsRepository.delete(id).catch(() => {});
      setCertifications((prev) => prev.filter((c) => c.id !== id));
    }
    return ok;
  };
  const resetCertificationsToDefault = () => {
    const defaults = CertificationsRepository.resetToDefaults();
    setCertifications(defaults);
  };

  const addStatistic = async (data: Partial<BusinessStatistic>): Promise<BusinessStatistic> => {
    const item = await saveCompanyContent('statistics', { ...data, id: crypto.randomUUID() } as BusinessStatistic, true);
    setStatistics((previous) => [item, ...previous]);
    return item;
  };
  const updateStatistic = async (id: string, updates: Partial<BusinessStatistic>): Promise<BusinessStatistic | null> => {
    const current = statistics.find((item) => item.id === id);
    if (!current) return null;
    const saved = await saveCompanyContent('statistics', { ...current, ...updates, id });
    setStatistics((previous) => previous.map((item) => item.id === id ? saved : item));
    return saved;
  };
  const deleteStatistic = async (id: string): Promise<boolean> => {
    const removed = await deleteCompanyContent('statistics', id);
    if (removed) setStatistics((previous) => previous.filter((item) => item.id !== id));
    return removed;
  };

  const addPartnerBrand = async (data: Partial<PartnerBrand>): Promise<PartnerBrand> => {
    const item = await saveCompanyContent('partners', { ...data, id: crypto.randomUUID() } as PartnerBrand, true);
    setPartnerBrands((previous) => [item, ...previous]);
    return item;
  };
  const updatePartnerBrand = async (id: string, updates: Partial<PartnerBrand>): Promise<PartnerBrand | null> => {
    const current = partnerBrands.find((item) => item.id === id);
    if (!current) return null;
    const saved = await saveCompanyContent('partners', { ...current, ...updates, id });
    setPartnerBrands((previous) => previous.map((item) => item.id === id ? saved : item));
    return saved;
  };
  const deletePartnerBrand = async (id: string): Promise<boolean> => {
    const removed = await deleteCompanyContent('partners', id);
    if (removed) setPartnerBrands((previous) => previous.filter((item) => item.id !== id));
    return removed;
  };

  // 7. Enhanced Testimonials
  const addEnhancedTestimonial = async (data: Partial<EnhancedTestimonial>): Promise<EnhancedTestimonial> => {
    const item = EnhancedTestimonialsRepository.create(data);
    await FirestoreEnhancedTestimonialsRepository.create(item).catch(() => {});
    setEnhancedTestimonials((prev) => [item, ...prev.filter((t) => t.id !== item.id)].sort((a, b) => a.order - b.order));
    return item;
  };
  const updateEnhancedTestimonial = async (id: string, updates: Partial<EnhancedTestimonial>): Promise<EnhancedTestimonial | null> => {
    const item = EnhancedTestimonialsRepository.update(id, updates);
    if (item) {
      await FirestoreEnhancedTestimonialsRepository.update(id, updates).catch(() => {});
      setEnhancedTestimonials((prev) => prev.map((t) => (t.id === id ? item : t)).sort((a, b) => a.order - b.order));
    }
    return item;
  };
  const deleteEnhancedTestimonial = async (id: string): Promise<boolean> => {
    const ok = EnhancedTestimonialsRepository.delete(id);
    if (ok) {
      await FirestoreEnhancedTestimonialsRepository.delete(id).catch(() => {});
      setEnhancedTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
    return ok;
  };
  const resetEnhancedTestimonialsToDefault = () => {
    const defaults = EnhancedTestimonialsRepository.resetToDefaults();
    setEnhancedTestimonials(defaults);
  };

  // Leads & CRM
  const submitLead = async (leadInput: {
    name: string;
    email: string;
    phone: string;
    property_id?: string;
    property_title?: string;
    inquiry_type: LeadRecord['inquiry_type'];
    recipient_email?: string;
    message?: string;
    source?: string;
    metadata?: Record<string, any>;
  }) => {
    const result = await LeadsRepository.create(leadInput);
    setLeads((prev) => [result.lead, ...prev]);
    return result;
  };

  return (
    <DataContext.Provider
      value={{
        properties,
        leads,
        projects,
        blogPosts,
        testimonials,
        subscribers,
        crmLogs,
        teamMembers,
        faqs,
        offices,
        certifications,
        statistics,
        partnerBrands,
        enhancedTestimonials,
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        addProperty,
        updateProperty,
        deleteProperty,
        propertyLoadStatus,
        refreshProperties,
        addProject,
        updateProject,
        deleteProject,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        addSubscriber,
        updateSubscriber,
        deleteSubscriber,
        toggleSubscriberStatus,
        resetSubscribersToDefault,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        addFaq,
        updateFaq,
        deleteFaq,
        resetFaqsToDefault,
        addOffice,
        updateOffice,
        deleteOffice,
        addCertification,
        updateCertification,
        deleteCertification,
        resetCertificationsToDefault,
        addStatistic,
        updateStatistic,
        deleteStatistic,
        addPartnerBrand,
        updatePartnerBrand,
        deletePartnerBrand,
        addEnhancedTestimonial,
        updateEnhancedTestimonial,
        deleteEnhancedTestimonial,
        resetEnhancedTestimonialsToDefault,
        submitLead,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
