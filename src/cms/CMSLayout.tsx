import React, { useState } from "react";
import {
  canEditContent,
  canManageLeads,
  canManageSettings,
  AdminRole,
} from "../types/backend-schema";
import {
  LayoutDashboard,
  Building,
  Layers,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Globe,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  FileEdit,
  Award,
  MailCheck,
  UserCheck,
  HelpCircle,
  MapPin,
  TrendingUp,
  Building2,
  FileText,
  Calendar,
  Sliders,
  Trash2,
} from "lucide-react";
import { Language } from "../types";

export type CMSTab =
  | "dashboard"
  | "properties"
  | "projects"
  | "content"
  | "forms"
  | "calculators"
  | "team"
  | "testimonials"
  | "faqs"
  | "offices"
  | "certifications"
  | "statistics"
  | "partners"
  | "blog"
  | "subscribers"
  | "leads"
  | "appointments"
  | "operations"
  | "settings";

interface CMSLayoutProps {
  activeTab: CMSTab;
  onSelectTab: (tab: CMSTab) => void;
  onOpenCatalog: () => void;
  onLogout: () => void;
  isSigningOut: boolean;
  signOutFailed: boolean;
  onViewLiveSite: () => void;
  adminUser: { name: string; email: string; role: string };
  language: Language;
  onLanguageChange: (lang: Language) => void;
  children: React.ReactNode;
}

