import { LocalizedValue } from '../../components/ui/LocalizedValue';
import { useCustomerFormConfig, ConfiguredFormFields } from '../../components/forms/ConfiguredFormFields';
import { ManagedButton, ManagedInput, ManagedTextarea } from '../../components/ui/ManagedElements';
import { useTextOverride } from '../../context/TextOverrideContext';
import React, { useState, useEffect, useRef, useId } from 'react';
import {
  X,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  Send,
  AlertTriangle,
  FileText,
  User,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { pick } from '../translations';
import { submitCustomerForm } from '../../lib/forms/formSubmissionService';

export function HVACQuoteDialog() {
  const formConfig = useCustomerFormConfig('hvac_service');

  const { hvac: T } = useTextOverride();
  const {
    language,
    isAr,
    isQuoteDialogOpen,
    closeQuoteDialog,
    quoteInitialData,
    serviceAreas,
    operatingHours,
  } = useHVAC();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<{
    referenceNumber: string;
    clientName: string;
  } | null>(null);

  const [quoteError, setQuoteError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Focus management, focus restoration, and body scroll lock
  useEffect(() => {
    if (isQuoteDialogOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusables = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length > 0) {
            focusables[0].focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
          triggerElementRef.current.focus();
        }
      };
    }
  }, [isQuoteDialogOpen]);

  // Handle Escape key dismissal and Tab focus containment
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeQuoteDialog();
      return;
    }

    if (e.key === 'Tab' && modalRef.current) {
      const elements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      const focusables: HTMLElement[] = elements.filter(
        (el): el is HTMLElement =>
          el instanceof HTMLElement &&
          !el.hasAttribute('disabled') &&
          el.getAttribute('aria-hidden') !== 'true'
      );

      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || document.activeElement === modalRef.current) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isQuoteDialogOpen) {
      setSubmittedLead(null);
      setQuoteError('');
      setIsSubmitting(false);
    }
  }, [isQuoteDialogOpen]);

  if (!isQuoteDialogOpen) return null;

  const area = serviceAreas.find((item) => item.id === quoteInitialData?.city);
  const cityName = quoteInitialData?.city === 'other'
    ? quoteInitialData.customCity || (isAr ? 'المنطقة الشرقية' : 'Eastern Province')
    : (isAr ? area?.cityNameAr : area?.cityNameEn) || quoteInitialData?.city || (isAr ? 'المنطقة الشرقية' : 'Eastern Province');

  const serviceName = quoteInitialData?.service || 'AC Inspection & Maintenance';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteError('');
    if (!fullName.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await formConfig.submit({
        formType: 'hvac_service',
        sector: 'hvac',
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        language,
        message: `Service: ${serviceName}\nCity: ${cityName}\nUrgent: ${isUrgent ? 'Yes' : 'No'}\nNotes: ${notes}`,
        details: {
          service: serviceName,
          city: cityName,
          customCity: quoteInitialData?.customCity,
          isUrgent,
          notes: notes.trim() || undefined,
        },
      });

      setSubmittedLead({
        referenceNumber: result.trackingCode,
        clientName: fullName.trim(),
      });
    } catch (err: any) {
      console.error('HVAC quote submission failed', err);
      setQuoteError(
        err?.message || (isAr
          ? 'تعذر إرسال طلب عرض السعر. تم الحفاظ على بياناتك المدخلة.'
          : 'Failed to submit quote request. Input is preserved.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppHandoff = () => {
    const ref = submittedLead?.referenceNumber || 'HVAC-QUOTE';
    const message = isAr
      ? `السلام عليكم، أود متابعة طلب عرض السعر لصيانة التكييف.
الرقم المرجعي: ${ref}
الاسم: ${fullName || submittedLead?.clientName}
المدينة: ${cityName}
الخدمة: ${serviceName}
${isUrgent ? '⚠️ الحالة: طوارئ عاجلة' : ''}`
      : `Hello HARD HVAC Maintenance, I would like to confirm my service quote request:
Ref Number: ${ref}
Name: ${fullName || submittedLead?.clientName}
City: ${cityName}
Service: ${serviceName}
${isUrgent ? '⚠️ Urgency: Emergency Request' : ''}`;

    const whatsapp = String(operatingHours.whatsappNumber || '').replace(/\D/g, '');
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-hidden bg-slate-950/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200 [padding-top:env(safe-area-inset-top)] sm:[padding-top:1rem]"
      onClick={closeQuoteDialog}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="relative flex w-full min-w-0 max-w-lg flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl focus:outline-none max-h-[calc(100dvh-env(safe-area-inset-top))] sm:max-h-[calc(100dvh-2rem)] rounded-t-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between bg-[#1E293B] px-4 py-4 text-white sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#0EA5E9]/20 text-[#0EA5E9]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 id={titleId} className="font-semibold text-base sm:text-lg">
                <LocalizedValue value={pick(T.quoteForm.dialogTitle, language)} />
              </h3>
              <p className="text-xs text-slate-300">
                <LocalizedValue value={cityName} /> • <LocalizedValue value={serviceName} />
              </p>
            </div>
          </div>

          <ManagedButton copyScope="hvac.HVACQuoteDialog"
            type="button"
            onClick={closeQuoteDialog}
            aria-label={isAr ? 'إغلاق نافذة طلب عرض السعر' : 'Close quote request dialog'}
            title={isAr ? 'إغلاق نافذة طلب عرض السعر' : 'Close quote request dialog'}
            className="p-2.5 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E293B] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </ManagedButton>
        </div>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-6">
          {submittedLead ? (
            /* Success State */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-in zoom-in-90 duration-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-slate-900">
                  <LocalizedValue value={pick(T.quoteForm.successMessage, language)} />
                </h4>
                <div className="inline-block px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[#0EA5E9] font-mono font-bold text-lg">
                  <bdi dir="ltr"><LocalizedValue value={submittedLead.referenceNumber} /></bdi>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto pt-1">
                  <LocalizedValue value={pick(T.quoteForm.dialogSubtitle, language)} />
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                <button
                  type="button"
                  onClick={handleWhatsAppHandoff}
                  className="px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span><LocalizedValue value={pick(T.quoteForm.whatsappHandoff, language)} /></span>
                </button>

                <button
                  type="button"
                  onClick={closeQuoteDialog}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <LocalizedValue value={pick(T.quoteForm.closeBtn, language)} />
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-start">
            <ConfiguredFormFields form={formConfig} language={language} />
              {quoteError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  <LocalizedValue value={quoteError} />
                </div>
              )}
              <p className="text-xs text-slate-600 pb-1">
                <LocalizedValue value={pick(T.quoteForm.dialogSubtitle, language)} />
              </p>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  <LocalizedValue value={pick(T.quoteForm.fullNameLabel, language)} /> <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ManagedInput copyScope="hvac.HVACQuoteDialog"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isAr ? 'مثال: م. سعود القحطاني' : 'e.g. Eng. Saud Al-Qahtani'}
                    className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-500 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  <LocalizedValue value={pick(T.quoteForm.phoneLabel, language)} /> <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ManagedInput copyScope="hvac.HVACQuoteDialog"
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX / +966 5X XXX XXXX"
                    className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-500 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed font-mono text-start"
                  />
                </div>
              </div>

              {/* Email Optional */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  <LocalizedValue value={pick(T.quoteForm.emailLabel, language)} />
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ManagedInput copyScope="hvac.HVACQuoteDialog"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-500 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  <LocalizedValue value={pick(T.quoteForm.notesLabel, language)} />
                </label>
                <ManagedTextarea copyScope="hvac.HVACQuoteDialog"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isAr
                      ? 'عدد المكيفات، نوعها (سبليت/مركزي)، أو تفاصيل العطل...'
                      : 'Number of ACs, type (split/central), symptoms...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-500 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed resize-none"
                />
              </div>

              {/* Urgency Checkbox */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                <input
                  type="checkbox"
                  id="hvac-urgency-quote"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-[#F97316] rounded border-slate-300 focus:ring-[#F97316]"
                />
                <label
                  htmlFor="hvac-urgency-quote"
                  className="text-xs font-semibold text-amber-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F97316]" />
                  <span><LocalizedValue value={pick(T.quoteForm.urgencyLabel, language)} /></span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    <LocalizedValue value={isSubmitting
                      ? pick(T.quoteForm.sendingBtn, language)
                      : pick(T.quoteForm.submitBtn, language)} />
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
