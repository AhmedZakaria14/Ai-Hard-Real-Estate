import { LocalizedValue } from '../ui/LocalizedValue';
import { useCustomerFormConfig, ConfiguredFormFields } from '../forms/ConfiguredFormFields';
import { SearchableSelect } from '../ui/SearchableSelect';
import { InterfaceText } from '../ui/InterfaceText';
import { ManagedInput, ManagedTextarea } from '../ui/ManagedElements';
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Property, Language } from '../../types';
import { useTextOverride } from '../../context/TextOverrideContext';
import { Calendar, Clock, User, Mail, Phone, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { submitCustomerForm, FormValidationError } from '../../lib/forms/formSubmissionService';

interface BookViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  language: Language;
}

export function BookViewingModal({
  isOpen,
  onClose,
  property,
  language,
}: BookViewingModalProps) {
  const formConfig = useCustomerFormConfig('book_viewing');

  const { translations } = useTextOverride();
  const t = translations[language];

  const tourType = 'in-person';
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('morning');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leadRef, setLeadRef] = useState('');
  const [crmRef, setCrmRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setContactError('');

    if (!fullName.trim()) return;
    if (!phone.trim()) {
      setContactError(t.propertyDetails.validation.phoneRequired);
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setContactError(t.propertyDetails.validation.emailInvalid);
      return;
    }

    setIsLoading(true);
    try {
      const result = await formConfig.submit({
        formType: 'book_viewing',
        sector: 'realestate',
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        entityId: property.id,
        entityTitle: property?.title?.[language] || property?.title?.en || '',
        language,
        message: `Format: ${tourType}\nPreferred Date: ${preferredDate}\nPreferred Time: ${preferredTime}\nNotes: ${notes}`,
        details: {
          tourType,
          preferredDate,
          preferredTime,
          agentAssigned: (property as any).agent?.name?.en || 'HARD Advisor',
        },
      });
      setLeadRef(result.trackingCode);
      setCrmRef(`CRM-${result.leadId.slice(-6).toUpperCase()}`);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to book viewing', err);
      if (err instanceof FormValidationError) {
        setContactError(Object.values(err.fieldErrors).join(' '));
      } else {
        setContactError(err?.message || (language === 'en' ? 'Failed to book viewing. Input is preserved.' : 'فشل حجز الموعد. تم الحفاظ على البيانات.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
    onClose();
  };

  if (!property) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={t.modals.bookViewingTitle}
      subtitle={property?.title?.[language] || ''}
      maxWidth="lg"
    >
      {submitted ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 font-display-serif">
            {language === 'en' ? <InterfaceText id="realestate.BookViewingModal.kkrz8e1" source="Appointment Requested!" /> : <InterfaceText id="realestate.BookViewingModal.klns7p6" source="تم تقديم طلب الموعد بنجاح!" />}
          </h4>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            <LocalizedValue value={t.modals.bookingSuccess} />
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-start text-xs space-y-1.5 text-slate-600">
            <p><strong>{language === 'en' ? <InterfaceText id="realestate.BookViewingModal.k1dodnt7" source="Reference Code:" /> : <InterfaceText id="realestate.BookViewingModal.k1lt3bxh" source="رقم المرجع:" />}</strong> <span className="font-mono font-bold text-slate-900"><LocalizedValue value={leadRef} /></span></p>
            <p><strong>{language === 'en' ? <InterfaceText id="realestate.BookViewingModal.k86is9i" source="Property:" /> : <InterfaceText id="realestate.BookViewingModal.k176wl4l" source="العقار:" />}</strong> <LocalizedValue value={property?.title?.[language] || ''} /></p>
            <p><strong>{language === 'en' ? <InterfaceText id="realestate.BookViewingModal.k1ki0y1k" source="Format:" /> : <InterfaceText id="realestate.BookViewingModal.k1bx1lvv" source="النوع:" />}</strong> <LocalizedValue value={t.modals.inPerson} /></p>
            <p className="flex items-center gap-1.5 text-blue-600 font-semibold pt-1 border-t border-slate-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span><InterfaceText id="realestate.BookViewingModal.k1qldqm8" source="CRM Hook: " />{crmRef || <InterfaceText id="realestate.BookViewingModal.k1v0cssw" source="Synced to Real Estate CRM" />}</span>
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              href={`https://wa.me/966556125711?text=${encodeURIComponent(
                language === 'en'
                  ? `Hello HARD Real Estate, I have booked a viewing for "${property?.title?.en || ''}" (Ref: ${leadRef}). Please confirm.`
                  : `مرحباً هارد للعقارات، لقد حجزت موعداً لمعاينة "${property?.title?.ar || ''}" (رقم المرجع: ${leadRef}). يرجى التأكيد.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              className="w-full sm:w-auto"
            >
              <MessageSquare className="w-4 h-4" />
              <LocalizedValue value={t.cta.chatOnWhatsApp} />
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              {language === 'en' ? <InterfaceText id="realestate.BookViewingModal.k1jos4bt" source="Close Window" /> : <InterfaceText id="realestate.BookViewingModal.kd1pq17" source="إغلاق النافذة" />}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
            <ConfiguredFormFields form={formConfig} language={language} />
          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="book-viewing-date" className="block text-xs font-semibold text-slate-700 mb-1">
                <LocalizedValue value={t.modals.preferredDate} /> <span className="text-red-600">*</span>
              </label>
              <div className="relative group">
                {/* Visual custom presentation avoiding browser reversed Arabic placeholders */}
                <div className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 group-hover:border-slate-400 rounded-xl text-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all flex items-center justify-between pointer-events-none">
                  <span className={preferredDate ? 'text-slate-900 font-medium' : 'text-slate-500 font-normal'}>
                    {preferredDate ? (
                      language === 'ar' ? (
                        (() => {
                          const parts = preferredDate.split('-');
                          if (parts.length === 3) {
                            return `${parts[2]}/${parts[1]}/${parts[0]}`;
                          }
                          return preferredDate;
                        })()
                      ) : (
                        preferredDate
                      )
                    ) : (
                      language === 'ar' ? 'يوم/شهر/سنة' : 'dd/mm/yyyy'
                    )}
                  </span>
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                </div>

                {/* Overlaid native HTML5 date input */}
                <ManagedInput copyScope="realestate.BookViewingModal"
                  id="book-viewing-date"
                  type="date"
                  required
                  aria-required="true"
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label={t.modals.preferredDate}
                />
              </div>
            </div>
            <div>
              <label htmlFor="book-viewing-time" className="block text-xs font-semibold text-slate-700 mb-1">
                <LocalizedValue value={t.modals.preferredTime} /> <span className="text-red-600">*</span>
              </label>
              <SearchableSelect
                id="book-viewing-time"
                required
                aria-required="true"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="morning">{language === 'en' ? 'Morning (9:00 AM - 12:00 PM)' : 'الصباح (9:00 ص - 12:00 م)'}</option>
                <option value="afternoon">{language === 'en' ? 'Afternoon (1:00 PM - 5:00 PM)' : 'الظهيرة (1:00 م - 5:00 م)'}</option>
                <option value="evening">{language === 'en' ? 'Evening (5:00 PM - 7:30 PM)' : 'المساء (5:00 م - 7:30 م)'}</option>
              </SearchableSelect>
            </div>
          </div>

          {/* Contact Fields */}
          <div>
            <label htmlFor="book-viewing-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
              <LocalizedValue value={t.contact.fullName} /> <span className="text-red-600">*</span>
            </label>
            <ManagedInput copyScope="realestate.BookViewingModal"
              id="book-viewing-fullname"
              type="text"
              required
              aria-required="true"
              placeholder={language === 'en' ? 'e.g. Faisal Al-Otaibi' : 'مثال: فيصل العتيبي'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="book-viewing-email" className="block text-xs font-semibold text-slate-700 mb-1">
                <LocalizedValue value={t.contact.email} /> <span className="text-slate-400 font-normal">({language === 'en' ? <InterfaceText id="realestate.BookViewingModal.k1yfbac9" source="Optional" /> : <InterfaceText id="realestate.BookViewingModal.kvjfzt2" source="اختياري" />})</span>
              </label>
              <ManagedInput copyScope="realestate.BookViewingModal"
                id="book-viewing-email"
                type="email"
                onInvalid={() => setContactError(t.propertyDetails.validation.emailInvalid)}
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (contactError) setContactError('');
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="book-viewing-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                <LocalizedValue value={t.contact.phone} /> <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <ManagedInput copyScope="realestate.BookViewingModal"
                id="book-viewing-phone"
                type="tel"
                required
                onInvalid={() => setContactError(t.propertyDetails.validation.phoneRequired)}
                placeholder="+966 50 000 0000"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (contactError) setContactError('');
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {contactError && (
            <p role="alert" className="text-xs text-rose-500 font-medium"><LocalizedValue value={contactError} /></p>
          )}

          <div>
            <label htmlFor="book-viewing-notes" className="block text-xs font-semibold text-slate-700 mb-1">
              <LocalizedValue value={t.modals.notes} /> <span className="text-slate-400 font-normal">({language === 'en' ? <InterfaceText id="realestate.BookViewingModal.k1yfbac9" source="Optional" /> : <InterfaceText id="realestate.BookViewingModal.kvjfzt2" source="اختياري" />})</span>
            </label>
            <ManagedTextarea copyScope="realestate.BookViewingModal"
              id="book-viewing-notes"
              rows={2}
              placeholder={language === 'en' ? 'Any questions or special requirements...' : 'أي استفسارات أو متطلبات خاصة...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full">
              <LocalizedValue value={t.modals.confirmBooking} />
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
