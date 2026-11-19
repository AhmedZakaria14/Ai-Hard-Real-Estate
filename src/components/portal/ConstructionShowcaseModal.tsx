import { LocalizedValue } from '../ui/LocalizedValue';
import { SearchableSelect } from '../ui/SearchableSelect';
import { InterfaceText } from '../ui/InterfaceText';
import { ManagedImg, ManagedInput, ManagedTextarea } from '../ui/ManagedElements';
import React, { useState } from 'react';
import {
  X,
  HardHat,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { Language } from '../../types';
import { COMPANY_CREDENTIALS } from '../../construction/data/seedData';

interface ConstructionShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function ConstructionShowcaseModal({
  isOpen,
  onClose,
  language,
}: ConstructionShowcaseModalProps) {
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: 'commercial',
    budget: '5m-15m',
    location: 'Eastern Province',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const capabilities = [
    {
      title: isAr ? 'المقاولات العامة والإنشاءات الكبرى' : 'General Contracting & Commercial Builds',
      desc: isAr
        ? 'تنفيذ المشاريع التجارية، الأبراج السكنية، والمجمعات المغلقة بنظام تسليم المفتاح بأعلى معايير كود البناء السعودي.'
        : 'Full turnkey execution of commercial towers, residential communities, and corporate complexes strictly aligned with SBC regulations.',
    },
    {
      title: isAr ? 'الهندسة الإنشائية والخرسانة المسلحة' : 'Structural & Civil Engineering',
      desc: isAr
        ? 'أعمال الأساسات العميقة، الهياكل الخرسانية المسلحة، المنشآت المعدنية، وعزل المنشآت المتقدم.'
        : 'Deep foundation engineering, reinforced concrete superstructure casting, pre-engineered steel buildings, and waterproofing.',
    },
    {
      title: isAr ? 'التشطيبات الفاخرة والواجهات المعمارية' : 'Luxury Fit-Out & Architectural Facades',
      desc: isAr
        ? 'تصميم وتركيب الواجهات الزجاجية الحديثة، الألومنيوم، الكلادينج، والأعمال الكهروميكانيكية المتكاملة (MEP).'
        : 'Curtain wall glazing, ventilated architectural cladding, precision interior fit-out, and MEP building integration.',
    },
    {
      title: isAr ? 'إدارة المشاريع ونمذجة البناء (BIM)' : 'BIM Modeling & Project Management',
      desc: isAr
        ? 'استخدام برمجيات BIM المتطورة لإدارة الجداول الزمنية، ضبط التكاليف، وضمان جودة التنفيذ بنسبة 100%.'
        : 'Advanced 4D BIM modeling, milestone cost control, and comprehensive QA/QC auditing ensuring zero timeline slippage.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-hidden bg-slate-900/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200 [padding-top:env(safe-area-inset-top)] sm:[padding-top:1rem]">
      <div className="relative flex w-full min-w-0 max-w-4xl flex-col overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-xl max-h-[calc(100dvh-env(safe-area-inset-top))] sm:max-h-[calc(100dvh-2rem)] rounded-t-2xl sm:rounded-2xl my-0 sm:my-4">
        {/* Header Banner */}
        <div className="relative h-48 sm:h-56 bg-[#034DA2] overflow-hidden">
          <ManagedImg copyScope="realestate.ConstructionShowcaseModal"
            src="https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=1200&q=80"
            alt="HARD Construction"
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#034DA2]/90 via-[#034DA2]/40 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 end-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-xs cursor-pointer shadow-md z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and Tagline */}
          <div className="absolute bottom-6 start-6 end-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 text-start">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wide">
                <HardHat className="w-3.5 h-3.5 text-sky-400" />
                <span>{isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.klclzcr" source="قطاع المقاولات والإنشاءات" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.kij0y4z" source="Construction & Contracting Division" />}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display-serif text-white">
                {isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.k1vqs9uu" source="هارد للإنشاءات والمقاولات العامة" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.knikof9" source="HARD General Contracting & Construction" />}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.k1170xc8" source="مصنف فئة أولى" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.kaiec77" source="Class A Contractor" />}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:space-y-8 sm:p-8 sm:pb-8">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4 text-start">
              <h3 className="text-lg font-bold text-slate-900 font-display-serif">
                {isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.k4a0fiv" source="رؤيتنا في التشييد والبناء الهندسي" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.k18nz44j" source="Building Saudi Arabia’s Modern Horizon" />}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isAr
                  ? <InterfaceText id="realestate.ConstructionShowcaseModal.k1ttdkn5" source="تمثل شركة هارد للإنشاءات الذراع التنفيذي لمجموعة هارد، حيث نقدم حلول المقاولات العامة الشاملة للمشاريع السكنية والتجارية والصناعية الكبرى في المملكة العربية السعودية. نعتمد أعلى معايير السلامة المهنية، والتقنيات الإنشائية الحديثة لضمان التسليم ضمن الميزانية والجدول الزمني المحدد." />
                  : <InterfaceText id="realestate.ConstructionShowcaseModal.k1ihsnzw" source="HARD Construction is the flagship engineering and contracting arm of HARD Group, delivering premier turnkey construction solutions across the Kingdom of Saudi Arabia. With Class-A certifications and cutting-edge engineering methodologies, we build enduring landmarks with rigorous quality and structural integrity." />}
              </p>

              {/* Capabilities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {capabilities.map((cap, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-sky-600">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <h4 className="text-xs font-bold text-slate-900"><LocalizedValue value={cap.title} /></h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal"><LocalizedValue value={cap.desc} /></p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Metrics & Direct Contacts */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-start">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.k1rv5n0" source="مؤشرات قطاع الإنشاءات" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.kmbp5ks" source="Division Key Metrics" />}
                </h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 font-display-serif"><LocalizedValue value="45+" /></div>
                    <div className="text-[11px] text-slate-500">{isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.k18dw2bi" source="مشروع وبرج منجز" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.k17l82ub" source="Completed Landmarks" />}</div>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <div className="text-2xl font-bold text-sky-600 font-display-serif"><LocalizedValue value="100%" /></div>
                    <div className="text-[11px] text-slate-500">{isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.kjlxeeg" source="الالتزام بكود البناء السعودي" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.k4syi08" source="SBC Compliance" />}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 space-y-2 text-xs text-start">
                <span className="font-bold text-sky-900 block">{isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.kcw2v36" source="التواصل المباشر مع إدارة المشاريع:" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.ks09ert" source="Direct Project Management Desk:" />}</span>
                <div className="flex items-center gap-2 text-slate-700 dir-ltr">
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <a href={`tel:${COMPANY_CREDENTIALS.phone.replace(/\s+/g, '')}`} className="hover:text-sky-600 font-semibold">
                    <LocalizedValue value={COMPANY_CREDENTIALS.phone} />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dir-ltr">
                  <Mail className="w-3.5 h-3.5 text-sky-600" />
                  <a href={`mailto:${COMPANY_CREDENTIALS.email}`} className="hover:text-sky-600 font-semibold">
                    <LocalizedValue value={COMPANY_CREDENTIALS.email} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RFP Tender Request Form */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>{isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.k1v8y2p1" source="طلب تسعير مناقصة أو استشارة هندسية" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.kvgx0hh" source="Request Construction Tender or Consultation" />}</span>
              </h3>
              <span className="text-xs text-slate-500">{isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.krne6ck" source="استجابة خلال 24 ساعة" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.kgs7qah" source="24h Response Time" />}</span>
            </div>

            {submitted ? (
              <div className="p-6 rounded-xl bg-sky-50 border border-sky-200 text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-sky-600 mx-auto" />
                <h4 className="text-sm font-bold text-sky-900">
                  {isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.k1kuovfs" source="تم استلام طلب المشروع بنجاح!" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.kxl76x8" source="Tender Request Received!" />}
                </h4>
                <p className="text-xs text-slate-600">
                  {isAr
                    ? <InterfaceText id="realestate.ConstructionShowcaseModal.kl68h45" source="سيقوم فريق إدارة المشاريع والعطاءات بدراسة التفاصيل والتواصل معك في أقرب وقت." />
                    : <InterfaceText id="realestate.ConstructionShowcaseModal.k18v1m48" source="Our project estimation and tendering team will review your specifications and get in touch promptly." />}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 text-start">
                      {isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.k1tvq1rh" source="اسم الجهة / العميل" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.k1mltgyv" source="Client / Company Name" />} <span className="text-red-600">*</span>
                    </label>
                    <ManagedInput copyScope="realestate.ConstructionShowcaseModal"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={isAr ? 'الاسم الكريم أو اسم الشركة' : 'e.g. Al-Mashriq Group'}
                      className="w-full min-w-0 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base sm:text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 text-start">
                      {isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.khf873v" source="رقم الجوال" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.k1v8ev2w" source="Phone Number" />} <span className="text-red-600">*</span>
                    </label>
                    <ManagedInput copyScope="realestate.ConstructionShowcaseModal"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+966 5x xxx xxxx"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none dir-ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 text-start">
                      {isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.kqyk6h4" source="نوع المشروع" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.kitubsq" source="Project Type" />}
                    </label>
                    <SearchableSelect
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    >
                      <option value="commercial">{isAr ? 'برج / مجمع تجاري' : 'Commercial Tower / Complex'}</option>
                      <option value="residential">{isAr ? 'مجمع سكني أو فلل' : 'Residential Community / Villas'}</option>
                      <option value="industrial">{isAr ? 'منشأة صناعية / لوجستية' : 'Industrial / Warehouse Facility'}</option>
                      <option value="fitout">{isAr ? 'تشطيبات وتصميم داخلي' : 'Luxury Interior Fit-Out'}</option>
                    </SearchableSelect>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 text-start">
                    {isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.k1w65c4d" source="ملاحظات وتفاصيل إضافية عن المشروع" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.k1yhw6a1" source="Project Scope & Location Details" />}
                  </label>
                  <ManagedTextarea copyScope="realestate.ConstructionShowcaseModal"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={isAr ? 'الموقع، المساحة التقديرية، المتطلبات الخاصة...' : 'Location, plot area, anticipated milestones, key requirements...'}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.kysudiz" source="إغلاق" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.k1l0xxoj" source="Close" />}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <span>{isAr ? <InterfaceText id="realestate.ConstructionShowcaseModal.kfttmy1" source="إرسال طلب المناقصة" /> : <InterfaceText id="realestate.ConstructionShowcaseModal.kg11d8s" source="Submit Tender Request" />}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
