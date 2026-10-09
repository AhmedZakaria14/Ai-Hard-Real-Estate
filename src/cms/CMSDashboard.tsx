import React from 'react';
import {
  Building,
  Layers,
  BookOpen,
  TrendingUp,
  Users,
  Eye,
  Plus,
  ArrowUpRight,
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  DollarSign,
  MapPin,
  Clock,
  Award,
  MailCheck,
} from 'lucide-react';
import { Property, Project, BlogPost, Testimonial, JoinListSubscriber, Language } from '../types';
import { LeadRecord } from '../lib/integrations/crmSync';

interface CMSDashboardProps {
  properties: Property[];
  projects: Project[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  subscribers: JoinListSubscriber[];
  leads: LeadRecord[];
  onNavigateToProperties: () => void;
  onNavigateToProjects: () => void;
  onNavigateToBlog: () => void;
  onNavigateToTestimonials: () => void;
  onNavigateToSubscribers: () => void;
  onNavigateToLeads: () => void;
  onAddProperty: () => void;
  onAddProject: () => void;
  onAddBlogPost: () => void;
  onAddTestimonial: () => void;
  onAddSubscriber: () => void;
  onSelectProperty: (property: Property) => void;
  language: Language;
}

export const CMSDashboard: React.FC<CMSDashboardProps> = ({
  properties,
  projects,
  blogPosts,
  testimonials,
  subscribers,
  leads,
  onNavigateToProperties,
  onNavigateToProjects,
  onNavigateToBlog,
  onNavigateToTestimonials,
  onNavigateToSubscribers,
  onNavigateToLeads,
  onAddProperty,
  onAddProject,
  onAddBlogPost,
  onAddTestimonial,
  onAddSubscriber,
  onSelectProperty,
  language,
}) => {
  const isAr = language === 'ar';

  const totalValuation = properties.reduce((sum, p) => sum + (p.price?.sar || 0), 0);
  const forSaleCount = properties.filter((p) => p.status === 'for-sale').length;
  const forRentCount = properties.filter((p) => p.status === 'for-rent').length;
  const offPlanCount = properties.filter((p) => p.status === 'off-plan').length;
  const recentProperties = properties.slice(0, 4);

  const totalUnits = projects.reduce((acc, p) => acc + (p.unitsTotal || 0), 0);
  const publishedArticlesCount = blogPosts.filter((p) => (p.status || 'published') === 'published').length;
  const activeSubscribersCount = subscribers.filter((s) => s.status === 'active').length;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. EXECUTIVE WELCOME BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 end-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'مركز إدارة المحتوى والأصول الموحد' : 'Unified CMS & Enterprise Asset Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display-serif">
              {isAr ? 'مرحباً بك في لوحة تحكم هارد العقارية' : 'Welcome to HARD Real Estate CMS'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'تحكم شامل وفوري في العقارات، المشاريع، قصص النجاح، المشتركين، والمقالات مع مزامنة آنية.'
                : 'Centralized management across properties, masterplans, client stories, subscribers, and leads.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onAddProperty}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-sky-400 hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إدراج عقار' : 'New Property'}</span>
            </button>

            <button
              onClick={onAddTestimonial}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-amber-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'قصة نجاح' : 'Success Story'}</span>
            </button>

