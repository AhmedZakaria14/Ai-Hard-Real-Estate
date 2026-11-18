import { LocalizedValue } from '../components/ui/LocalizedValue';
import { useCustomerFormConfig, ConfiguredFormFields } from '../components/forms/ConfiguredFormFields';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { InterfaceText } from '../components/ui/InterfaceText';
import { ManagedInput, ManagedTextarea } from '../components/ui/ManagedElements';
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
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useTextOverride } from '../context/TextOverrideContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { submitCustomerForm } from '../lib/forms/formSubmissionService';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export function ContactPage({ onNavigate, language }: ContactPageProps) {
  const formConfig = useCustomerFormConfig('general_contact');

  const { translations } = useTextOverride();
  const { getEffectiveSettings } = useSiteSettings();
  const brand = getEffectiveSettings('realestate');
  const t = translations[language];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leadRef, setLeadRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [contactError, setContactError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'name' | 'email' | 'phone' | 'type' | 'message', string>>>({});
  const ar = language === 'ar';
  const requiredMark = <span className="text-red-600" aria-hidden="true"> *</span>;
  const fieldError = (field: keyof typeof fieldErrors) => fieldErrors[field] &&
    <p role="alert" id={`contact-error-${field}`} className="mt-1 text-xs font-medium text-red-700"><LocalizedValue value={fieldErrors[field]} /></p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');

    const normalizedPhone = phone.trim().replace(/[٠-٩۰-۹]/g, (digit) => String(digit.charCodeAt(0) % 16));
    const errors: typeof fieldErrors = {};
    if (fullName.trim().length < 2) errors.name = ar ? 'أدخل الاسم بالكامل.' : 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = ar ? 'أدخل بريدًا إلكترونيًا صحيحًا.' : 'Enter a valid email address.';
    if (!/^\+?[0-9][0-9 ().-]*$/.test(normalizedPhone) || !/^\d{7,15}$/.test(normalizedPhone.replace(/\D/g, ''))) {
      errors.phone = ar ? 'أدخل رقم هاتف صحيحًا دون حروف.' : 'Enter a valid phone number without letters.';
    }
    if (!inquiryType) errors.type = ar ? 'اختر نوع الاستفسار.' : 'Choose an inquiry type.';
    if (!message.trim()) errors.message = ar ? 'اكتب تفاصيل رسالتك.' : 'Enter your message.';
    setFieldErrors(errors);
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      e.currentTarget.querySelector<HTMLElement>(`[data-field="${firstError}"]`)?.focus();
      return;
    }

    const typeLabels: Record<string, { en: string; ar: string }> = {
      buying: { en: 'Property Acquisition Inquiry', ar: 'استفسار عن شراء عقار' },
      renting: { en: 'Property Rental Inquiry', ar: 'استفسار عن استئجار عقار' },
      listing: { en: 'Listing / Selling Inquiry', ar: 'استفسار عن بيع وإدراج عقار' },
      investment: { en: 'Investment Advisory Inquiry', ar: 'استشارة استثمارية' },
      consultation: { en: 'General Consultation Inquiry', ar: 'استشارة عقارية عامة' },
    };

    const derivedSubject = subject.trim()
      ? subject.trim()
      : typeLabels[inquiryType]?.[language] || (language === 'en' ? 'General Inquiry' : 'استفسار عام');

    setLoading(true);
    try {
      const result = await formConfig.submit({
        formType: 'general_contact',
        sector: 'realestate',
        name: fullName.trim(),
        email: email.trim(),
        phone: normalizedPhone,
        language,
        message: `Inquiry Type: ${inquiryType}\nSubject: ${derivedSubject}\n\n${message.trim()}`,
        details: {
          inquiryType,
          subject: derivedSubject,
          recipientEmail: brand.contactEmail,
        },
      });
      setLeadRef(result.trackingCode);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Contact form submission failed', err);
      setContactError(
        err?.message || (language === 'en'
          ? 'Failed to send message. Your entered details are preserved. Please retry.'
          : 'تعذر إرسال الرسالة. تم حفظ بياناتك المدخلة، يرجى إعادة المحاولة.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setInquiryType('');
    setSubject('');
    setMessage('');
    setFieldErrors({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
          <LocalizedValue value={t.contact.pageTitle} />
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          <LocalizedValue value={t.contact.pageSubtitle} />
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Direct Message & Lead Capture (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-900 font-display-serif">
            <LocalizedValue value={t.contact.formTitle} />
          </h2>

          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display-serif">
                {language === 'en' ? <InterfaceText id="realestate.ContactPage.k1bc5as3" source="Message Sent Successfully" /> : <InterfaceText id="realestate.ContactPage.k1nvqm1y" source="تم إرسال رسالتك بنجاح" />}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                <LocalizedValue value={t.contact.submitSuccess} />
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-start text-xs space-y-1.5 max-w-md mx-auto text-slate-600">
                <p><strong>{language === 'en' ? <InterfaceText id="realestate.ContactPage.kgm598f" source="Inquiry Reference:" /> : <InterfaceText id="realestate.ContactPage.k1lt3bxh" source="رقم المرجع:" />}</strong> <span className="font-mono font-bold text-slate-900"><LocalizedValue value={leadRef} /></span></p>
              </div>
              <div className="pt-2">
                <Button variant="secondary" onClick={handleReset}>
                  {language === 'en' ? <InterfaceText id="realestate.ContactPage.kg6x98j" source="Send Another Message" /> : <InterfaceText id="realestate.ContactPage.klqpd1k" source="إرسال رسالة أخرى" />}
                </Button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <ConfiguredFormFields form={formConfig} language={language} />
              <div>
                <label htmlFor="contact-page-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
                  <LocalizedValue value={t.contact.fullName} /><LocalizedValue value={requiredMark} />
                </label>
                <ManagedInput copyScope="realestate.ContactPage"
                  id="contact-page-fullname" data-field="name" aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? 'contact-error-name' : undefined}
                  type="text"
                  required
                  aria-required="true"
                  placeholder={language === 'en' ? 'e.g. John Doe' : 'مثال: عبد الله السعيد'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                  <LocalizedValue value={fieldError('name')} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-page-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    <LocalizedValue value={t.contact.email} /><LocalizedValue value={requiredMark} />
                  </label>
                  <ManagedInput copyScope="realestate.ContactPage"
                    id="contact-page-email" data-field="email" aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'contact-error-email' : undefined}
                    type="email"
                    required
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                    autoComplete="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (contactError) setContactError('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <LocalizedValue value={fieldError('email')} />
                </div>
                <div>
                  <label htmlFor="contact-page-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                    <LocalizedValue value={t.contact.phone} /><LocalizedValue value={requiredMark} />
                  </label>
                  <ManagedInput copyScope="realestate.ContactPage"
                    id="contact-page-phone" data-field="phone" aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={fieldErrors.phone ? 'contact-error-phone' : undefined}
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="+966 50 000 0000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (contactError) setContactError('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <LocalizedValue value={fieldError('phone')} />
                </div>
              </div>

              {contactError && (
                <p role="alert" className="text-xs text-rose-600 font-medium"><LocalizedValue value={contactError} /></p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-page-inquiry-type" className="block text-xs font-semibold text-slate-700 mb-1">
                    <LocalizedValue value={t.contact.inquiryType} /><LocalizedValue value={requiredMark} />
                  </label>
                  <SearchableSelect
                    id="contact-page-inquiry-type" data-field="type" aria-invalid={Boolean(fieldErrors.type)}
                    aria-describedby={fieldErrors.type ? 'contact-error-type' : undefined}
                    required
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>{language === 'en' ? 'Choose' : 'اختر'}</option>
                    <option value="buying">{language === 'en' ? 'Property Acquisition' : 'شراء عقار'}</option>
                    <option value="renting">{language === 'en' ? 'Property Rental' : 'استئجار عقار'}</option>
                    <option value="listing">{language === 'en' ? 'Listing / Selling' : 'إدراج / بيع عقار'}</option>
                    <option value="investment">{language === 'en' ? 'Investment Advisory' : 'استشارات استثمارية'}</option>
                    <option value="consultation">{language === 'en' ? 'General Consultation' : 'استشارة عامة'}</option>
                  </SearchableSelect>
                  <LocalizedValue value={fieldError('type')} />
                </div>
                <div>
                  <label htmlFor="contact-page-subject" className="block text-xs font-semibold text-slate-700 mb-1">
                    <LocalizedValue value={t.contact.subject} />
                  </label>
                  <ManagedInput copyScope="realestate.ContactPage"
                    id="contact-page-subject"
                    type="text"
                    placeholder={ar ? 'موضوع الرسالة' : 'Message subject'}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-page-message" className="block text-xs font-semibold text-slate-700 mb-1">
                  {ar ? <InterfaceText id="realestate.ContactPage.kcstyf2" source="تفاصيل رسالتك" /> : <InterfaceText id="realestate.ContactPage.k1s9xzyi" source="Message details" />}<LocalizedValue value={requiredMark} />
                </label>
                <ManagedTextarea copyScope="realestate.ContactPage"
                  id="contact-page-message" data-field="message" aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={fieldErrors.message ? 'contact-error-message' : undefined}
                  required
                  rows={4}
                  placeholder={language === 'en' ? 'Please provide detailed specifications, questions, or target budgets...' : 'يرجى كتابة تفاصيل استفسارك أو ميزانيتك المقترحة...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
                  <LocalizedValue value={fieldError('message')} />
              </div>

              <Button type="submit" isLoading={loading} className="w-full font-bold">
                <Send className="w-4 h-4" />
                <span><LocalizedValue value={t.cta.sendMessage} /></span>
              </Button>
            </form>
          )}
        </div>

        {/* Right Info: Direct Contact, Office Locations & Instant WhatsApp (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Contact Box */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800">
            <h3 className="text-xl font-bold font-display-serif text-white">
              <LocalizedValue value={t.contact.officeLocations} />
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">
                    <LocalizedValue value={t.contact.headquarters} />
                  </strong>
                  <span>
                    <LocalizedValue value={brand.office.address[language]} />
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">
                    <LocalizedValue value={t.contact.hours} />
                  </strong>
                  <span><LocalizedValue value={brand.workingHours[language]} /></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">
                    {language === 'en' ? <InterfaceText id="realestate.ContactPage.klm7mhy" source="Direct Line" /> : <InterfaceText id="realestate.ContactPage.k1x4d0td" source="الخط المباشر" />}
                  </strong>
                  <a href={'tel:' + brand.supportPhone.replace(/\s/g, '')} dir="ltr" className="text-blue-300 hover:underline inline-block text-left">
                    <bdi dir="ltr"><LocalizedValue value={brand.supportPhone} /></bdi>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">
                    {language === 'en' ? <InterfaceText id="realestate.ContactPage.k10yffnf" source="Inquiries Desk" /> : <InterfaceText id="realestate.ContactPage.kz14tgk" source="البريد الإلكتروني" />}
                  </strong>
                  <a href={'mailto:' + brand.contactEmail} className="text-blue-300 hover:underline">
                    <LocalizedValue value={brand.contactEmail} />
                  </a>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout Button */}
            <div className="pt-2 border-t border-slate-800">
              <Button
                href={'https://wa.me/' + brand.whatsappNumber.replace(/\D/g, '')}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
                size="lg"
                className="w-full justify-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span><LocalizedValue value={t.cta.chatOnWhatsApp} /></span>
              </Button>
            </div>
          </div>
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <h3 className="px-5 py-4 font-bold">{ar ? <InterfaceText id="realestate.ContactPage.k2q0va2" source="موقع المكتب على الخريطة" /> : <InterfaceText id="realestate.ContactPage.k12apozs" source="Office location on the map" />}</h3>
            <iframe title={ar ? 'خريطة مقر هارد للعقارات في حي هجر بالدمام' : 'Map of HARD Real Estate office, Hajr, Dammam'}
              className="h-60 w-full border-0 sm:h-64" loading="lazy" allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(brand.office.address[language])}&hl=${language}&z=15&output=embed`} />
          </section>
        </div>
      </div>
    </div>
  );
}
