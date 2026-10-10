import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Shield, FileText, Lock, CheckCircle2, AlertCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../lib/translations';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialTab?: 'privacy' | 'terms';
}

export function PrivacyTermsModal({
  isOpen,
  onClose,
  language,
  initialTab = 'privacy',
}: PrivacyTermsModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);
  const isAr = language === 'ar';
  const t = translations[language];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        activeTab === 'privacy'
          ? isAr
            ? 'سياسة الخصوصية وحماية البيانات'
            : 'Privacy Policy & Data Protection'
          : isAr
          ? 'الشروط والأحكام الشروط التشغيلية'
          : 'Terms & Operational Conditions'
      }
      maxWidth="xl"
    >
      <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Tab Navigation Controls */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'الشروط والأحكام' : 'Terms of Service'}</span>
          </button>
        </div>

        {/* Pending Legal Certification Notice */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">
              {isAr ? 'إشعار الاعتماد القانوني الرسمي:' : 'Formal Legal Certification Notice:'}
            </span>
            <p className="text-amber-800">
              {isAr
                ? 'يعكس هذا المستند الممارسات الشفافة الحالية لجمع البيانات والشروط التشغيلية لشركة هارد للعقارات. النسخة القانونية الرسمية المعتمدة من مستشارينا القانونيين بالمملكة قيد الاعتماد النهائى وستُنشر فور اكتمالها.'
                : 'This document accurately describes HARD Real Estate’s actual operational data practices and client interaction standards. The fully formalized legal text, prepared by certified Saudi legal counsel, is currently pending final board execution and will be published upon approval.'}
            </p>
          </div>
        </div>

        {/* TAB 1: Privacy Policy Content */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pe-2">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base font-display-serif flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>{isAr ? '1. جمع البيانات والغرض منها' : '1. Operational Data Practices'}</span>
              </h3>
              <p>
                {isAr
                  ? 'نقوم بجمع البيانات الشخصية (الاسم، البريد الإلكتروني، رقم الهاتف/الواتساب، وتفاصيل الاستفسار) فقط عند تقديمها طوعاً عبر استمارات الاستفسار عن العقارات، طلبات المعاينة، أو الاشتراك في النشرة العقارية.'
                  : 'We collect personal information (name, email address, phone/WhatsApp number, and inquiry specifications) strictly when provided voluntarily through property inquiry forms, viewing booking requests, or newsletter subscriptions.'}
              </p>
              <ul className="list-disc list-inside space-y-1 ps-2 text-slate-600">
                <li>{isAr ? 'تسهيل التواصل والرد على طلبات الاستشارة والمعاينة.' : 'Facilitate direct brokerage advisory and property walkthrough scheduling.'}</li>
                <li>{isAr ? 'إرسال العروض العقارية النخبوية وتقارير السوق المخصصة.' : 'Deliver tailored off-market opportunities and market valuation reports.'}</li>
                <li>{isAr ? 'الالتزام بسجلات السجل والوساطة العقارية وفق تعليمات الهيئة العامة للعقار (REGA).' : 'Maintain brokerage transaction records in compliance with REGA regulatory standards.'}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base font-display-serif flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>{isAr ? '2. التخزين المحلي والملفات النصية (Cookies)' : '2. Local Storage & Client State'}</span>
              </h3>
              <p>
                {isAr
                  ? 'تستخدم هذه المنصة التخزين المحلي للمتصفح (localStorage) لحفظ تفضيلات اللغة، فلترة العقارات، وجلسات الدخول الآمنة للإدارة. لا نستخدم أدوات تتبع خارجية لبيع بيانات المستخدمين.'
                  : 'This application utilizes browser local storage strictly for retaining language selections, active property search filters, and secure administrative authentication tokens. We do not sell or monetize client telemetry.'}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base font-display-serif flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? '3. حقوق المستخدم والتواصل' : '3. Client Data Rights'}</span>
              </h3>
              <p>
                {isAr
                  ? 'يحق لكل عميل طلب تعديل أو حذف بياناته من سجلات التواصل الخاصة بنا في أي وقت عبر التواصل المباشر مع فريق حماية البيانات.'
                  : 'You retain full control over your submitted data. You may request dataset deletion or information correction at any time by contacting our privacy compliance officer.'}
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-4 font-mono text-xs text-slate-800">
                <span>✉ Email: info@hardgp.com</span>
                <span>📞 Phone: +966 55 612 5711</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Terms of Service Content */}
        {activeTab === 'terms' && (
          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pe-2">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base font-display-serif flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{isAr ? '1. الهوية والترخيص المعتمد' : '1. Licensed Brokerage Identity'}</span>
              </h3>
              <p>
                {isAr
                  ? 'شركة هارد للعقارات هي مؤسسة وساطة وتطوير عقاري مرخصة رسمياً بالمملكة العربية السعودية بموجب ترخيص الهيئة العامة للعقار (REGA) رقم 7200018492 والسجل التجاري رقم 2051254311 (الخبر، المنطقة الشرقية).'
                  : 'HARD Real Estate Group operates as an officially licensed brokerage and real estate firm in the Kingdom of Saudi Arabia under REGA License #7200018492 and Commercial Registration #2051254311 (Al Khobar, Eastern Province).'}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base font-display-serif flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span>{isAr ? '2. طبيعة الطلبات والأسعار' : '2. Listing Information & Non-Binding Inquiries'}</span>
              </h3>
              <p>
                {isAr
                  ? 'تعتبر جميع الاستشارات، أسعار العقارات، وطلبات الحجز المقدمة عبر المنصة استفسارات أولية غير ملزمة قانونياً لحين توقيع العقود الرسمية وتوثيقها عبر المنصات المعتمدة (مثل منصة إيجار أو البورصة العقارية).'
                  : 'All property guides, unit prices, and inquiry submissions represent preliminary non-binding consultation requests. Binding obligations arise strictly upon executing formal notarized contracts and registry documentation through approved Saudi portals (e.g. Ejar, Real Estate Exchange).'}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base font-display-serif flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>{isAr ? '3. دقة بيانات العقارات' : '3. Listing Specs Verification'}</span>
              </h3>
              <p>
                {isAr
                  ? 'يتم تدقيق مواصفات المساحات، الصكوك، والأسعار بناءً على المستندات الرسمية المقدمة من المطورين والمالكين، وهي خاضعة للتوافر والتعاقد النهائي.'
                  : 'Property dimensions, floor plans, and pricing benchmarks are derived directly from verified engineering blueprints and title deeds. Final transaction terms are governed strictly by executed bilateral contracts.'}
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق النافذة' : 'Close Document'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
