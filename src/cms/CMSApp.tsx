import React, { useState } from 'react';
import {
  Language,
  Property,
  Project,
  BlogPost,
  Testimonial,
  JoinListSubscriber,
  ListingStatus,
  ProjectStatus,
  BlogStatus,
} from '../types';
import { useData } from '../context/DataContext';
import { CMSAuth } from './CMSAuth';
import { CMSLayout, CMSTab } from './CMSLayout';
import { CMSDashboard } from './CMSDashboard';
import { CMSPropertiesList } from './properties/CMSPropertiesList';
import { CMSPropertyFormModal } from './properties/CMSPropertyFormModal';
import { CMSProjectsList } from './projects/CMSProjectsList';
import { CMSProjectFormModal } from './projects/CMSProjectFormModal';
import { CMSBlogList } from './blog/CMSBlogList';
import { CMSBlogFormModal } from './blog/CMSBlogFormModal';
import { CMSTestimonialsList } from './testimonials/CMSTestimonialsList';
import { CMSTestimonialFormModal } from './testimonials/CMSTestimonialFormModal';
import { CMSJoinList } from './subscribers/CMSJoinList';
import { CMSAddSubscriberModal } from './subscribers/CMSAddSubscriberModal';
import { CMSLeadsList } from './leads/CMSLeadsList';
import { CMSSettings } from './settings/CMSSettings';

