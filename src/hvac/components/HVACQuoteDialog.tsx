import React, { useState, useEffect } from 'react';
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
import { T, pick } from '../translations';

export function HVACQuoteDialog() {
  const {
    language,
    isAr,
    isQuoteDialogOpen,
    closeQuoteDialog,
    quoteInitialData,
    addLead,
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

  // Reset form when dialog opens
  useEffect(() => {
    if (isQuoteDialogOpen) {
      setSubmittedLead(null);
      setIsSubmitting(false);
    }
  }, [isQuoteDialogOpen]);

  if (!isQuoteDialogOpen) return null;

  const cityName =
    quoteInitialData?.city === 'other'
      ? quoteInitialData.customCity || 'Eastern Province'
      : T.citiesList.find((c) => c.id === quoteInitialData?.city)
      ? pick(
          T.citiesList.find((c) => c.id === quoteInitialData?.city),
          language
        )
      : quoteInitialData?.city || 'Eastern Province';

  const serviceName = quoteInitialData?.service || 'AC Inspection & Maintenance';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    const lead = addLead({
      clientName: fullName.trim(),
      phoneNumber: phone.trim(),
      email: email.trim() || undefined,
      city: cityName,
      customCity: quoteInitialData?.customCity,
      service: serviceName,
      notes: notes.trim() || undefined,
      isUrgent,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedLead({
        referenceNumber: lead.referenceNumber,
        clientName: lead.clientName,
      });
    }, 400);
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

    const url = `https://wa.me/966550641000?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeQuoteDialog}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#0EA5E9]/20 text-[#0EA5E9]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg">
                {pick(T.quoteForm.dialogTitle, language)}
              </h3>
              <p className="text-xs text-slate-300">
                {cityName} • {serviceName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeQuoteDialog}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submittedLead ? (
            /* Success State */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-in zoom-in-90 duration-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-semibold text-slate-900">
                  {pick(T.quoteForm.successMessage, language)}
                </h4>
                <div className="inline-block px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[#0EA5E9] font-mono font-bold text-lg">
                  <bdi dir="ltr">{submittedLead.referenceNumber}</bdi>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto pt-1">
                  {pick(T.quoteForm.dialogSubtitle, language)}
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
                  <span>{pick(T.quoteForm.whatsappHandoff, language)}</span>
                </button>

                <button
                  type="button"
                  onClick={closeQuoteDialog}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  {pick(T.quoteForm.closeBtn, language)}
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-start">
              <p className="text-xs text-slate-600 pb-1">
                {pick(T.quoteForm.dialogSubtitle, language)}
              </p>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {pick(T.quoteForm.fullNameLabel, language)} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isAr ? 'مثال: م. سعود القحطاني' : 'e.g. Eng. Saud Al-Qahtani'}
                    className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {pick(T.quoteForm.phoneLabel, language)} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX / +966 5X XXX XXXX"
                    className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] font-mono text-start"
                  />
                </div>
              </div>

              {/* Email Optional */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {pick(T.quoteForm.emailLabel, language)}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {pick(T.quoteForm.notesLabel, language)}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isAr
                      ? 'عدد المكيفات، نوعها (سبليت/مركزي)، أو تفاصيل العطل...'
                      : 'Number of ACs, type (split/central), symptoms...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] resize-none"
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
                  <span>{pick(T.quoteForm.urgencyLabel, language)}</span>
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
                    {isSubmitting
                      ? pick(T.quoteForm.sendingBtn, language)
                      : pick(T.quoteForm.submitBtn, language)}
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
