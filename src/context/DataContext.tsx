import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Property, Project, BlogPost, Testimonial, JoinListSubscriber } from '../types';
import {
  PropertiesRepository,
  LeadsRepository,
  ProjectsRepository,
  BlogRepository,
  TestimonialsRepository,
  JoinListRepository,
} from '../lib/db/repository';
import {
  LeadRecord,
  CrmSyncLog,
  subscribeToCrmLogs,
  getCrmSyncLogs,
} from '../lib/integrations/crmSync';
import { isSupabaseConfigured } from '../lib/db/supabaseClient';

interface DataContextType {
  properties: Property[];
  leads: LeadRecord[];
  projects: Project[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  subscribers: JoinListSubscriber[];
  crmLogs: CrmSyncLog[];
  isLoading: boolean;
  isSupabaseConnected: boolean;
  // Properties CRUD
  addProperty: (propertyData: Partial<Property>) => Promise<Property>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<Property | null>;
  deleteProperty: (id: string) => Promise<boolean>;
  resetPropertiesToDefault: () => void;
  // Projects CRUD
  addProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  resetProjectsToDefault: () => void;
  // Blog Posts CRUD
  addBlogPost: (postData: Partial<BlogPost>) => Promise<BlogPost>;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => Promise<BlogPost | null>;
  deleteBlogPost: (id: string) => Promise<boolean>;
  resetBlogToDefault: () => void;
  resetBlogPostsToDefault: () => void;
  // Testimonials / Client Success Stories CRUD
  addTestimonial: (data: Partial<Testimonial>) => Promise<Testimonial>;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => Promise<Testimonial | null>;
  deleteTestimonial: (id: string) => Promise<boolean>;
  resetTestimonialsToDefault: () => void;
  // Join List Subscribers CRUD
  addSubscriber: (email: string, source?: string, notes?: string) => Promise<JoinListSubscriber>;
  updateSubscriber: (id: string, updates: Partial<JoinListSubscriber>) => Promise<JoinListSubscriber | null>;
  deleteSubscriber: (id: string) => Promise<boolean>;
  toggleSubscriberStatus: (id: string) => Promise<JoinListSubscriber | null>;
  resetSubscribersToDefault: () => void;
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

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [subscribers, setSubscribers] = useState<JoinListSubscriber[]>([]);
  const [crmLogs, setCrmLogs] = useState<CrmSyncLog[]>(getCrmSyncLogs());
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [props, lds, projs, posts, tests, subs] = await Promise.all([
        PropertiesRepository.getAll(),
        LeadsRepository.getAll(),
        ProjectsRepository.getAll(),
        BlogRepository.getAll(),
        TestimonialsRepository.getAll(),
        JoinListRepository.getAll(),
      ]);
      setProperties(props);
      setLeads(lds);
      setProjects(projs);
      setBlogPosts(posts);
      setTestimonials(tests);
      setSubscribers(subs);
    } catch (err) {
      console.error('Failed to load data from repository:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToCrmLogs((newLogs) => {
      setCrmLogs(newLogs);
    });
    return () => unsubscribe();
  }, [refreshData]);

  // Properties CRUD
  const addProperty = async (propertyData: Partial<Property>): Promise<Property> => {
    const created = await PropertiesRepository.create(propertyData);
    setProperties((prev) => [created, ...prev]);
    return created;
  };

  const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property | null> => {
    const updated = await PropertiesRepository.update(id, updates);
    if (updated) {
      setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    return updated;
  };

  const deleteProperty = async (id: string): Promise<boolean> => {
    const success = await PropertiesRepository.delete(id);
    if (success) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
    return success;
  };

  const resetPropertiesToDefault = () => {
    const defaultData = PropertiesRepository.resetToDefaults();
    setProperties(defaultData);
  };

  // Projects CRUD
  const addProject = async (projectData: Partial<Project>): Promise<Project> => {
    const created = await ProjectsRepository.create(projectData);
    setProjects((prev) => [created, ...prev]);
    return created;
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    const updated = await ProjectsRepository.update(id, updates);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    return updated;
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    const success = await ProjectsRepository.delete(id);
    if (success) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
    return success;
  };

  const resetProjectsToDefault = () => {
    const defaultData = ProjectsRepository.resetToDefaults();
    setProjects(defaultData);
  };

  // Blog Posts CRUD
  const addBlogPost = async (postData: Partial<BlogPost>): Promise<BlogPost> => {
    const created = await BlogRepository.create(postData);
    setBlogPosts((prev) => [created, ...prev]);
    return created;
  };

  const updateBlogPost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> => {
    const updated = await BlogRepository.update(id, updates);
    if (updated) {
      setBlogPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    return updated;
  };

  const deleteBlogPost = async (id: string): Promise<boolean> => {
    const success = await BlogRepository.delete(id);
    if (success) {
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    }
    return success;
  };

  const resetBlogToDefault = () => {
    const defaultData = BlogRepository.resetToDefaults();
    setBlogPosts(defaultData);
  };

  // Testimonials / Client Success Stories CRUD
  const addTestimonial = async (data: Partial<Testimonial>): Promise<Testimonial> => {
    const created = await TestimonialsRepository.create(data);
    setTestimonials((prev) => [created, ...prev]);
    return created;
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> => {
    const updated = await TestimonialsRepository.update(id, updates);
    if (updated) {
      setTestimonials((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
    return updated;
  };

  const deleteTestimonial = async (id: string): Promise<boolean> => {
    const success = await TestimonialsRepository.delete(id);
    if (success) {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
    return success;
  };

  const resetTestimonialsToDefault = () => {
    const defaultData = TestimonialsRepository.resetToDefaults();
    setTestimonials(defaultData);
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
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        addProperty,
        updateProperty,
        deleteProperty,
        resetPropertiesToDefault,
        addProject,
        updateProject,
        deleteProject,
        resetProjectsToDefault,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        resetBlogToDefault,
        resetBlogPostsToDefault: resetBlogToDefault,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        resetTestimonialsToDefault,
        addSubscriber,
        updateSubscriber,
        deleteSubscriber,
        toggleSubscriberStatus,
        resetSubscribersToDefault,
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
