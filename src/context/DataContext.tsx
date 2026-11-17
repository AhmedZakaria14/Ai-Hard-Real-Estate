import { archiveSubscriber, changeSubscriber, findSubscriber, readSubscribers } from '../lib/db/hardNewsletter';
import { submitCustomerForm } from '../lib/forms/formSubmissionService';
import { hardAdminClient } from '../lib/db/hardAdminClient';
import { readAdminCompanyContent, readCompanyContent, saveCompanyContent, deleteCompanyContent, resetCompanyContent } from '../lib/db/companyContent';
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
import { mockFaqs, mockCertifications, mockEnhancedTestimonials } from '../data/entitiesMockData';
import { loadPublishedArticles, loadPublishedProjects, loadPublishedProperties, type PublicProperty } from '../lib/db/hardCatalog';
import { createPublishedProperty, archivePublishedCatalog, createPublishedProject, createPublishedArticle, updatePublishedCatalog } from '../lib/db/hardCatalogWrites';
import { SECTOR_CONTACT_DETAILS } from '../lib/sectors';

interface DataContextType {
  properties: Property[];
  projects: Project[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  subscribers: JoinListSubscriber[];
  // Reusable Business Entities
  teamMembers: TeamMember[];
  faqs: FaqEntity[];
  offices: OfficeLocation[];
  certifications: Certification[];
  statistics: BusinessStatistic[];
  partnerBrands: PartnerBrand[];
  enhancedTestimonials: EnhancedTestimonial[];
  isLoading: boolean;

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
  refreshSubscribers: () => Promise<void>;

  // --- REUSABLE BUSINESS ENTITIES CRUD ---
  // Team Members
  addTeamMember: (data: Partial<TeamMember>) => Promise<TeamMember>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<TeamMember | null>;
  deleteTeamMember: (id: string) => Promise<boolean>;

  // FAQs
  addFaq: (data: Partial<FaqEntity>) => Promise<FaqEntity>;
  updateFaq: (id: string, updates: Partial<FaqEntity>) => Promise<FaqEntity | null>;
  deleteFaq: (id: string) => Promise<boolean>;
  resetFaqsToDefault: () => Promise<void>;

  // Offices
  addOffice: (data: Partial<OfficeLocation>) => Promise<OfficeLocation>;
  updateOffice: (id: string, updates: Partial<OfficeLocation>) => Promise<OfficeLocation | null>;
  deleteOffice: (id: string) => Promise<boolean>;

  // Certifications
  addCertification: (data: Partial<Certification>) => Promise<Certification>;
  updateCertification: (id: string, updates: Partial<Certification>) => Promise<Certification | null>;
  deleteCertification: (id: string) => Promise<boolean>;
  resetCertificationsToDefault: () => Promise<void>;

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
  resetEnhancedTestimonialsToDefault: () => Promise<void>;

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

function byOrder(a: { order: number }, b: { order: number }) {
  return a.order - b.order;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [subscribers, setSubscribers] = useState<JoinListSubscriber[]>([]);

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
    const refreshOnFocus = () => { void refreshProperties(); };
    window.addEventListener('focus', refreshOnFocus);
    return () => window.removeEventListener('focus', refreshOnFocus);
  }, [refreshProperties]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let controller: AbortController;
    let version = 0;
    const { data: { subscription } } = hardAdminClient.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') return;
      const current = ++version;
      clearTimeout(timer);
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      const isAdmin = session?.user.app_metadata.hard_role === 'superadmin';
      setFaqs([]); setCertifications([]); setEnhancedTestimonials([]);
      if (!isAdmin) {
        setSubscribers([]);
        setTeamMembers([]); setOffices([]); setStatistics([]); setPartnerBrands([]); setTestimonials([]);
      }
      timer = setTimeout(() => {
        const request = isAdmin ? readAdminCompanyContent() : readCompanyContent(signal);
        void request.then((rows) => {
          if (current !== version) return;
          const list = <T,>(kind: string) => rows.filter((row) => row.kind === kind).map((row) => row.body as T);
          setFaqs(list<FaqEntity>('faqs').sort(byOrder));
          setCertifications(list<Certification>('certifications').sort(byOrder));
          setEnhancedTestimonials(list<EnhancedTestimonial>('enhanced_testimonials').sort(byOrder));
          if (!isAdmin) return;
          setTeamMembers(list<TeamMember>('team'));
          setOffices(list<OfficeLocation>('offices'));
          setStatistics(list<BusinessStatistic>('statistics'));
          setPartnerBrands(list<PartnerBrand>('partners'));
          setTestimonials(list<Testimonial>('stories'));
        }).catch((error) => {
          if (!signal.aborted) console.error('Could not load company content', error);
        });
      }, 0);
    });
    return () => { version++; clearTimeout(timer); controller?.abort(); subscription.unsubscribe(); };
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const propertiesRequest = refreshProperties();
    try {
      const [
        projs,
        posts,
      ] = await Promise.all([
        loadPublishedProjects().then((rows) => rows.map(({ content }) => content)),
        loadPublishedArticles().then((rows) => rows.map(({ content }) => content)),
      ]);

      setProjects(projs);
      setBlogPosts(posts);
    } catch (err) {
      console.error('Failed to load data from repositories:', err);
    } finally {
      await propertiesRequest;
      setIsLoading(false);
    }
  }, [refreshProperties]);

  useEffect(() => {
    void refreshData();
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
    const normalizedEmail = email.trim().toLowerCase();
    await submitCustomerForm({
      formType: 'newsletter_signup', sector: 'group', name: normalizedEmail.split('@')[0],
      email: normalizedEmail, language: 'ar', message: 'Newsletter subscription', details: { source },
    });
    const current = await findSubscriber(normalizedEmail);
    const subscriber = notes ? await changeSubscriber(current.id, { notes }) : current;
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
    const updated = await changeSubscriber(id, updates);
    if (updated) {
      setSubscribers((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
    return updated;
  };

  const deleteSubscriber = async (id: string): Promise<boolean> => {
    const success = await archiveSubscriber(id);
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

  const refreshSubscribers = useCallback(async () => {
    const { data, error } = await hardAdminClient.auth.getUser();
    if (error || data.user?.app_metadata.hard_role !== 'superadmin') throw Error('Administrator required');
    setSubscribers(await readSubscribers());
  }, []);

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
    const item = await saveCompanyContent('faqs', {
      question: { ar: '', en: '' }, answer: { ar: '', en: '' },
      sector: 'group', order: faqs.length + 1, status: 'draft',
      ...data, id: crypto.randomUUID(),
    } as FaqEntity, true);
    setFaqs((previous) => [...previous, item].sort(byOrder));
    return item;
  };

  const updateFaq = async (id: string, updates: Partial<FaqEntity>): Promise<FaqEntity | null> => {
    const current = faqs.find((item) => item.id === id);
    if (!current) return null;
    const saved = await saveCompanyContent('faqs', { ...current, ...updates, id });
    setFaqs((previous) => previous.map((item) => item.id === id ? saved : item).sort(byOrder));
    return saved;
  };

  const deleteFaq = async (id: string): Promise<boolean> => {
    const removed = await deleteCompanyContent('faqs', id);
    if (removed) setFaqs((previous) => previous.filter((item) => item.id !== id));
    return removed;
  };

  const resetFaqsToDefault = async () => {
    const defaults = mockFaqs;
    await resetCompanyContent('faqs', defaults);
    setFaqs([...defaults].sort(byOrder));
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
    const item = await saveCompanyContent('certifications', {
      title: { ar: '', en: '' }, issuer: { ar: '', en: '' },
      sector: 'group', order: certifications.length + 1, status: 'draft',
      ...data, id: crypto.randomUUID(),
    } as Certification, true);
    setCertifications((previous) => [...previous, item].sort(byOrder));
    return item;
  };

  const updateCertification = async (id: string, updates: Partial<Certification>): Promise<Certification | null> => {
    const current = certifications.find((item) => item.id === id);
    if (!current) return null;
    const saved = await saveCompanyContent('certifications', { ...current, ...updates, id });
    setCertifications((previous) => previous.map((item) => item.id === id ? saved : item).sort(byOrder));
    return saved;
  };

  const deleteCertification = async (id: string): Promise<boolean> => {
    const removed = await deleteCompanyContent('certifications', id);
    if (removed) setCertifications((previous) => previous.filter((item) => item.id !== id));
    return removed;
  };

  const resetCertificationsToDefault = async () => {
    const defaults = mockCertifications.map((item) => ({ ...item, status: 'draft' as const }));
    await resetCompanyContent('certifications', defaults);
    setCertifications([...defaults].sort(byOrder));
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
    const item = await saveCompanyContent('enhanced_testimonials', {
      name: { ar: '', en: '' }, role: { ar: '', en: '' }, quote: { ar: '', en: '' }, avatar: '', rating: 5,
      sector: 'group', order: enhancedTestimonials.length + 1, status: 'draft',
      ...data, id: crypto.randomUUID(),
    } as EnhancedTestimonial, true);
    setEnhancedTestimonials((previous) => [...previous, item].sort(byOrder));
    return item;
  };

  const updateEnhancedTestimonial = async (id: string, updates: Partial<EnhancedTestimonial>): Promise<EnhancedTestimonial | null> => {
    const current = enhancedTestimonials.find((item) => item.id === id);
    if (!current) return null;
    const saved = await saveCompanyContent('enhanced_testimonials', { ...current, ...updates, id });
    setEnhancedTestimonials((previous) => previous.map((item) => item.id === id ? saved : item).sort(byOrder));
    return saved;
  };

  const deleteEnhancedTestimonial = async (id: string): Promise<boolean> => {
    const removed = await deleteCompanyContent('enhanced_testimonials', id);
    if (removed) setEnhancedTestimonials((previous) => previous.filter((item) => item.id !== id));
    return removed;
  };

  const resetEnhancedTestimonialsToDefault = async () => {
    const defaults = mockEnhancedTestimonials.map((item) => ({ ...item, status: 'draft' as const }));
    await resetCompanyContent('enhanced_testimonials', defaults);
    setEnhancedTestimonials([...defaults].sort(byOrder));
  };

  return (
    <DataContext.Provider
      value={{
        properties,
        projects,
        blogPosts,
        testimonials,
        subscribers,
        teamMembers,
        faqs,
        offices,
        certifications,
        statistics,
        partnerBrands,
        enhancedTestimonials,
        isLoading,
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
        refreshSubscribers,
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
