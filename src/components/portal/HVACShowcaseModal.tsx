import { LocalizedValue } from '../ui/LocalizedValue';
import { SearchableSelect } from '../ui/SearchableSelect';
import { InterfaceText } from '../ui/InterfaceText';
import { ManagedImg, ManagedInput, ManagedTextarea } from '../ui/ManagedElements';
import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileText,
  ThermometerSnowflake,
} from 'lucide-react';
import { Language } from '../../types';

interface HVACShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function HVACShowcaseModal({
  isOpen,
  onClose,
  language,
}: HVACShowcaseModalProps) {
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceType: 'amc',
    systemType: 'chiller',
    location: 'Al Khobar',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const services = [
    {
      title: isAr ? 'عقود الصيانة الوقائية والسنوية (AMC)' : 'Preventative & Annual Maintenance Contracts',
      desc: isAr
        ? 'برامج فحص دورية شاملة للشيلرات، وحدات مناولة الهواء (AHU)، وأنظمة التبريد المركزي لتقليل الأعطال وتمديد عمر المعدات.'
        : 'Scheduled preventative health-checks for chillers, AHUs, and central DX units optimizing efficiency and eliminating downtime.',
    },
    {
      title: isAr ? 'صيانة وإصلاح منظومات VRF و الشيلرات' : 'VRF & Central Chiller Overhaul & Repairs',
      desc: isAr
        ? 'تشخيص إلكتروني فوري للأعطال، شحن وتفريغ غاز الفريون المعتمد، استبدال الضواغط، ومعايرة لوحات التحكم الذكية.'
        : 'Certified multi-split VRF diagnostics, compressor overhauls, refrigerant recovery, and smart BMS integration.',
    },
    {
      title: isAr ? 'طوارئ واستجابة سريعة 24/7' : '24/7 Rapid Emergency Response',
      desc: isAr
        ? 'فرق صيانة متنقلة ومجهزة بأحدث أدوات الفحص جاهزة للتدخل السريع خلال 60 دقيقة في الأبراج والمرافق الحيوية.'
        : 'Dedicated on-call technical squads deployed in fully-equipped mobile units reaching critical facilities within 60 minutes.',
    },
    {
      title: isAr ? 'تنظيف وتعقيم مجاري الهواء وجودة الهواء الداخلي (IAQ)' : 'Duct Cleaning & Indoor Air Quality (IAQ)',
      desc: isAr
        ? 'تنظيف وتعقيم الدكت بأحدث الروبوتات وفلاتر HEPA لضمان هواء نقي صحي مطابق لمعايير ASHRAE العالمية.'
        : 'Robotic duct cleaning, UV-C germicidal disinfection, and HEPA particulate filtration conforming to strict ASHRAE standards.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-hidden bg-slate-900/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200 [padding-top:env(safe-area-inset-top)] sm:[padding-top:1rem]">
      <div className="relative flex w-full min-w-0 max-w-4xl flex-col overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-xl max-h-[calc(100dvh-env(safe-area-inset-top))] sm:max-h-[calc(100dvh-2rem)] rounded-t-2xl sm:rounded-2xl my-0 sm:my-4">
        {/* Header Banner */}
        <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden">
          <ManagedImg copyScope="realestate.HVACShowcaseModal"
            src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80"
            alt="HARD HVAC Maintenance"
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 end-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-xs cursor-pointer shadow-md z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and Tagline */}
          <div className="absolute bottom-6 start-6 end-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 text-start">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wide">
                <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-400" />
                <span>{isAr ? <InterfaceText id="realestate.HVACShowcaseModal.k1y8q6lq" source="قطاع التكييف والخدمات الكهروميكانيكية" /> : <InterfaceText id="realestate.HVACShowcaseModal.k1y7qr6i" source="HVAC & Mechanical Maintenance Division" />}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display-serif text-white">
                {isAr ? <InterfaceText id="realestate.HVACShowcaseModal.kc0i0eo" source="هارد لصيانة وتشغيل أنظمة التكييف" /> : <InterfaceText id="realestate.HVACShowcaseModal.k16ov6ic" source="HARD HVAC Maintenance & Climate Services" />}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{isAr ? <InterfaceText id="realestate.HVACShowcaseModal.k1p5wy68" source="طوارئ 24/7" /> : <InterfaceText id="realestate.HVACShowcaseModal.k9lqa5a" source="24/7 Emergency Line" />}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:space-y-8 sm:p-8 sm:pb-8">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4 text-start">
              <h3 className="text-lg font-bold text-slate-900 font-display-serif">
                {isAr ? <InterfaceText id="realestate.HVACShowcaseModal.k186a814" source="حلول التبريد والتحكم بالمناخ الذكي" /> : <InterfaceText id="realestate.HVACShowcaseModal.kojz9ql" source="Engineered Climate Control & Operational Reliability" />}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isAr
                  ? <InterfaceText id="realestate.HVACShowcaseModal.k1pbz7o9" source="تقدم شركة هارد لحلول وصيانة التكييف أعلى معايير الصيانة الميكانيكية والهندسية لمنظومات التبريد المركزي والشيلرات ووحدات VRF في الأبراج السكنية والتجارية والمراكز اللوجستية. نضمن أقصى درجات كفاءة الطاقة وراحة المستخدمين على مدار الساعة مع تقليل تكاليف الاستهلاك." />
                  : <InterfaceText id="realestate.HVACShowcaseModal.k17kgcbi" source="HARD HVAC Maintenance delivers mission-critical heating, ventilation, and air conditioning engineering services across Saudi Arabia. From commercial chillers and VRF systems to comprehensive Annual Maintenance Contracts, we safeguard your building climate with certified technicians and proactive telemetry." />}
              </p>

              {/* Capabilities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {services.map((svc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-sky-600">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <h4 className="text-xs font-bold text-slate-900"><LocalizedValue value={svc.title} /></h4>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal"><LocalizedValue value={svc.desc} /></p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-start">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isAr ? <InterfaceText id="realestate.HVACShowcaseModal.k13pg0vt" source="مؤشرات كفاءة الصيانة" /> : <InterfaceText id="realestate.HVACShowcaseModal.k1dy70fu" source="Operational Service SLA" />}
                </h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 font-display-serif"><LocalizedValue value="99.8%" /></div>
                    <div className="text-[11px] text-slate-500">{isAr ? <InterfaceText id="realestate.HVACShowcaseModal.kgs9hj7" source="جاهزية أنظمة التبريد المركزية" /> : <InterfaceText id="realestate.HVACShowcaseModal.kg0ixlv" source="Cooling System Uptime" />}</div>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <div className="text-2xl font-bold text-sky-600 font-display-serif"><LocalizedValue value="500+" /></div>
                    <div className="text-[11px] text-slate-500">{isAr ? <InterfaceText id="realestate.HVACShowcaseModal.k89en8d" source="مرفق ومبنى تحت عقود الصيانة" /> : <InterfaceText id="realestate.HVACShowcaseModal.kiilq1u" source="Maintained Commercial Facilities" />}</div>
                  </div>
                </div>
              </div>

              {/* Direct Hotlines */}
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 space-y-2 text-xs text-start">
                <span className="font-bold text-sky-900 block">{isAr ? <InterfaceText id="realestate.HVACShowcaseModal.k1fqok6o" source="طوارئ وبلاغات التكييف السريعة:" /> : <InterfaceText id="realestate.HVACShowcaseModal.k26q7yw" source="24/7 HVAC Emergency Dispatch:" />}</span>
                <div className="flex items-center gap-2 text-slate-700 dir-ltr">
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <span><LocalizedValue value="+966 13 800 4274" /></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dir-ltr">
                  <Mail className="w-3.5 h-3.5 text-sky-600" />
                  <span>hvac@hard.sa</span>
                </div>
              </div>
            </div>
          </div>

          {/* AMC Request Form */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>{isAr ? <InterfaceText id="realestate.HVACShowcaseModal.k95nu59" source="طلب عرض سعر صيانة أو معاينة موقع" /> : <InterfaceText id="realestate.HVACShowcaseModal.k11xdzix" source="Request Maintenance Quote or Site Survey" />}</span>
              </h3>
              <span className="text-xs text-slate-500">{isAr ? <InterfaceText id="realestate.HVACShowcaseModal.kz5erzd" source="فحص مجاني للمنشآت الكبرى" /> : <InterfaceText id="realestate.HVACShowcaseModal.k1hhd93p" source="Complimentary Assessment" />}</span>
            </div>

            {submitted ? (
              <div className="p-6 rounded-xl bg-sky-50 border border-sky-200 text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-sky-600 mx-auto" />
                <h4 className="text-sm font-bold text-sky-900">
                  {isAr ? <InterfaceText id="realestate.HVACShowcaseModal.k1x8kf0k" source="تم استلام طلب صيانة التكييف بنجاح!" /> : <InterfaceText id="realestate.HVACShowcaseModal.k1czymzz" source="HVAC Service Request Dispatched!" />}
                </h4>
                <p className="text-xs text-slate-600">
                  {isAr
                    ? <InterfaceText id="realestate.HVACShowcaseModal.k1x2q4rv" source="سيقوم كبير مهندسي التكييف والتبريد بالتواصل معك لترتيب الزيارة الفنية أو إرسال تفاصيل عقد الصيانة." />
                    : <InterfaceText id="realestate.HVACShowcaseModal.ktma2z2" source="Our senior HVAC engineer will contact you shortly to schedule an on-site inspection or provide a tailored AMC proposal." />}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 text-start">
                      {isAr ? <InterfaceText id="realestate.HVACShowcaseModal.k1tpp47z" source="اسم العميل / المبنى" /> : <InterfaceText id="realestate.HVACShowcaseModal.kncexhv" source="Client / Facility Name" />} <span className="text-red-600">*</span>
                    </label>
                    <ManagedInput copyScope="realestate.HVACShowcaseModal"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={isAr ? 'الاسم الكريم أو اسم البرج' : 'e.g. Al-Rawdah Plaza'}
                      className="w-full min-w-0 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base sm:text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 text-start">
                      {isAr ? <InterfaceText id="realestate.HVACShowcaseModal.khf873v" source="رقم الجوال" /> : <InterfaceText id="realestate.HVACShowcaseModal.k1v8ev2w" source="Phone Number" />} <span className="text-red-600">*</span>
                    </label>
                    <ManagedInput copyScope="realestate.HVACShowcaseModal"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+966 5x xxx xxxx"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none dir-ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 text-start">
                      {isAr ? <InterfaceText id="realestate.HVACShowcaseModal.kyhfsl4" source="نوع الخدمة المطلوبة" /> : <InterfaceText id="realestate.HVACShowcaseModal.k1opxcko" source="Requested Service" />}
                    </label>
                    <SearchableSelect
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    >
                      <option value="amc">{isAr ? 'عقد صيانة دورية سنوية (AMC)' : 'Annual Maintenance Contract (AMC)'}</option>
                      <option value="emergency">{isAr ? 'إصلاح عطل طارئ فوري' : 'Immediate Emergency Repair'}</option>
                      <option value="duct">{isAr ? 'تنظيف وتعقيم مجاري الهواء (Duct)' : 'Air Duct Cleaning & Sanitation'}</option>
                      <option value="installation">{isAr ? 'توريد وتركيب نظام تكييف جديد' : 'New HVAC System Installation'}</option>
                    </SearchableSelect>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 text-start">
                    {isAr ? <InterfaceText id="realestate.HVACShowcaseModal.ksr8ykl" source="تفاصيل المنظومة أو الأعطال الملاحظة" /> : <InterfaceText id="realestate.HVACShowcaseModal.k1fc2zjb" source="System Details / Issues Observed" />}
                  </label>
                  <ManagedTextarea copyScope="realestate.HVACShowcaseModal"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={isAr ? 'نوع المكيفات (شيلر، كونسيلد، باكج)، عدد الوحدات، الموقع...' : 'Unit types (Chillers, Concealed, Package), capacity (TR), location...'}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {isAr ? <InterfaceText id="realestate.HVACShowcaseModal.kysudiz" source="إغلاق" /> : <InterfaceText id="realestate.HVACShowcaseModal.k1l0xxoj" source="Close" />}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <span>{isAr ? <InterfaceText id="realestate.HVACShowcaseModal.k1p5bqan" source="إرسال طلب فحص وصيانة التكييف" /> : <InterfaceText id="realestate.HVACShowcaseModal.ki3e4c0" source="Submit Service Dispatch" />}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
