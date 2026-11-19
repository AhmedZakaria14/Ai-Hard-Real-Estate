import { LocalizedValue } from '../../components/ui/LocalizedValue';
import { useCustomerFormConfig, ConfiguredFormFields } from '../../components/forms/ConfiguredFormFields';
import { SearchableSelect } from '../../components/ui/SearchableSelect';
import { InterfaceText } from '../../components/ui/InterfaceText';
import { ManagedButton, ManagedInput, ManagedTextarea } from '../../components/ui/ManagedElements';
import { useTextOverride } from '../../context/TextOverrideContext';
import React, { useState, useEffect, useRef, useId } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  Send,
  MessageSquare,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { pick } from '../translations';
import { FormAttachmentMeta } from '../../types/backend-schema';
import { submitCustomerForm } from '../../lib/forms/formSubmissionService';
import { FileUploadZone } from '../../components/forms/FileUploadZone';

export function HVACBookingModal() {
  const formConfig = useCustomerFormConfig('hvac_service');

  const { hvac: T } = useTextOverride();
  const {
    language,
    isAr,
    isBookingModalOpen,
    bookingInitialService,
    closeBookingModal,
    services,
    serviceAreas,
    bookingCopy,
    operatingHours,
  } = useHVAC();

  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState<'morning' | 'afternoon' | 'evening' | 'emergency'>('morning');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCity, setCity] = useState('');
  const activeCities = serviceAreas.filter((area) => area.active);
  const city = activeCities.some((area) => area.id === selectedCity) ? selectedCity : activeCities[0]?.id ?? '';
  const [customCity, setCustomCity] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<FormAttachmentMeta[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedLead, setConfirmedLead] = useState<{
    referenceNumber: string;
    clientName: string;
  } | null>(null);

  const [bookingError, setBookingError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Focus management, focus restoration, and body scroll lock
  useEffect(() => {
    if (isBookingModalOpen) {
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
  }, [isBookingModalOpen]);

  // Handle Escape key dismissal and Tab focus containment
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeBookingModal();
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

  // Set initial service and tomorrow's date by default
  useEffect(() => {
    if (isBookingModalOpen) {
      setConfirmedLead(null);
      setBookingError('');
      setService(bookingInitialService || '');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isBookingModalOpen, bookingInitialService]);

  if (!isBookingModalOpen) return null;

  const area = serviceAreas.find((item) => item.id === city);
  const cityName = city === 'other'
    ? customCity || (isAr ? 'المنطقة الشرقية' : 'Eastern Province')
    : (isAr ? area?.cityNameAr : area?.cityNameEn) || city;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingError('');
    const requestedDate = String(new FormData(e.currentTarget).get('preferredDate') || date);
    if (!name.trim() || !phone.trim() || !requestedDate || !service || !city) return;

    setIsSubmitting(true);
    try {
      const result = await formConfig.submit({
        formType: 'hvac_service',
        sector: 'hvac',
        name: name.trim(),
        email: '',
        phone: phone.trim(),
        language,
        message: `Service: ${service}\nPreferred Date: ${requestedDate} (${slot})\nCity: ${cityName}\nNotes: ${notes}`,
        attachments,
        details: {
          service,
          date: requestedDate,
          slot,
          city: cityName,
          customCity: city === 'other' ? customCity : undefined,
          isUrgent: slot === 'emergency',
          notes: notes.trim() || undefined,
        },
      });

      setConfirmedLead({
        referenceNumber: result.trackingCode,
        clientName: name.trim(),
      });
    } catch (err: any) {
      console.error('HVAC booking submission failed', err);
      setBookingError(
        err?.message || (isAr
          ? 'تعذر إرسال الطلب. تم الحفاظ على بياناتك، يرجى إعادة المحاولة.'
          : 'Failed to submit booking request. Input is preserved. Please retry.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppConfirmation = () => {
    const ref = confirmedLead?.referenceNumber || 'HVAC-BOOKING';
    const text = isAr
      ? `السلام عليكم، أود تأكيد موعد الصيانة المحجوز.
الرقم المرجعي: ${ref}
الاسم: ${name || confirmedLead?.clientName}
الخدمة: ${service}
التاريخ: ${date} (${slot})
المدينة: ${cityName}`
      : `Hello HARD HVAC Maintenance, I would like to confirm my booked service:
Ref: ${ref}
Name: ${name || confirmedLead?.clientName}
Service: ${service}
Date: ${date} (${slot})
City: ${cityName}`;

    const whatsapp = String(operatingHours.whatsappNumber || '').replace(/\D/g, '');
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeBookingModal}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1E293B] text-white px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0EA5E9]/20 text-[#0EA5E9]">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 id={titleId} className="font-semibold text-base sm:text-lg">
                <LocalizedValue value={isAr ? bookingCopy.modalTitleAr : bookingCopy.modalTitleEn} />
              </h3>
              <p className="text-xs text-slate-300">
                <LocalizedValue value={isAr ? bookingCopy.modalSubtitleAr : bookingCopy.modalSubtitleEn} />
              </p>
            </div>
          </div>

          <ManagedButton copyScope="hvac.HVACBookingModal"
            type="button"
            onClick={closeBookingModal}
            aria-label={isAr ? 'إغلاق نافذة حجز خدمة التكييف' : 'Close booking dialog'}
            title={isAr ? 'إغلاق نافذة الحجز' : 'Close booking dialog'}
            className="p-2.5 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E293B] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </ManagedButton>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {confirmedLead ? (
            /* Confirmation Screen */
            <div className="text-center space-y-5 py-6">
              <div className="w-16 h-16 rounded-full bg-sky-100 text-[#0EA5E9] flex items-center justify-center mx-auto animate-in zoom-in-90 duration-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                  <LocalizedValue value={pick(T.bookingModal.resultStatusBadge, language)} />
                </div>
                <h4 className="text-xl font-semibold text-slate-900">
                  <LocalizedValue value={pick(T.bookingModal.resultTitle, language)} />
                </h4>
                <div className="inline-block px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[#0EA5E9] font-mono font-bold text-lg">
                  <bdi dir="ltr"><LocalizedValue value={confirmedLead.referenceNumber} /></bdi>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  <LocalizedValue value={pick(T.bookingModal.resultDesc, language)} />
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                <button
                  type="button"
                  onClick={handleWhatsAppConfirmation}
                  className="px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isAr ? <InterfaceText id="hvac.HVACBookingModal.k191p4hk" source="متابعة وتأكيد الطلب عبر الواتساب" /> : <InterfaceText id="hvac.HVACBookingModal.k1bi19rt" source="Follow up via WhatsApp" />}</span>
                </button>

                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <LocalizedValue value={pick(T.quoteForm.closeBtn, language)} />
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-start">
            <ConfiguredFormFields form={formConfig} language={language} />
              {bookingError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  <LocalizedValue value={bookingError} />
                </div>
              )}
              {/* Service Select */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  <LocalizedValue value={pick(T.bookingModal.serviceSelect, language)} /> <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Wrench className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <SearchableSelect
                    required
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full ps-9 pe-8 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="" disabled>
                      {isAr ? '-- اختر الخدمة المطلوب تنفيذها --' : '-- Select Requested Service --'}
                    </option>
                    {services.filter((s) => s.active).map((s) => (
                      <option key={s.id} value={isAr ? s.titleAr : s.titleEn}>
                        {isAr ? s.titleAr : s.titleEn}
                      </option>
                    ))}
                  </SearchableSelect>
                </div>
              </div>

              {/* Date & Time Slot in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    <LocalizedValue value={pick(T.bookingModal.dateLabel, language)} /> <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <CalendarIcon className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      name="preferredDate"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      onInput={(e) => setDate(e.currentTarget.value)}
                      className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    <LocalizedValue value={pick(T.bookingModal.timeSlotLabel, language)} /> <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <SearchableSelect
                      value={slot}
                      onChange={(e) => setSlot(e.target.value as any)}
                      className="w-full ps-9 pe-8 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <option value="morning">{pick(T.bookingModal.slotMorning, language)}</option>
                      <option value="afternoon">{pick(T.bookingModal.slotAfternoon, language)}</option>
                      <option value="evening">{pick(T.bookingModal.slotEvening, language)}</option>
                      <option value="emergency">{pick(T.bookingModal.slotEmergency, language)}</option>
                    </SearchableSelect>
                  </div>
                </div>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  <LocalizedValue value={pick(T.bookingModal.city, language)} /> <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <SearchableSelect
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full ps-9 pe-8 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {activeCities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.cityNameAr : c.cityNameEn}
                      </option>
                    ))}
                  </SearchableSelect>
                </div>
              </div>

              {city === 'other' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    <LocalizedValue value={pick(T.quoteForm.otherCityLabel, language)} /> <span className="text-red-600">*</span>
                  </label>
                  <ManagedInput copyScope="hvac.HVACBookingModal"
                    type="text"
                    required
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder={pick(T.quoteForm.otherCityPlaceholder, language)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-500 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {/* Client Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    <LocalizedValue value={pick(T.bookingModal.clientName, language)} /> <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ManagedInput copyScope="hvac.HVACBookingModal"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isAr ? 'الاسم الكريم' : 'Your Name'}
                      className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-500 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    <LocalizedValue value={pick(T.bookingModal.phone, language)} /> <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ManagedInput copyScope="hvac.HVACBookingModal"
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XXXXXXXX"
                      className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-500 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed font-mono text-start"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  <LocalizedValue value={pick(T.bookingModal.notes, language)} />
                </label>
                <ManagedTextarea copyScope="hvac.HVACBookingModal"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isAr
                      ? 'عدد المكيفات، نوعها، أو العنوان التفصيلي...'
                      : 'Number of units, type, or specific address details...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 hover:border-slate-400 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-500 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed resize-none"
                />
              </div>

              {/* Attachments */}
              <FileUploadZone
                uploadSessionId="hvac-booking-modal"
                attachments={attachments}
                onChange={setAttachments}
                language={language}
                labelAr="صور الموقع أو الوحدة إن وجدت (اختياري)"
                labelEn="Site or Unit Photos (Optional)"
              />

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    <LocalizedValue value={isSubmitting
                      ? pick(T.quoteForm.sendingBtn, language)
                      : (isAr ? bookingCopy.submitButtonAr : bookingCopy.submitButtonEn)} />
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