interface CMSAppProps {
  onReturnToSite: () => void;
  onViewPropertyOnSite?: (property: Property) => void;
  onViewProjectOnSite?: (project: Project) => void;
  onViewBlogPostOnSite?: (post: BlogPost) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const CMSApp: React.FC<CMSAppProps> = ({
  onReturnToSite,
  onViewPropertyOnSite,
  onViewProjectOnSite,
  onViewBlogPostOnSite,
  language,
  onLanguageChange,
}) => {
  const {
    properties,
    projects,
    blogPosts,
    testimonials,
    subscribers,
    leads,
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
    resetBlogPostsToDefault,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    resetTestimonialsToDefault,
    addSubscriber,
    updateSubscriber,
    deleteSubscriber,
    toggleSubscriberStatus,
    resetSubscribersToDefault,
  } = useData();

  // Authentication State with sessionStorage
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(() => {
    try {
      const stored = sessionStorage.getItem('hard_cms_admin_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<CMSTab>('properties');

  // Property Modal State
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Blog Modal State
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);

  // Testimonial Modal State
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Subscriber Modal State
  const [isSubscriberModalOpen, setIsSubscriberModalOpen] = useState(false);

  const handleLoginSuccess = (user: { name: string; email: string; role: string }) => {
    setAdminUser(user);
    try {
      sessionStorage.setItem('hard_cms_admin_session', JSON.stringify(user));
    } catch (e) {
      console.warn('Session storage write failed:', e);
    }
  };

  const handleLogout = () => {
    setAdminUser(null);
    try {
      sessionStorage.removeItem('hard_cms_admin_session');
    } catch (e) {
      console.warn('Session storage remove failed:', e);
    }
  };

  // --- PROPERTIES HANDLERS ---
  const handleOpenAddProperty = () => {
    setEditingProperty(null);
    setIsPropertyModalOpen(true);
  };

  const handleOpenEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsPropertyModalOpen(true);
  };

  const handleSaveProperty = async (propertyData: Partial<Property>) => {
    if (editingProperty) {
      await updateProperty(editingProperty.id, propertyData);
    } else {
      await addProperty(propertyData);
    }
  };

  const handleDuplicateProperty = async (property: Property) => {
    const duplicatedData: Partial<Property> = {
      ...property,
      title: {
        en: `${property.title.en} (Copy)`,
        ar: `${property.title.ar} (نسخة)`,
      },
      slug: `${property.slug}-copy-${Date.now()}`,
      featured: false,
    };
    delete duplicatedData.id;
    await addProperty(duplicatedData);
  };

  const handleTogglePropertyFeatured = async (property: Property) => {
    await updateProperty(property.id, { featured: !property.featured });
  };

  const handleQuickPropertyStatusChange = async (property: Property, newStatus: ListingStatus) => {
    await updateProperty(property.id, { status: newStatus });
  };

  const handleViewPropertyLive = (property: Property) => {
    if (onViewPropertyOnSite) {
      onViewPropertyOnSite(property);
    } else {
      onReturnToSite();
    }
  };

  // --- PROJECTS HANDLERS ---
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (projectData: Partial<Project>) => {
    if (editingProject) {
      await updateProject(editingProject.id, projectData);
    } else {
      await addProject(projectData);
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    const duplicated: Partial<Project> = {
      ...project,
      title: {
        en: `${project.title.en} (Copy)`,
        ar: `${project.title.ar} (نسخة)`,
      },
      slug: `${project.slug}-copy-${Date.now()}`,
      featured: false,
    };
    delete duplicated.id;
    await addProject(duplicated);
  };

  const handleToggleProjectFeatured = async (project: Project) => {
    await updateProject(project.id, { featured: !project.featured });
  };

  const handleQuickProjectStatusChange = async (project: Project, newStatus: ProjectStatus) => {
    await updateProject(project.id, { status: newStatus });
  };

  const handleViewProjectLive = (project: Project) => {
    if (onViewProjectOnSite) {
      onViewProjectOnSite(project);
    } else {
      onReturnToSite();
    }
  };

  // --- BLOG HANDLERS ---
  const handleOpenAddBlogPost = () => {
    setEditingBlogPost(null);
    setIsBlogModalOpen(true);
  };

  const handleOpenEditBlogPost = (post: BlogPost) => {
    setEditingBlogPost(post);
    setIsBlogModalOpen(true);
  };

  const handleSaveBlogPost = async (postData: Partial<BlogPost>) => {
    if (editingBlogPost) {
      await updateBlogPost(editingBlogPost.id, postData);
    } else {
      await addBlogPost(postData);
    }
  };

  const handleDuplicateBlogPost = async (post: BlogPost) => {
    const duplicated: Partial<BlogPost> = {
      ...post,
      title: {
        en: `${post.title.en} (Copy)`,
        ar: `${post.title.ar} (نسخة)`,
      },
      slug: `${post.slug}-copy-${Date.now()}`,
      featured: false,
    };
    delete duplicated.id;
    await addBlogPost(duplicated);
  };

  const handleToggleBlogFeatured = async (post: BlogPost) => {
    await updateBlogPost(post.id, { featured: !post.featured });
  };

  const handleQuickBlogStatusChange = async (post: BlogPost, newStatus: BlogStatus) => {
    await updateBlogPost(post.id, { status: newStatus });
  };

  const handleViewBlogLive = (post: BlogPost) => {
    if (onViewBlogPostOnSite) {
      onViewBlogPostOnSite(post);
    } else {
      onReturnToSite();
    }
  };

  // --- TESTIMONIALS / CLIENT SUCCESS STORIES HANDLERS ---
  const handleOpenAddTestimonial = () => {
    setEditingTestimonial(null);
    setIsTestimonialModalOpen(true);
  };

  const handleOpenEditTestimonial = (story: Testimonial) => {
    setEditingTestimonial(story);
    setIsTestimonialModalOpen(true);
  };

  const handleSaveTestimonial = async (storyData: Partial<Testimonial>) => {
    if (editingTestimonial) {
      await updateTestimonial(editingTestimonial.id, storyData);
    } else {
      await addTestimonial(storyData);
    }
  };

  // --- JOIN LIST SUBSCRIBERS HANDLERS ---
  const handleOpenAddSubscriber = () => {
    setIsSubscriberModalOpen(true);
  };

  const handleSaveSubscriber = async (email: string, source: string, notes: string) => {
    await addSubscriber(email, source, notes);
  };

  // Reset all repository data to pristine defaults
  const handleResetAllData = async () => {
    await resetPropertiesToDefault();
    await resetProjectsToDefault();
    await resetBlogPostsToDefault();
    await resetTestimonialsToDefault();
    await resetSubscribersToDefault();
  };

  // If not authenticated, show secure credentials login
  if (!adminUser) {
    return (
      <CMSAuth
        onLoginSuccess={handleLoginSuccess}
        onCancel={onReturnToSite}
        language={language}
        onLanguageChange={onLanguageChange}
      />
    );
  }

  return (
    <CMSLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onLogout={handleLogout}
      onViewLiveSite={onReturnToSite}
      adminUser={adminUser}
      language={language}
      onLanguageChange={onLanguageChange}
    >
      {/* 1. Dashboard View */}
      {activeTab === 'dashboard' && (
        <CMSDashboard
          properties={properties}
          projects={projects}
          blogPosts={blogPosts}
          testimonials={testimonials}
          subscribers={subscribers}
          leads={leads}
          onNavigateToProperties={() => setActiveTab('properties')}
          onNavigateToProjects={() => setActiveTab('projects')}
          onNavigateToBlog={() => setActiveTab('blog')}
          onNavigateToTestimonials={() => setActiveTab('testimonials')}
          onNavigateToSubscribers={() => setActiveTab('subscribers')}
          onNavigateToLeads={() => setActiveTab('leads')}
          onAddProperty={handleOpenAddProperty}
          onAddProject={handleOpenAddProject}
          onAddBlogPost={handleOpenAddBlogPost}
          onAddTestimonial={handleOpenAddTestimonial}
          onAddSubscriber={handleOpenAddSubscriber}
          onSelectProperty={handleOpenEditProperty}
          language={language}
        />
      )}

      {/* 2. Properties Catalog */}
      {activeTab === 'properties' && (
        <CMSPropertiesList
          properties={properties}
          onAddProperty={handleOpenAddProperty}
          onEditProperty={handleOpenEditProperty}
          onDeleteProperty={deleteProperty}
          onDuplicateProperty={handleDuplicateProperty}
          onToggleFeatured={handleTogglePropertyFeatured}
          onQuickStatusChange={handleQuickPropertyStatusChange}
          onViewLive={handleViewPropertyLive}
          language={language}
        />
      )}

      {/* 3. Major Projects & Off-Plan */}
      {activeTab === 'projects' && (
        <CMSProjectsList
          projects={projects}
          onAddProject={handleOpenAddProject}
          onEditProject={handleOpenEditProject}
          onDeleteProject={deleteProject}
          onDuplicateProject={handleDuplicateProject}
          onToggleFeatured={handleToggleProjectFeatured}
          onQuickStatusChange={handleQuickProjectStatusChange}
          onViewLive={handleViewProjectLive}
          language={language}
        />
      )}

      {/* 4. Blog & Market Insights */}
      {activeTab === 'blog' && (
        <CMSBlogList
          blogPosts={blogPosts}
          onAddPost={handleOpenAddBlogPost}
          onEditPost={handleOpenEditBlogPost}
          onDeletePost={deleteBlogPost}
          onDuplicatePost={handleDuplicateBlogPost}
          onToggleFeatured={handleToggleBlogFeatured}
          onQuickStatusChange={handleQuickBlogStatusChange}
          onViewLive={handleViewBlogLive}
          language={language}
        />
      )}

      {/* 5. Client Success Stories */}
      {activeTab === 'testimonials' && (
        <CMSTestimonialsList
          testimonials={testimonials}
          onAddStory={handleOpenAddTestimonial}
          onEditStory={handleOpenEditTestimonial}
          onDeleteStory={deleteTestimonial}
          onResetToDefault={resetTestimonialsToDefault}
          language={language}
        />
      )}

      {/* 6. Join List (Newsletter & Subscribers) */}
      {activeTab === 'subscribers' && (
        <CMSJoinList
          subscribers={subscribers}
          onAddSubscriber={handleOpenAddSubscriber}
          onUpdateSubscriber={updateSubscriber}
          onToggleStatus={toggleSubscriberStatus}
          onDeleteSubscriber={deleteSubscriber}
          onResetToDefault={resetSubscribersToDefault}
          language={language}
        />
      )}

      {/* 7. Inbound Leads & Requests */}
      {activeTab === 'leads' && (
        <CMSLeadsList leads={leads} language={language} />
      )}

      {/* 8. System Settings */}
      {activeTab === 'settings' && (
        <CMSSettings
          language={language}
          onResetToDefaults={handleResetAllData}
        />
      )}

      {/* MODAL 1: Add / Edit Property */}
      <CMSPropertyFormModal
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
        initialData={editingProperty}
        language={language}
      />

      {/* MODAL 2: Add / Edit Project */}
      <CMSProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialData={editingProject}
        language={language}
      />

      {/* MODAL 3: Add / Edit Blog Article */}
      <CMSBlogFormModal
        isOpen={isBlogModalOpen}
        onClose={() => {
          setIsBlogModalOpen(false);
          setEditingBlogPost(null);
        }}
        onSave={handleSaveBlogPost}
        initialData={editingBlogPost}
        language={language}
      />

      {/* MODAL 4: Add / Edit Client Success Story */}
      <CMSTestimonialFormModal
        isOpen={isTestimonialModalOpen}
        onClose={() => {
          setIsTestimonialModalOpen(false);
          setEditingTestimonial(null);
        }}
        onSave={handleSaveTestimonial}
        initialData={editingTestimonial}
        language={language}
      />

      {/* MODAL 5: Add Join List Subscriber */}
      <CMSAddSubscriberModal
        isOpen={isSubscriberModalOpen}
        onClose={() => {
          setIsSubscriberModalOpen(false);
        }}
        onSave={handleSaveSubscriber}
        language={language}
      />
    </CMSLayout>
  );
};
