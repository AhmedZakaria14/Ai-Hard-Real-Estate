import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Language } from '../../types';
import { translations } from '../../lib/translations';
import { CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialSubject?: string;
}

export function InquiryModal({
  isOpen,
  onClose,
  language,
  initialSubject = '',
}: InquiryModalProps) {
  const t = translations[language];
  const { submitLead } = useData();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('buying');
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leadRef, setLeadRef] = useState('');
  const [crmRef, setCrmRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await submitLead({
        name: fullName,
        email,
        phone,
        inquiry_type: 'general_contact',
        recipient_email: 'info@hardgp.com',
        message: `Category: ${category}\nSubject: ${subject || 'Advisory Inquiry'}\n\n${message}`,
        source: 'General Advisory Inquiry Modal',
        metadata: {
          category,
          subject,
          language,
          targetEmail: 'info@hardgp.com',
          recipientEmail: 'info@hardgp.com',
        },
      });
      setLeadRef(result.lead.id);
      setCrmRef(result.crmResult.crmReferenceId);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit advisory inquiry', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={language === 'en' ? 'Direct Advisory Inquiry' : 'طلب استشارة عقارية مباشرة'}
      subtitle={language === 'en' ? 'Connect with a certified brokerage advisor within 15 minutes.' : 'تواصل مع مستشار وساطة عقارية معتمد خلال 15 دقيقة.'}
      maxWidth="md"
    >
      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 font-display-serif">
            {language === 'en' ? 'Inquiry Dispatched' : 'تم إرسال الاستفسار بنجاح'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t.contact.submitSuccess}
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-start text-xs space-y-1 text-slate-600">
            <p><strong>{language === 'en' ? 'Reference Code:' : 'رقم المرجع:'}</strong> <span className="font-mono font-bold text-slate-900">{leadRef}</span></p>
            <p className="flex items-center gap-1 text-blue-600 font-semibold pt-1 border-t border-slate-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CRM Hook: {crmRef || 'Synced to CRM'}</span>
            </p>
          </div>
          <div className="pt-2">
            <Button variant="secondary" onClick={handleReset} className="w-full">
              {language === 'en' ? 'Close' : 'إغلاق'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.contact.fullName} *
            </label>
            <input
              type="text"
              required
              placeholder={language === 'en' ? 'Your Name' : 'اسمك الكريم'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
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
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.contact.inquiryType}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="buying">{language === 'en' ? 'Property Acquisition / Buying' : 'شراء وتملك عقار'}</option>
              <option value="renting">{language === 'en' ? 'Property Leasing / Renting' : 'استئجار عقار'}</option>
              <option value="listing">{language === 'en' ? 'Selling / Listing My Property' : 'بيع أو إدراج عقاري'}</option>
              <option value="investment">{language === 'en' ? 'High-Yield Investment & Projects' : 'استثمار بعوائد مرتفعة ومشاريع'}</option>
              <option value="commercial">{language === 'en' ? 'Commercial Real Estate' : 'عقارات تجارية واستثمارية'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.contact.message}
            </label>
            <textarea
              rows={3}
              required
              placeholder={language === 'en' ? 'Tell us about your budget, target areas, or timeline...' : 'اكتب تفاصيل ميزانيتك، المناطق المفضلة، أو الإطار الزمني...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full">
              <MessageSquare className="w-4 h-4" />
              {t.cta.sendInquiry}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