export const CMSLayout: React.FC<CMSLayoutProps> = ({
  activeTab,
  onSelectTab,
  onOpenCatalog,
  onLogout,
  isSigningOut,
  signOutFailed,
  onViewLiveSite,
  adminUser,
  language,
  onLanguageChange,
  children,
}) => {
  const isAr = language === "ar";
  const logoutLabel = isAr ? "تسجيل الخروج" : "Log Out";
  const logoutText = isSigningOut
    ? (isAr ? "جاري تسجيل الخروج…" : "Signing out…")
    : logoutLabel;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const userRole = (adminUser.role || "superadmin") as AdminRole;

  const allNavItems: {
    id: CMSTab;
    labelEn: string;
    labelAr: string;
    icon: React.FC<{ className?: string }>;
    roleGuard?: (role: AdminRole) => boolean;
  }[] = [
    {
      id: "dashboard",
      labelEn: "Executive Dashboard",
      labelAr: "لوحة التحكم والمؤشرات",
      icon: LayoutDashboard,
    },
    {
      id: "properties",
      labelEn: "Properties & Listings",
      labelAr: "إدارة العقارات والأصول",
      icon: Building,
      roleGuard: canEditContent,
    },
    {
      id: "projects",
      labelEn: "Major Projects & Off-Plan",
      labelAr: "المشاريع التطويرية والواجهات",
      icon: Layers,
      roleGuard: canEditContent,
    },
    {
      id: "content",
      labelEn: "Site Content & Drafts",
      labelAr: "إدارة المحتوى والمسودات",
      icon: FileEdit,
      roleGuard: canEditContent,
    },
    {
      id: "forms",
      labelEn: "Customer Form Builder",
      labelAr: "بناء ونماذج الخدمة",
      icon: FileText,
      roleGuard: canEditContent,
    },
    {
      id: "calculators",
      labelEn: "Calculators & Estimators",
      labelAr: "حاسبات التكلفة والتقديرات",
      icon: Sliders,
      roleGuard: canEditContent,
    },
    {
      id: "team",
      labelEn: "Team Members",
      labelAr: "فريق العمل والقيادات",
      icon: UserCheck,
      roleGuard: canEditContent,
    },
    {
      id: "testimonials",
      labelEn: "Client Success Stories",
      labelAr: "قصص نجاح العملاء",
      icon: Award,
      roleGuard: canEditContent,
    },
    {
      id: "faqs",
      labelEn: "Frequently Asked Questions",
      labelAr: "الأسئلة الشائعة (FAQs)",
      icon: HelpCircle,
      roleGuard: canEditContent,
    },
    {
      id: "offices",
      labelEn: "Offices & Locations",
      labelAr: "الفروع والمقرات الرسمية",
      icon: MapPin,
      roleGuard: canEditContent,
    },
    {
      id: "certifications",
      labelEn: "Certifications & Licenses",
      labelAr: "الاعتمادات والتراخيص",
      icon: Award,
      roleGuard: canEditContent,
    },
    {
      id: "statistics",
      labelEn: "Key Statistics & Claims",
      labelAr: "المؤشرات والأرقام الإحصائية",
      icon: TrendingUp,
      roleGuard: canEditContent,
    },
    {
      id: "partners",
      labelEn: "Partners & Brands",
      labelAr: "الشركاء والعلامات التجارية",
      icon: Building2,
      roleGuard: canEditContent,
    },
    {
      id: "blog",
      labelEn: "Blog & Market Insights",
      labelAr: "المدونة والتقارير العقارية",
      icon: BookOpen,
      roleGuard: canEditContent,
    },
    {
      id: "subscribers",
      labelEn: "Join List",
      labelAr: "قائمة الانضمام",
      icon: MailCheck,
      roleGuard: canManageLeads,
    },
    {
      id: "leads",
      labelEn: "Inquiries & Leads",
      labelAr: "الطلبات واستفسارات العملاء",
      icon: Users,
      roleGuard: canManageLeads,
    },
    {
      id: "appointments",
      labelEn: "Viewings & Appointments",
      labelAr: "المعاينة والمواعيد الميدانية",
      icon: Calendar,
      roleGuard: canManageLeads,
    },
    {
      id: "operations",
      labelAr: "إدارة العمليات",
      labelEn: "Operations",
      icon: Layers,
      roleGuard: canManageLeads,
    },
    {
      id: "settings",
      labelEn: "System Settings",
      labelAr: "إعدادات النظام والصلحيات",
      icon: Settings,
      roleGuard: canManageSettings,
    },
  ];

  const navItems = allNavItems.filter(
    (item) => !item.roleGuard || item.roleGuard(userRole),
  );

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      onKeyDown={(event) => {
        if (event.key === "Escape") setMobileSidebarOpen(false);
      }}
      className="min-h-screen bg-slate-900/10 flex flex-col lg:flex-row font-ui-sans selection:bg-blue-600 selection:text-white"
    >
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-slate-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-white font-display-serif block">
              HARD Real Estate
            </span>
            <span className="text-[10px] text-blue-400 font-semibold block">
              CMS Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLogout}
            disabled={isSigningOut}
            aria-label={logoutLabel}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-red-300 hover:bg-white/10 disabled:opacity-60"
          >
            <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{logoutText}</span>
          </button>
          <button
            onClick={() => onLanguageChange(isAr ? "en" : "ar")}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/10 text-slate-200"
          >
            {isAr ? "EN" : "عربي"}
          </button>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label={isAr ? "فتح القائمة" : "Open menu"}
            aria-expanded={mobileSidebarOpen}
            aria-controls="cms-sidebar"
            className="grid size-11 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>

      <div
        aria-hidden="true"
        onClick={() => setMobileSidebarOpen(false)}
        className={`fixed inset-0 z-30 touch-none bg-slate-950/60 transition-opacity duration-200 motion-reduce:transition-none lg:hidden ${
          mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer) */}
      <aside
        id="cms-sidebar"
        className={`fixed inset-y-0 start-0 z-40 flex w-72 max-w-[calc(100vw-3rem)] flex-col justify-between overflow-y-auto overscroll-contain border-e border-slate-800/80 bg-slate-950 text-slate-300 shadow-2xl transition-[translate,visibility] duration-200 ease-out lg:visible lg:static lg:max-w-none lg:shrink-0 lg:overflow-visible lg:shadow-none lg:transition-[width] lg:ltr:translate-x-0 lg:rtl:translate-x-0 motion-reduce:transition-none ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-72"
        } ${mobileSidebarOpen ? "visible translate-x-0" : "invisible ltr:-translate-x-full rtl:translate-x-full"}`}
      >
        {/* Sidebar Top: Branding + Collapse button */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-900/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm font-display-serif tracking-tight flex items-center gap-1.5">
                    <span>HARD Real Estate</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                    {isAr ? "بوابة الإدارة السحابية" : "Enterprise CMS"}
                  </span>
                </div>
              </div>
            )}

            {sidebarCollapsed && (
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center mx-auto text-white">
                <Building className="w-5 h-5" />
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label={isAr ? "إغلاق القائمة" : "Close menu"}
              className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X aria-hidden="true" className="size-5" />
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                isAr ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              ) : isAr ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-900/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                  } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                  title={isAr ? item.labelAr : item.labelEn}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                  />
                  {!sidebarCollapsed && (
                    <span className="truncate">
                      {isAr ? item.labelAr : item.labelEn}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom: Admin Profile + Return to Site & Logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          {/* View Live Site Quick Action */}
          <button
            onClick={onViewLiveSite}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-slate-800 ${
              sidebarCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />
            {!sidebarCollapsed && (
              <span>{isAr ? "معاينة الموقع الحي" : "View Live Website"}</span>
            )}
          </button>

          {/* Admin Info */}
          {!sidebarCollapsed && (
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                {adminUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate">
                  {adminUser.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {adminUser.role}
                </span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            disabled={isSigningOut}
            aria-label={logoutLabel}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-red-400 disabled:opacity-60 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer ${
              sidebarCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && (
              <span>{logoutText}</span>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
          <div className="space-y-0.5">
            <h2 className="text-base font-extrabold text-slate-900 font-display-serif capitalize">
              {
                navItems.find((n) => n.id === activeTab)?.[
                  isAr ? "labelAr" : "labelEn"
                ]
              }
            </h2>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>CMS</span>
              <span>/</span>
              <span className="text-blue-600 font-semibold">
                {
                  navItems.find((n) => n.id === activeTab)?.[
                    isAr ? "labelAr" : "labelEn"
                  ]
                }
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCatalog}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{isAr ? "الكتالوج والأرشفة" : "Catalog & Archive"}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(isAr ? "en" : "ar")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 hover:text-blue-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? "English" : "العربية"}</span>
            </button>

            {/* View Live Site Button */}
            <button
              onClick={onViewLiveSite}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>{isAr ? "زيارة الموقع الحي" : "Live Website"}</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              disabled={isSigningOut}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              <LogOut aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span>{logoutText}</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {signOutFailed && (
            <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {isAr ? "تعذّر تسجيل الخروج. حاول مرة أخرى." : "Could not sign out. Try again."}
            </p>
          )}
          {children}
        </main>

      </div>
    </div>
  );
};
