import { LocalizedValue } from '../ui/LocalizedValue';
import { useCustomerFormConfig, ConfiguredFormFields } from '../forms/ConfiguredFormFields';
import { InterfaceText } from '../ui/InterfaceText';
import { ManagedInput } from '../ui/ManagedElements';
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Language, Project } from '../../types';
import { useTextOverride } from '../../context/TextOverrideContext';
import { CheckCircle2, FileText, Send, Sparkles } from 'lucide-react';
import { submitCustomerForm, FormValidationError } from '../../lib/forms/formSubmissionService';

interface RequestBrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  project: Project | null;
}

export function RequestBrochureModal({
  isOpen,
  onClose,
  language,
  project,
}: RequestBrochureModalProps) {
  const formConfig = useCustomerFormConfig('project_inquiry');

  const { translations } = useTextOverride();
  const t = translations[language];
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState('');
  const [leadRef, setLeadRef] = useState('');
  const [crmRef, setCrmRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  if (!project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!email || !email.includes('@')) return;

    setIsLoading(true);
    try {
      const result = await formConfig.submit({
        formType: 'project_inquiry',
        sector: 'realestate',
        name: fullName.trim() || email.split('@')[0],
        email: email.trim(),
        phone: phone.trim(),
        entityId: project.id,
        entityTitle: project.title[language] || project.title.en,
        language,
        message: `Project Brochure Request for: ${project.title[language]} (${project.id})`,
        details: {
          requestType: 'brochure',
          projectId: project.id,
          recipientEmail: email.trim(),
        },
      });

      setConfirmedEmail(email.trim());
      setLeadRef(result.trackingCode);
      setCrmRef(`CRM-${result.leadId.slice(-6).toUpperCase()}`);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit brochure request', err);
      if (err instanceof FormValidationError) {
        setFormError(Object.values(err.fieldErrors).join(' '));
      } else {
        setFormError(
          err?.message || (language === 'en'
            ? 'Failed to request brochure. Input is preserved. Please retry.'
            : 'تعذر تقديم طلب الكتيب. تم الحفاظ على بياناتك، يرجى إعادة المحاولة.')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setConfirmedEmail('');
    setFullName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={language === 'en' ? 'Request Project Brochure' : 'طلب الكتيب التعريفي للمشروع'}
      subtitle={
        language === 'en'
          ? `Receive complete layout plans, pricing sheets, and ROI breakdown for ${project.title[language]}`
          : `احصل على الكتيب التفصيلي ومخططات الوحدات وجداول الأسعار لمشروع ${project.title[language]}`
      }
      maxWidth="md"
    >
      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h4 className="text-lg font-bold text-slate-900 font-display-serif">
            {language === 'en' ? <InterfaceText id="realestate.RequestBrochureModal.kvwjnia" source="Brochure Request Received!" /> : <InterfaceText id="realestate.RequestBrochureModal.ktzys7g" source="تم طلب الكتيب بنجاح!" />}
          </h4>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {language === 'en' ? (
              <><InterfaceText id="realestate.RequestBrochureModal.kggxf3s" source="We have registered your request for the full investment brochure for" /><LocalizedValue value={' '} />
                <strong className="text-slate-900"><LocalizedValue value={project.title[language]} /></strong><InterfaceText id="realestate.RequestBrochureModal.ktcuu4n" source="using" /><LocalizedValue value={' '} />
                <strong className="text-blue-700 font-mono"><LocalizedValue value={confirmedEmail} /></strong>.
              </>
            ) : (
              <><InterfaceText id="realestate.RequestBrochureModal.k1nxyl67" source="تم تسجيل طلبك للحصول على الكتيب التعريفي الشامل لمشروع" /><LocalizedValue value={' '} />
                <strong className="text-slate-900"><LocalizedValue value={project.title[language]} /></strong><InterfaceText id="realestate.RequestBrochureModal.k1g53orx" source="باستخدام البريد الإلكتروني" /><LocalizedValue value={' '} />
                <strong className="text-blue-700 font-mono"><LocalizedValue value={confirmedEmail} /></strong>.
              </>
            )}
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-start text-xs space-y-1 text-slate-600">
            <p>
              <strong>{language === 'en' ? <InterfaceText id="realestate.RequestBrochureModal.k1dodnt7" source="Reference Code:" /> : <InterfaceText id="realestate.RequestBrochureModal.k1lt3bxh" source="رقم المرجع:" />}</strong><LocalizedValue value={' '} />
              <span className="font-mono font-bold text-slate-900"><LocalizedValue value={leadRef} /></span>
            </p>
            <p className="flex items-center gap-1 text-blue-600 font-semibold pt-1 border-t border-slate-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span><LocalizedValue value={language === 'en' ? `Recorded in CRM (${crmRef || 'Synced'})` : `تم التوثيق بالنظام (${crmRef || 'مكتمل'})`} /></span>
            </p>
          </div>

          <div className="pt-2">
            <Button variant="secondary" onClick={handleReset} className="w-full">
              {language === 'en' ? <InterfaceText id="realestate.RequestBrochureModal.k1l0xxoj" source="Close" /> : <InterfaceText id="realestate.RequestBrochureModal.kysudiz" source="إغلاق" />}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
            <ConfiguredFormFields form={formConfig} language={language} />
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-start">
              <h5 className="text-xs font-bold text-slate-900 truncate"><LocalizedValue value={project.title[language]} /></h5>
              <p className="text-[11px] text-slate-500"><LocalizedValue value={project.developer[language]} /></p>
            </div>
          </div>

          <div>
            <label htmlFor="brochure-email" className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'en' ? <InterfaceText id="realestate.RequestBrochureModal.khbt3mf" source="Delivery Email Destination *" /> : <InterfaceText id="realestate.RequestBrochureModal.k1xq1m72" source="البريد الإلكتروني لاستلام الكتيب *" />}
            </label>
            <ManagedInput copyScope="realestate.RequestBrochureModal"
              id="brochure-email"
              type="email"
              required
              aria-required="true"
              placeholder={language === 'en' ? 'your.name@company.com' : 'name@domain.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="brochure-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
              <LocalizedValue value={t.contact.fullName} /> <span className="text-red-600">*</span>
            </label>
            <ManagedInput copyScope="realestate.RequestBrochureModal"
              id="brochure-fullname"
              type="text"
              required
              aria-required="true"
              placeholder={language === 'en' ? 'Your Full Name' : 'اسمك الكامل'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="brochure-phone" className="block text-xs font-semibold text-slate-700 mb-1">
              <LocalizedValue value={t.contact.phone} /> ({language === 'en' ? <InterfaceText id="realestate.RequestBrochureModal.k1yfbac9" source="Optional" /> : <InterfaceText id="realestate.RequestBrochureModal.kvjfzt2" source="اختياري" />})
            </label>
            <ManagedInput copyScope="realestate.RequestBrochureModal"
              id="brochure-phone"
              type="tel"
              placeholder="+966 50 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full">
              <Send className="w-4 h-4" />
              <span>{language === 'en' ? <InterfaceText id="realestate.RequestBrochureModal.k1vlkk4a" source="Submit Brochure Request" /> : <InterfaceText id="realestate.RequestBrochureModal.k1fyzrlj" source="تسجيل طلب الكتيب" />}</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