            <button
              onClick={onAddSubscriber}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة مشترك' : 'New Subscriber'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID (Properties, Projects, Testimonials, Join List, Blog, Leads) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Properties Portfolio */}
        <div
          onClick={onNavigateToProperties}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors">
              {isAr ? 'العقارات' : 'Properties'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {properties.length}
          </div>
          <p className="text-[10px] text-slate-500">
            {(totalValuation / 1000000).toFixed(1)}M SAR {isAr ? 'التقييم' : 'Valuation'}
          </p>
        </div>

        {/* Development Projects */}
        <div
          onClick={onNavigateToProjects}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-purple-600 transition-colors">
              {isAr ? 'المشاريع' : 'Projects'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {projects.length}
          </div>
          <p className="text-[10px] text-purple-600 font-semibold">
            {totalUnits.toLocaleString()} {isAr ? 'وحدة معتمدة' : 'Units'}
          </p>
        </div>

        {/* Client Success Stories */}
        <div
          onClick={onNavigateToTestimonials}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-600 transition-colors">
              {isAr ? 'قصص النجاح' : 'Success Stories'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {testimonials.length}
          </div>
          <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>5.0 {isAr ? 'تقييم موثق' : 'Verified'}</span>
          </p>
        </div>

        {/* Join List Subscribers */}
        <div
          onClick={onNavigateToSubscribers}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-sky-600 transition-colors">
              {isAr ? 'قائمة الانضمام' : 'Join List'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MailCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {subscribers.length}
          </div>
          <p className="text-[10px] text-sky-600 font-semibold">
            {activeSubscribersCount} {isAr ? 'مشترك نشط' : 'Active emails'}
          </p>
        </div>

        {/* Blog & Market Insights */}
        <div
          onClick={onNavigateToBlog}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
              {isAr ? 'المدونة' : 'Blog'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {blogPosts.length}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">
            {publishedArticlesCount} {isAr ? 'مقالاً منشوراً' : 'Published'}
          </p>
        </div>

        {/* Client Leads */}
        <div
          onClick={onNavigateToLeads}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-1.5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
              {isAr ? 'الطلبات' : 'Leads'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-display-serif">
            {leads.length}
          </div>
          <p className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{isAr ? 'مزامنة CRM' : 'CRM Synced'}</span>
          </p>
        </div>
      </div>

      {/* 3. RECENT ASSETS & FAST SHORTCUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Property Additions */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 font-display-serif">
                {isAr ? 'أحدث العقارات المضافة' : 'Recent Property Additions'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? 'آخر العقارات المنشورة في الكتالوج' : 'Latest published assets in repository'}
              </p>
            </div>
            <button
              onClick={onNavigateToProperties}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{isAr ? 'إدارة الكل' : 'Manage All'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentProperties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => onSelectProperty(prop)}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                      alt={prop.title.en}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {isAr ? prop.title.ar : prop.title.en}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {isAr ? prop.location.city.ar : prop.location.city.en}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{prop.type}</span>
                    </div>
                  </div>
                </div>

                <div className="text-end shrink-0">
                  <div className="text-xs font-extrabold text-blue-700">
                    {prop.price.sar.toLocaleString()} SAR
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    prop.status === 'for-sale' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'
                  }`}>
                    {prop.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Navigation & Module Controls */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-3.5">
            <h3 className="text-base font-bold text-slate-900 font-display-serif">
              {isAr ? 'الوصول السريع للأقسام' : 'Quick CMS Modules'}
            </h3>

            <div className="space-y-2">
              <button
                onClick={onNavigateToProperties}
                className="w-full p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 text-blue-800 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  {isAr ? 'إدارة العقارات' : 'Properties Manager'}
                </span>
                <span className="px-2 py-0.5 bg-blue-200/60 text-blue-800 rounded-full text-[10px] font-bold">
                  {properties.length}
                </span>
              </button>

              <button
                onClick={onNavigateToProjects}
                className="w-full p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 text-purple-800 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  {isAr ? 'إدارة المشاريع التطويرية' : 'Development Projects'}
                </span>
                <span className="px-2 py-0.5 bg-purple-200/60 text-purple-800 rounded-full text-[10px] font-bold">
                  {projects.length}
                </span>
              </button>

              <button
                onClick={onNavigateToBlog}
                className="w-full p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  {isAr ? 'إدارة المدونة والتقارير' : 'Blog & Market Insights'}
                </span>
                <span className="px-2 py-0.5 bg-emerald-200/60 text-emerald-800 rounded-full text-[10px] font-bold">
                  {blogPosts.length}
                </span>
              </button>

              <button
                onClick={onNavigateToLeads}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  {isAr ? 'طلبات واستفسارات العملاء' : 'Leads & Inquiries'}
                </span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
                  {leads.length}
                </span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {isAr ? 'الذكاء الاصطناعي مفعّل' : 'AI Assistant Active'}
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isAr
                ? 'استخدم ميزات الصياغة التلقائية للأوصاف والمقالات باللغتين العربية والإنجليزية.'
                : 'One-click AI drafting is enabled for all property, project, and blog publishers.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
