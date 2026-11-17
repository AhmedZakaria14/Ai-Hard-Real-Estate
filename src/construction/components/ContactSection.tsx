import React, { useState } from 'react';
import { DEFAULT_CONSTRUCTION_HQ } from '../services/sectionDefaults';
import { useConstruction } from '../context/ConstructionContext';
import { submitCustomerForm } from '../../lib/forms/formSubmissionService';


export function ContactSection() {
  const { language, officeLocations } = useConstruction();
  const ar = language === 'ar';
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const office = officeLocations.find((entry) => entry.isHQ) ?? DEFAULT_CONSTRUCTION_HQ;
  const address = (ar ? office.addressAr : office.addressEn)?.trim()
    || (ar ? DEFAULT_CONSTRUCTION_HQ.addressAr : DEFAULT_CONSTRUCTION_HQ.addressEn);
  const { lat, lng } = office;
  const pinned = Number.isFinite(lat) && Number.isFinite(lng)
    && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat !== 0 || lng !== 0);
  const mapQuery = encodeURIComponent(pinned ? lat + ',' + lng : address);
  const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2';
  const labels = ar
    ? { name: 'الاسم', email: 'البريد الإلكتروني', phone: 'رقم الهاتف', message: 'الرسالة' }
    : { name: 'Name', email: 'Email', phone: 'Phone', message: 'Message' };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: keyof typeof labels) => String(data.get(key) ?? '').trim();
    if (!value('name') || !value('message')) {
      setNotice(ar ? 'يرجى إدخال الاسم والرسالة.' : 'Enter your name and a message.');
      return;
    }
    setPending(true);
    setNotice('');
    try {
      const result = await submitCustomerForm({
        formType: 'general_contact',
        sector: 'construction',
        name: value('name'),
        email: value('email'),
        phone: value('phone'),
        language,
        message: value('message'),
        details: {},
      });
      form.reset();
      setNotice((ar ? 'تم استلام رسالتك. الرقم المرجعي ' : 'Message received. Reference ') + result.trackingCode);
    } catch {
      setNotice(ar ? 'تعذر إرسال الرسالة. حاول مرة أخرى وتأكد من بياناتك.' : 'Could not send your message. Check your details and try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 bg-slate-50 px-4 py-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">{ar ? office.nameAr : office.nameEn}</h2>
          <p>{address}</p>
          <p><a href="tel:+966556125711" dir="ltr">+966 55 612 5711</a></p>
          <p><a href="mailto:info@hardgp.com">info@hardgp.com</a></p>
          <iframe title={ar ? 'خريطة المقر الرئيسي' : 'Head office map'} src={'https://maps.google.com/maps?q=' + mapQuery + '&output=embed'} className="h-64 w-full rounded-xl border-0" loading="lazy" />
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">{ar ? 'اتصل بنا' : 'Contact us'}</h2>
          <label className="block">{labels.name}<input name="name" autoComplete="name" required maxLength={150} className={fieldClass} /></label>
          <label className="block">{labels.email}<input type="email" name="email" autoComplete="email" required maxLength={254} className={fieldClass} /></label>
          <label className="block">{labels.phone}<input type="tel" name="phone" autoComplete="tel" required maxLength={30} className={fieldClass} /></label>
          <label className="block">{labels.message}<textarea name="message" required maxLength={5000} rows={5} className={fieldClass} /></label>
          <button type="submit" disabled={pending} className="rounded-lg bg-blue-700 px-5 py-2 text-white disabled:opacity-60">{pending ? (ar ? 'جارٍ الإرسال…' : 'Sending…') : (ar ? 'إرسال الرسالة' : 'Send message')}</button>
          <p role="status">{notice}</p>
        </form>
      </div>
    </section>
  );
}
