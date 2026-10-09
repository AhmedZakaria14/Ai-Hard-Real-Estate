import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle2,
  Send,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Language, PageId } from '../types';
import { translations } from '../lib/translations';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useData } from '../context/DataContext';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export function ContactPage({ onNavigate, language }: ContactPageProps) {
  const t = translations[language];
  const { submitLead } = useData();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('buying');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leadRef, setLeadRef] = useState('');
  const [crmRef, setCrmRef] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await submitLead({
        name: fullName,
        email,
        phone,
        inquiry_type: 'general_contact',
        recipient_email: 'info@hardgp.com',
        message: `Inquiry Type: ${inquiryType}\nSubject: ${subject || 'Contact Inquiry'}\n\n${message}`,
        source: 'Contact Us Concierge Page',
        metadata: {
          inquiryType,
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
      console.error('Contact form submission failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <Badge variant="primary">{language === 'en' ? 'Direct Brokerage Concierge' : 'خدمة العملاء والاستشارات'}</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
          {t.contact.pageTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {t.contact.pageSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Direct Message & Lead Capture (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-900 font-display-serif">
            {t.contact.formTitle}
          </h2>

          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display-serif">
                {language === 'en' ? 'Message Sent Successfully' : 'تم إرسال رسالتك بنجاح'}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {t.contact.submitSuccess}
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-start text-xs space-y-1.5 max-w-md mx-auto text-slate-600">
                <p><strong>{language === 'en' ? 'Inquiry Reference:' : 'رقم المرجع:'}</strong> <span className="font-mono font-bold text-slate-900">{leadRef}</span></p>
                <p className="flex items-center gap-1.5 text-blue-600 font-semibold pt-1 border-t border-slate-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CRM Synchronization: {crmRef || 'Active'}</span>
                </p>
              </div>
              <div className="pt-2">
                <Button variant="secondary" onClick={handleReset}>
                  {language === 'en' ? 'Send Another Message' : 'إرسال رسالة أخرى'}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.contact.fullName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'en' ? 'e.g. John Doe' : 'مثال: عبد الله السعيد'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.contact.inquiryType}
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="buying">{language === 'en' ? 'Property Acquisition' : 'شراء عقار'}</option>
                    <option value="renting">{language === 'en' ? 'Property Rental' : 'استئجار عقار'}</option>
                    <option value="listing">{language === 'en' ? 'Listing / Selling' : 'إدراج / بيع عقار'}</option>
                    <option value="investment">{language === 'en' ? 'Investment Advisory' : 'استشارات استثمارية'}</option>
                    <option value="consultation">{language === 'en' ? 'General Consultation' : 'استشارة عامة'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.contact.subject} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'en' ? 'Brief subject...' : 'موضوع الرسالة...'}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.contact.message} *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={language === 'en' ? 'Please provide detailed specifications, questions, or target budgets...' : 'يرجى كتابة تفاصيل استفسارك أو ميزانيتك المقترحة...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <Button type="submit" isLoading={loading} className="w-full font-bold">
                <Send className="w-4 h-4" />
                <span>{t.cta.sendMessage}</span>
              </Button>
            </form>
          )}
        </div>

        {/* Right Info: Direct Contact, Office Locations & Instant WhatsApp (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Contact Box */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800">
            <h3 className="text-xl font-bold font-display-serif text-white">
              {t.contact.officeLocations}
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">
                    {t.contact.headquarters}
                  </strong>
                  <span>
                    {language === 'en'
                      ? 'Prince Mutaib Road, Hajr Dist., Dammam, Eastern Province, Saudi Arabia'
                      : 'طريق الأمير متعب، حي هجر، الدمام، المنطقة الشرقية، المملكة العربية السعودية'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">
                    {t.contact.hours}
                  </strong>
                  <span>{t.contact.hoursValue}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">
                    {language === 'en' ? 'Direct Brokerage Line' : 'الخط المباشر للوساطة'}
                  </strong>
                  <a href="tel:+966556125711" dir="ltr" className="text-blue-300 hover:underline inline-block text-left">
                    <bdi dir="ltr">{t.contact.phoneValue}</bdi>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">
                    {language === 'en' ? 'Inquiries Desk' : 'البريد الإلكتروني'}
                  </strong>
                  <a href="mailto:info@hardgp.com" className="text-blue-300 hover:underline">
                    {t.contact.emailValue}
                  </a>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout Button */}
            <div className="pt-2 border-t border-slate-800">
              <a
                href="https://wa.me/966556125711?text=Hello%20HARD%20Real%20Estate,%20I%20would%20like%20to%20connect%20with%20a%20broker."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full"
              >
                <Button variant="whatsapp" size="lg" className="w-full justify-center">
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.cta.chatOnWhatsApp}</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
