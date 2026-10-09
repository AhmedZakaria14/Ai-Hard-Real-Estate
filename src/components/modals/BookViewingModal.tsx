import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Property, Language } from '../../types';
import { translations } from '../../lib/translations';
import { Calendar, Clock, User, Mail, Phone, Video, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';

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
  const t = translations[language];
  const { submitLead } = useData();

  const [tourType, setTourType] = useState<'in-person' | 'virtual'>('in-person');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setIsLoading(true);
    try {
      const result = await submitLead({
        name: fullName,
        email,
        phone,
        property_id: property.id,
        property_title: property.title.en,
        inquiry_type: 'viewing_booking',
        recipient_email: 'info@hardgp.com',
        message: `Format: ${tourType}\nPreferred Date: ${preferredDate}\nPreferred Time: ${preferredTime}\nNotes: ${notes}`,
        source: 'Modal Viewing Booking',
        metadata: {
          tourType,
          preferredDate,
          preferredTime,
          agentAssigned: property.agent.name.en,
          language,
          targetEmail: 'info@hardgp.com',
          recipientEmail: 'info@hardgp.com',
        },
      });
      setLeadRef(result.lead.id);
      setCrmRef(result.crmResult.crmReferenceId);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to book viewing', err);
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
      subtitle={property.title[language]}
      maxWidth="lg"
    >
      {submitted ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 font-display-serif">
            {language === 'en' ? 'Appointment Requested!' : 'تم تقديم طلب الموعد بنجاح!'}
          </h4>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {t.modals.bookingSuccess}
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-start text-xs space-y-1.5 text-slate-600">
            <p><strong>{language === 'en' ? 'Reference Code:' : 'رقم المرجع:'}</strong> <span className="font-mono font-bold text-slate-900">{leadRef}</span></p>
            <p><strong>{language === 'en' ? 'Property:' : 'العقار:'}</strong> {property.title[language]}</p>
            <p><strong>{language === 'en' ? 'Format:' : 'النوع:'}</strong> {tourType === 'in-person' ? t.modals.inPerson : t.modals.virtual}</p>
            <p className="flex items-center gap-1.5 text-blue-600 font-semibold pt-1 border-t border-slate-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CRM Hook: {crmRef || 'Synced to Real Estate CRM'}</span>
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href={`https://wa.me/966556125711?text=${encodeURIComponent(
                language === 'en'
                  ? `Hello HARD Real Estate, I have booked a viewing for "${property.title.en}" (Ref: ${leadRef}). Please confirm.`
                  : `مرحباً هارد للعقارات، لقد حجزت موعداً لمعاينة "${property.title.ar}" (رقم المرجع: ${leadRef}). يرجى التأكيد.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="whatsapp" className="w-full sm:w-auto">
                <MessageSquare className="w-4 h-4" />
                {t.cta.chatOnWhatsApp}
              </Button>
            </a>
            <Button variant="secondary" onClick={handleReset}>
              {language === 'en' ? 'Close Window' : 'إغلاق النافذة'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tour Format selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {t.modals.tourType}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTourType('in-person')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  tourType === 'in-person'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4" />
                {t.modals.inPerson}
              </button>
              <button
                type="button"
                onClick={() => setTourType('virtual')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  tourType === 'virtual'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Video className="w-4 h-4" />
                {t.modals.virtual}
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.modals.preferredDate} *
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
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label={t.modals.preferredDate}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.modals.preferredTime} *
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="morning">{language === 'en' ? 'Morning (9:00 AM - 12:00 PM)' : 'الصباح (9:00 ص - 12:00 م)'}</option>
                <option value="afternoon">{language === 'en' ? 'Afternoon (1:00 PM - 5:00 PM)' : 'الظهيرة (1:00 م - 5:00 م)'}</option>
                <option value="evening">{language === 'en' ? 'Evening (5:00 PM - 7:30 PM)' : 'المساء (5:00 م - 7:30 م)'}</option>
              </select>
            </div>
          </div>

          {/* Contact Fields */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.contact.fullName} *
            </label>
            <input
              type="text"
              required
              placeholder={language === 'en' ? 'e.g. Faisal Al-Otaibi' : 'مثال: فيصل العتيبي'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.contact.email} *
              </label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.contact.phone} *
              </label>
              <input
                type="tel"
                required
                placeholder="+966 50 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.modals.notes}
            </label>
            <textarea
              rows={2}
              placeholder={language === 'en' ? 'Any specific questions or gate access requirements...' : 'أي استفسارات أو متطلبات خاصة بالدخول...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full">
              {t.modals.confirmBooking}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
