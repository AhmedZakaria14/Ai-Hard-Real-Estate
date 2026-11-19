import { LocalizedValue } from '../ui/LocalizedValue';
import { useCustomerFormConfig, ConfiguredFormFields } from './ConfiguredFormFields';
import { SearchableSelect } from '../ui/SearchableSelect';
import { InterfaceText } from '../ui/InterfaceText';
import { ManagedInput, ManagedTextarea } from '../ui/ManagedElements';
import React, { useState } from 'react';
import {
  Building2,
  KeyRound,
  MapPin,
  Bed,
  Bath,
  Maximize,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  User,
  ShieldCheck,
  FileText,
  MessageSquare,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Language, PropertyType } from '../../types';
import { FormAttachmentMeta } from '../../types/backend-schema';
import { useTextOverride } from '../../context/TextOverrideContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { submitCustomerForm, FormValidationError } from '../../lib/forms/formSubmissionService';
import { FileUploadZone } from './FileUploadZone';
import { SAUDI_CITIES } from '../../data/cities';
import { CitySearchDropdown } from '../ui/CitySearchDropdown';
import { usePropertyTypes } from '../../lib/usePropertyTypes';
import { propertyTypeIcons } from '../../lib/propertyTaxonomy';

interface ValuationWizardProps {
  language: Language;
  onSuccess?: () => void;
  isModal?: boolean;
}

export function ValuationWizard({ language, onSuccess, isModal = false }: ValuationWizardProps) {
  const formConfig = useCustomerFormConfig('valuation_request');

  const { translations } = useTextOverride();
  const t = translations[language];
  const isAr = language === 'ar';
  const ArrowNext = isAr ? ArrowLeft : ArrowRight;
  const ArrowPrev = isAr ? ArrowRight : ArrowLeft;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Step 1: Property Location & Architecture
  const activePropertyTypes = usePropertyTypes().filter(({ active }) => active);
  const [selectedPropertyType, setPropertyType] = useState<PropertyType>('villa');
  const propertyType = activePropertyTypes.find(({ id }) => id === selectedPropertyType)?.id
    ?? activePropertyTypes[0].id;
  const [cityArea, setCityArea] = useState('Al Khobar Corniche');
  const [customAddress, setCustomAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('4');
  const [bathrooms, setBathrooms] = useState('5');
  const [areaSqFt, setAreaSqFt] = useState('5500');

  // Step 2: Property Condition & Features
  const [condition, setCondition] = useState<'new' | 'luxury' | 'good' | 'renovation'>('luxury');
  const [furnishing, setFurnishing] = useState<'furnished' | 'semi' | 'unfurnished'>('furnished');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'pool',
    'seaView',
    'smartHome',
  ]);

  // Step 3: Owner Goals & Timeline
  const [ownerRole, setOwnerRole] = useState<'owner' | 'investor' | 'developer' | 'broker'>('owner');
  const [goal, setGoal] = useState<'sell' | 'rent' | 'valuation'>('sell');
  const [timeline, setTimeline] = useState<'immediate' | '1-3months' | '3-6months' | 'exploring'>('immediate');
  const [expectedPrice, setExpectedPrice] = useState('');

  // Step 4: Contact & Marketing Deliverable
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'call' | 'email'>('whatsapp');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<FormAttachmentMeta[]>([]);

  // State & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  // Dynamic Valuation Estimation Formula based on input parameters (Calculated directly in SAR)
  const calculatedEstimate = React.useMemo(() => {
    let baseRatePerSqFt = 3500; // SAR
    if (cityArea.includes('Khobar') || cityArea.includes('الخبر')) baseRatePerSqFt = 4200;
    else if (cityArea.includes('Dhahran') || cityArea.includes('الظهران')) baseRatePerSqFt = 4500;
    else if (cityArea.includes('Dammam') || cityArea.includes('الدمام')) baseRatePerSqFt = 3600;
    else if (cityArea.includes('Half Moon') || cityArea.includes('نصف القمر')) baseRatePerSqFt = 4800;

    let conditionMultiplier = 1.0;
    if (condition === 'new') conditionMultiplier = 1.25;
    if (condition === 'luxury') conditionMultiplier = 1.35;
    if (condition === 'good') conditionMultiplier = 1.05;
    if (condition === 'renovation') conditionMultiplier = 0.85;

    const areaNum = Number(areaSqFt) || 3000;
    const estValSar = Math.round(areaNum * baseRatePerSqFt * conditionMultiplier);

    const minSar = Math.round(estValSar * 0.95);
    const maxSar = Math.round(estValSar * 1.08);

    return { minSar, maxSar };
  }, [cityArea, areaSqFt, condition, propertyType]);

  const toggleFeature = (featureKey: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureKey) ? prev.filter((f) => f !== featureKey) : [...prev, featureKey]
    );
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!cityArea.trim() && !customAddress.trim()) {
        newErrors.location = isAr
          ? 'يرجى إدخال اسم المنطقة أو العنوان'
          : 'Please provide location or neighborhood';
      }
      if (!areaSqFt || Number(areaSqFt) <= 0) {
        newErrors.area = isAr ? 'يرجى إدخال المساحة التقريبية' : 'Please enter built-up area';
      }
    }

    if (step === 4) {
      if (!fullName.trim() || fullName.trim().length < 3) {
        newErrors.fullName = isAr
          ? 'الاسم الكامل مطلوب (3 أحرف على الأقل)'
          : 'Full Name is required (min 3 characters)';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        newErrors.email = isAr
          ? 'يرجى إدخال بريد إلكتروني صالح'
          : 'Please enter a valid email address';
      }
      const phoneDigits = phone.replace(/\D/g, '');
      if (!phone.trim() || phoneDigits.length < 8) {
        newErrors.phone = isAr
          ? 'يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل)'
          : 'Please enter a valid phone number (min 8 digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const result = await formConfig.submit({
        formType: 'valuation_request',
        sector: 'realestate',
        name: fullName,
        email,
        phone,
        preferredContactMethod: preferredContact === 'call' ? 'phone' : preferredContact,
        language,
        message: `Property Type: ${propertyType}\nLocation: ${cityArea} ${customAddress}\nArea: ${areaSqFt} sq ft (${bedrooms} beds, ${bathrooms} baths)\nCondition: ${condition}\nTimeline: ${timeline}\nOwner Role: ${ownerRole}\nContact Method: ${preferredContact}\nNotes: ${notes}`,
        attachments,
        details: {
          propertyType,
          cityArea,
          customAddress,
          bedrooms,
          bathrooms,
          areaSqFt: Number(areaSqFt) || 0,
          condition,
          selectedFeatures,
          ownerRole,
          timeline,
          preferredContact,
          estimatedValueSAR: calculatedEstimate.minSar,
        },
      });

      setReferenceId(result.trackingCode);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Failed to submit valuation lead', err);
      if (err instanceof FormValidationError) {
        setErrors(err.fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setIsSuccess(false);
    setErrors({});
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
  };

  const featuresList = [
    { id: 'pool', label: isAr ? 'مسبح خاص' : 'Private Swimming Pool' },
    { id: 'seaView', label: isAr ? 'إطلالة بحرية / مارينا' : 'Sea / Marina View' },
    { id: 'highFloor', label: isAr ? 'طابق مرتفع / بانورامي' : 'High Floor / Skyline View' },
    { id: 'garden', label: isAr ? 'حديقة خاصة منسقة' : 'Landscaped Garden' },
    { id: 'maidRoom', label: isAr ? 'غرفة خادمة / سائق' : "Maid's / Driver Room" },
    { id: 'smartHome', label: isAr ? 'أنظمة المنزل الذكي' : 'Smart Home Automation' },
    { id: 'cornerPlot', label: isAr ? 'موقع مميز / زاوية' : 'Prime Corner Plot' },
    { id: 'upgradedKitchen', label: isAr ? 'مطبخ إيطالي مجهز' : 'Custom Chef Kitchen' },
  ];

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden ${isModal ? 'p-0' : 'p-6 sm:p-10'}`}>
      {/* Wizard Header */}
      <div className="space-y-4 border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between">
          <Badge variant="primary">
            {isAr ? <InterfaceText id="realestate.ValuationWizard.k1duforp" source="حاسبة التقييم العقاري التقريبي" /> : <InterfaceText id="realestate.ValuationWizard.kqn4t9f" source="Indicative Property Valuation" />}
          </Badge>
          <span className="text-xs font-semibold text-slate-500">
            <LocalizedValue value={isAr ? `الخطوة ${currentStep} من ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`} />
          </span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display-serif">
            {isAr ? <InterfaceText id="realestate.ValuationWizard.kq4euq9" source="تقييم عقاري فوري وخطة تسويق شاملة" /> : <InterfaceText id="realestate.ValuationWizard.k1mcqzw" source="Complimentary Property Valuation & CMA" />}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {isAr
              ? <InterfaceText id="realestate.ValuationWizard.kcaav0o" source="أدخل مواصفات عقارك للحصول على تقدير أولي وإرسال طلب متابعة." />
              : <InterfaceText id="realestate.ValuationWizard.k4v5y4b" source="Provide your property specifications for an instant algorithmic benchmark and a tailored brokerage listing proposal." />}
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-y-1 text-[11px] font-medium text-slate-500 sm:grid-cols-4">
            <span className={currentStep >= 1 ? 'text-blue-600 font-bold' : ''}>
              {isAr ? <InterfaceText id="realestate.ValuationWizard.ku38cdq" source="1. المواصفات" /> : <InterfaceText id="realestate.ValuationWizard.k1w6axe5" source="1. Architecture" />}
            </span>
            <span className={`text-center ${currentStep >= 2 ? 'text-blue-600 font-bold' : ''}`}>
              {isAr ? <InterfaceText id="realestate.ValuationWizard.k1czyxpj" source="2. الحالة والمزايا" /> : <InterfaceText id="realestate.ValuationWizard.kbzkxt8" source="2. Features" />}
            </span>
            <span className={`text-center ${currentStep >= 3 ? 'text-blue-600 font-bold' : ''}`}>
              {isAr ? <InterfaceText id="realestate.ValuationWizard.k16xlyd6" source="3. الأهداف" /> : <InterfaceText id="realestate.ValuationWizard.k1v1m6y4" source="3. Goals" />}
            </span>
            <span className={`text-end ${currentStep >= 4 ? 'text-blue-600 font-bold' : ''}`}>
              {isAr ? <InterfaceText id="realestate.ValuationWizard.k1y92bcb" source="4. التقرير والتواصل" /> : <InterfaceText id="realestate.ValuationWizard.kv98p1f" source="4. Lead Report" />}
            </span>
          </div>
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="py-6">
        {isSuccess ? (
          /* Animated Success Banner & Summary */
          <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/60 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <LocalizedValue value={referenceId} />
              </Badge>
              <h3 className="text-2xl font-extrabold text-slate-900 font-display-serif">
                {isAr ? <InterfaceText id="realestate.ValuationWizard.k1czfmx0" source="تم استلام طلب التقييم بنجاح!" /> : <InterfaceText id="realestate.ValuationWizard.kb0192v" source="Valuation Request Received!" />}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <LocalizedValue value={isAr
                  ? `شكراً لك ${fullName}! قام فريق الاستشارات بإعداد تقرير التقييم المقارن (CMA) المكون من 12 صفحة، وسيتم إرساله إليك عبر ${preferredContact === 'whatsapp' ? 'واتساب' : preferredContact === 'call' ? 'اتصال هاتفي' : 'البريد الإلكتروني'}.`
                  : `Thank you, ${fullName}! A dedicated Senior Brokerage Director has been assigned to prepare your custom 12-page Comparative Market Analysis (CMA) report via ${preferredContact}.`} />
              </p>
            </div>

            {/* Preliminary Benchmark Highlight Card */}
            <div className="p-6 bg-slate-900 text-white rounded-3xl max-w-xl mx-auto text-start space-y-4 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.k1xtgbzp" source="المؤشر التقديري الأولي" /> : <InterfaceText id="realestate.ValuationWizard.ktldxob" source="Preliminary Valuation Benchmark" />}
                  </span>
                </div>
                <span className="text-xs text-blue-400 font-medium"><LocalizedValue value={cityArea} /></span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">{isAr ? <InterfaceText id="realestate.ValuationWizard.kwzvakm" source="النطاق التقديري بالريال السعودي" /> : <InterfaceText id="realestate.ValuationWizard.k1hgs3f8" source="SAR Benchmark Valuation Range" />}:</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-display-serif">
                  <LocalizedValue value={isAr
                    ? `${(calculatedEstimate.minSar / 1000000).toFixed(2)} - ${(calculatedEstimate.maxSar / 1000000).toFixed(2)} مليون ر.س`
                    : `${(calculatedEstimate.minSar / 1000000).toFixed(2)}M - ${(calculatedEstimate.maxSar / 1000000).toFixed(2)}M SAR`} />
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isAr
                    ? <InterfaceText id="realestate.ValuationWizard.k1bmqrx8" source="تقدير إرشادي يحسبه الموقع باستخدام معاملات ثابتة." />
                    : <InterfaceText id="realestate.ValuationWizard.k1bde7rx" source="This indicative estimate uses fixed assumptions." />}
                </span>
              </div>
            </div>

            {/* Quick Action CTA Suite */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                href={`https://wa.me/966556125711?text=${encodeURIComponent(
                  isAr
                    ? `مرحباً، أود متابعة تقرير تقييم عقاري في ${cityArea} (رقم المرجع: ${referenceId}).`
                    : `Hello HARD Real Estate, I would like to discuss my valuation for ${cityArea} (Ref: ${referenceId}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
                size="lg"
                className="w-full sm:w-auto justify-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAr ? <InterfaceText id="realestate.ValuationWizard.k1opqzr6" source="محادثة المدير عبر واتساب" /> : <InterfaceText id="realestate.ValuationWizard.k1e0tza8" source="Connect on WhatsApp" />}</span>
              </Button>

              <Button variant="outline" size="lg" onClick={handleReset} className="w-full sm:w-auto">
                <span>{isAr ? <InterfaceText id="realestate.ValuationWizard.k1ojpwcg" source="تقييم عقار آخر" /> : <InterfaceText id="realestate.ValuationWizard.k1rdomqa" source="Evaluate Another Property" />}</span>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <ConfiguredFormFields form={formConfig} language={language} />
            {/* STEP 1: Property Location & Architecture */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.kso47zf" source="الخطوة 1: الموقع ونوع العقار" /> : <InterfaceText id="realestate.ValuationWizard.k1auvybk" source="Step 1: Property Location & Type" />}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? <InterfaceText id="realestate.ValuationWizard.k1r4sw92" source="حدد موقع العقار ونوعه لحساب التقدير الأولي." />
                      : <InterfaceText id="realestate.ValuationWizard.k15mbux0" source="Specify the physical classification and prime community location." />}
                  </p>
                </div>

                {/* Property Type Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {activePropertyTypes.map((item) => {
                    const Icon = propertyTypeIcons.get(item.id) ?? Building2;
                    const isSelected = propertyType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPropertyType(item.id)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 text-blue-800 ring-2 ring-blue-500/20 font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-xs"><LocalizedValue value={isAr ? item.nameAr : item.nameEn} /></span>
                      </button>
                    );
                  })}
                </div>

                {/* Location Selection & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="valuation-city-search" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? <InterfaceText id="realestate.ValuationWizard.k18a6a7d" source="المدينة" /> : <InterfaceText id="realestate.ValuationWizard.k142k4ma" source="City" />} <span className="text-red-600">*</span>
                    </label>
                    <CitySearchDropdown
                      value={cityArea}
                      onChange={(city) => setCityArea(city === 'all' ? (isAr ? 'الرياض' : 'Riyadh') : city)}
                      language={language}
                      placeholder={isAr ? 'اختر أو ابحث عن المدينة' : 'Select or search city'}
                      showAllOption={false}
                      id="valuation-city-search"
                    />
                  </div>

                  <div>
                    <label htmlFor="val-custom-address" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? <InterfaceText id="realestate.ValuationWizard.k15i2lu8" source="اسم المبنى أو المجمع (اختياري)" /> : <InterfaceText id="realestate.ValuationWizard.kl1qp2" source="Building / Project / Sub-community" />}
                    </label>
                    <ManagedInput copyScope="realestate.ValuationWizard"
                      id="val-custom-address"
                      type="text"
                      placeholder={isAr ? 'مثال: برج أرماني، فيلا رقم 14' : 'e.g. Armani Residences, Villa 24'}
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Specs: Bedrooms, Bathrooms, Area */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="val-bedrooms" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? <InterfaceText id="realestate.ValuationWizard.k17xefci" source="عدد غرف النوم" /> : <InterfaceText id="realestate.ValuationWizard.kbw2lik" source="Bedrooms" />}
                    </label>
                    <SearchableSelect
                      id="val-bedrooms"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="1">1 {isAr ? 'غرفة' : 'Bed'}</option>
                      <option value="2">2 {isAr ? 'غرف' : 'Beds'}</option>
                      <option value="3">3 {isAr ? 'غرف' : 'Beds'}</option>
                      <option value="4">4 {isAr ? 'غرف' : 'Beds'}</option>
                      <option value="5">5 {isAr ? 'غرف' : 'Beds'}</option>
                      <option value="6+">6+ {isAr ? 'غرف فاخرة' : 'Beds Mansion'}</option>
                    </SearchableSelect>
                  </div>

                  <div>
                    <label htmlFor="val-bathrooms" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? <InterfaceText id="realestate.ValuationWizard.k1ae528u" source="دورات المياه" /> : <InterfaceText id="realestate.ValuationWizard.k1oorec0" source="Bathrooms" />}
                    </label>
                    <SearchableSelect
                      id="val-bathrooms"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6+">6+</option>
                    </SearchableSelect>
                  </div>

                  <div>
                    <label htmlFor="val-area-sqft" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? <InterfaceText id="realestate.ValuationWizard.kzgwypv" source="المساحة المبنية (قدم²)" /> : <InterfaceText id="realestate.ValuationWizard.k3g4j7l" source="Built Area (Sq Ft)" />} <span className="text-red-600">*</span>
                    </label>
                    <ManagedInput copyScope="realestate.ValuationWizard"
                      id="val-area-sqft"
                      type="number"
                      required
                      aria-required="true"
                      aria-invalid={Boolean(errors.area)}
                      aria-describedby={errors.area ? "val-area-sqft-error" : undefined}
                      placeholder="e.g. 5500"
                      value={areaSqFt}
                      onChange={(e) => setAreaSqFt(e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.area ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    {errors.area && <p id="val-area-sqft-error" className="text-[11px] text-rose-500 mt-1"><LocalizedValue value={errors.area} /></p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Condition & Key Features */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.k1k0ptgy" source="الخطوة 2: حالة العقار والمزايا التنافسية" /> : <InterfaceText id="realestate.ValuationWizard.klwrlto" source="Step 2: Property Condition & Features" />}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? <InterfaceText id="realestate.ValuationWizard.k1el7mvt" source="التشطيبات الراقية والإطلالات تزيد من القيمة السوقية بنسبة تصل إلى 35%." />
                      : <InterfaceText id="realestate.ValuationWizard.k1330gzo" source="Premium upgrades, designer furnishings, and panoramic views significantly enhance pricing power." />}
                  </p>
                </div>

                {/* Condition Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.k2y360e" source="الحالة الإنشائية والمعمارية" /> : <InterfaceText id="realestate.ValuationWizard.krqo54x" source="Architectural & Interior Condition" />}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'luxury',
                        label: isAr ? 'مجدد ومطور بتشطيبات فاخرة' : 'Fully Upgraded & Renovated',
                        desc: isAr ? 'رخام، أجهزة أوروبية، وتصميم داخلي فاخر' : 'Italian marble, custom cabinetry, bespoke lighting',
                      },
                      {
                        id: 'new',
                        label: isAr ? 'جديد كلياً / تسليم حديث' : 'Brand New / Turnkey Handover',
                        desc: isAr ? 'جاهز للاستلام الفوري من المطور' : 'Recently handed over from master developer',
                      },
                      {
                        id: 'good',
                        label: isAr ? 'بحالة ممتازة / قياسي' : 'Well Maintained / Standard',
                        desc: isAr ? 'حالة أصلية نظيفة مع صيانة دورية' : 'Clean original condition with regular maintenance',
                      },
                      {
                        id: 'renovation',
                        label: isAr ? 'يحتاج إلى تحديث' : 'Requires Modernization',
                        desc: isAr ? 'فرصة للمستثمرين لإعادة التجديد' : 'Value-add investment opportunity',
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCondition(item.id as any)}
                        className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                          condition === item.id
                            ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold"><LocalizedValue value={item.label} /></span>
                          {condition === item.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1"><LocalizedValue value={item.desc} /></p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Furnishing Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.kadusd0" source="حالة الأثاث والفرش" /> : <InterfaceText id="realestate.ValuationWizard.k1hctxny" source="Furnishing Status" />}
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {[
                      { id: 'furnished', label: isAr ? 'مفروش بالكامل (فاخر)' : 'Fully Furnished' },
                      { id: 'semi', label: isAr ? 'نصف مفروش (أجهزة مطبخ)' : 'Semi-Furnished' },
                      { id: 'unfurnished', label: isAr ? 'غير مفروش' : 'Unfurnished' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFurnishing(item.id as any)}
                        className={`py-2 px-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer text-center ${
                          furnishing === item.id
                            ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <LocalizedValue value={item.label} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Features Checkboxes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.kjusm6t" source="المزايا الإضافية الفريدة (اختر ما ينطبق)" /> : <InterfaceText id="realestate.ValuationWizard.k1ntf1lb" source="Unique Property Assets (Select all that apply)" />}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {featuresList.map((feat) => {
                      const isChecked = selectedFeatures.includes(feat.id);
                      return (
                        <button
                          key={feat.id}
                          type="button"
                          onClick={() => toggleFeature(feat.id)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-start transition-all cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span><LocalizedValue value={feat.label} /></span>
                          <span
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Owner Goals & Timeline */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.k6wtxd3" source="الخطوة 3: أهداف العرض والجدول الزمني" /> : <InterfaceText id="realestate.ValuationWizard.k1d6tk7c" source="Step 3: Owner Goals & Timeline" />}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? <InterfaceText id="realestate.ValuationWizard.kapma0a" source="حدد هدفك لمطابقة استراتيجيتنا التسويقية مع متطلباتك الاستثمارية." />
                      : <InterfaceText id="realestate.ValuationWizard.kwky3l0" source="Help us tailor the brokerage marketing launch to your financial goals." />}
                  </p>
                </div>

                {/* Owner Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.ko9lmpm" source="صفتك بالنسبة للعقار" /> : <InterfaceText id="realestate.ValuationWizard.k1rbofxe" source="Your Relationship to the Asset" />}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'owner', label: isAr ? 'مالك العقار' : 'Property Owner' },
                      { id: 'investor', label: isAr ? 'مستثمر / محفظة' : 'Investor' },
                      { id: 'developer', label: isAr ? 'مطور عقاري' : 'Developer' },
                      { id: 'broker', label: isAr ? 'وسيط شريك' : 'Co-Broker' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setOwnerRole(item.id as any)}
                        className={`p-2.5 rounded-2xl border text-xs font-medium text-center transition-all cursor-pointer ${
                          ownerRole === item.id
                            ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <LocalizedValue value={item.label} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Objective */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'sell',
                      label: isAr ? 'البيع بأعلى سعر سوقي' : 'Sell at Peak Valuation',
                      desc: isAr ? 'تسويق دولي وشبكة مشترين نقديين' : 'International campaigns & cash buyers',
                    },
                    {
                      id: 'rent',
                      label: isAr ? 'تأجير لعميل مميز' : 'Lease to Prime Tenant',
                      desc: isAr ? 'تدقيق ائتماني وعائد إيجاري مستقر' : 'Vetted corporate tenants & high yield',
                    },
                    {
                      id: 'valuation',
                      label: isAr ? 'تقييم رسمي فقط' : 'Market CMA Appraisal Only',
                      desc: isAr ? 'دراسة سوقية لتقييم المحفظة' : 'Portfolio equity benchmarking',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id as any)}
                      className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                        goal === item.id
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold"><LocalizedValue value={item.label} /></span>
                        {goal === item.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1"><LocalizedValue value={item.desc} /></p>
                    </button>
                  ))}
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.kzewizb" source="الجدول الزمني المستهدف للإتمام" /> : <InterfaceText id="realestate.ValuationWizard.k3ymge0" source="Desired Transaction Timeline" />}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'immediate', label: isAr ? 'فوري (خلال 30 يوماً)' : 'Within 30 Days' },
                      { id: '1-3months', label: isAr ? '1 - 3 أشهر' : '1 - 3 Months' },
                      { id: '3-6months', label: isAr ? '3 - 6 أشهر' : '3 - 6 Months' },
                      { id: 'exploring', label: isAr ? 'استكشاف السوق فقط' : 'Just Exploring' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTimeline(item.id as any)}
                        className={`p-2.5 rounded-2xl border text-xs font-medium text-center transition-all cursor-pointer ${
                          timeline === item.id
                            ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <LocalizedValue value={item.label} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Algorithm Estimate Preview */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">{isAr ? <InterfaceText id="realestate.ValuationWizard.k1w8l3lw" source="القيمة التقديرية الحالية" /> : <InterfaceText id="realestate.ValuationWizard.k1yzwlb1" source="Live Benchmark Calculation" />}</span>
                      <p className="text-base sm:text-lg font-bold font-display-serif text-blue-400">
                        <LocalizedValue value={isAr
                          ? `${(calculatedEstimate.minSar / 1000000).toFixed(2)} - ${(calculatedEstimate.maxSar / 1000000).toFixed(2)} مليون ر.س`
                          : `${(calculatedEstimate.minSar / 1000000).toFixed(2)}M - ${(calculatedEstimate.maxSar / 1000000).toFixed(2)}M SAR`} />
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 text-end">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.kj89l58" source="التقرير النهائي يتضمن دراسة 12 صفحة" /> : <InterfaceText id="realestate.ValuationWizard.k5bja3s" source="12-page comprehensive CMA dossier" />}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 4: Contact & Marketing Deliverable */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.ktvjrpe" source="الخطوة 4: بيانات التواصل واستلام التقرير" /> : <InterfaceText id="realestate.ValuationWizard.k1dmta87" source="Step 4: Contact & Report Delivery" />}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? <InterfaceText id="realestate.ValuationWizard.kgaa6d8" source="أين ترغب باستلام دراسة التقييم الشاملة وتقرير الصفقات المقارنة؟" />
                      : <InterfaceText id="realestate.ValuationWizard.kp440v8" source="Where should our senior marketing director deliver your full valuation package?" />}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="val-fullname" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? <InterfaceText id="realestate.ValuationWizard.k16duk29" source="الاسم الكامل" /> : <InterfaceText id="realestate.ValuationWizard.k4eocnj" source="Full Name" />} <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
                      <ManagedInput copyScope="realestate.ValuationWizard"
                        id="val-fullname"
                        type="text"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(errors.fullName)}
                        aria-describedby={errors.fullName ? "val-fullname-error" : undefined}
                        placeholder={isAr ? 'مثال: محمد السعيد' : 'e.g. Jonathan Sterling'}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full ps-10 pe-3 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.fullName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.fullName && <p id="val-fullname-error" className="text-[11px] text-rose-500 mt-1"><LocalizedValue value={errors.fullName} /></p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="val-email" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? <InterfaceText id="realestate.ValuationWizard.kz14tgk" source="البريد الإلكتروني" /> : <InterfaceText id="realestate.ValuationWizard.k1v4tmnn" source="Email Address" />} <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
                      <ManagedInput copyScope="realestate.ValuationWizard"
                        id="val-email"
                        type="email"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "val-email-error" : undefined}
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full ps-10 pe-3 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.email && <p id="val-email-error" className="text-[11px] text-rose-500 mt-1"><LocalizedValue value={errors.email} /></p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label htmlFor="val-phone" className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? <InterfaceText id="realestate.ValuationWizard.ky70fj7" source="رقم الهاتف / واتساب" /> : <InterfaceText id="realestate.ValuationWizard.k1mlkc6p" source="Phone / WhatsApp Number" />} <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
                      <ManagedInput copyScope="realestate.ValuationWizard"
                        id="val-phone"
                        type="tel"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? "val-phone-error" : undefined}
                        placeholder="+966 50 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full ps-10 pe-3 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.phone ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.phone && <p id="val-phone-error" className="text-[11px] text-rose-500 mt-1"><LocalizedValue value={errors.phone} /></p>}
                  </div>

                  {/* Preferred Delivery Channel */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isAr ? <InterfaceText id="realestate.ValuationWizard.k1y60d29" source="طريقة التواصل المفضلة" /> : <InterfaceText id="realestate.ValuationWizard.kff6mmz" source="Preferred Delivery Method" />}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'whatsapp', label: isAr ? 'واتساب' : 'WhatsApp' },
                        { id: 'call', label: isAr ? 'اتصال' : 'Phone Call' },
                        { id: 'email', label: isAr ? 'إيميل' : 'Email' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPreferredContact(item.id as any)}
                          className={`py-2.5 px-2 rounded-2xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                            preferredContact === item.id
                              ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-500'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <LocalizedValue value={item.label} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Private Attachment Upload (Photos, Deeds, Floor Plans) */}
                <FileUploadZone
                  uploadSessionId="valuation-wizard"
                  attachments={attachments}
                  onChange={setAttachments}
                  language={language}
                  labelEn="Attach Property Photos, Deeds or Floor Plans"
                  labelAr="إرفاق صور العقار، الصكوك أو المخططات المعمارية"
                  helpTextEn="Optional. Upload property images, floor plans, or deed copies for a more accurate CMA appraisal."
                  helpTextAr="اختياري. يمكنك رفع صور العقار، المخططات أو صورة الصك للحصول على تقييم أكثر دقة."
                />

                {/* Additional Notes */}
                <div>
                  <label htmlFor="val-notes" className="block text-xs font-bold text-slate-700 mb-1">
                    {isAr ? <InterfaceText id="realestate.ValuationWizard.kpd3b14" source="ملاحظات إضافية (أوقات المعاينة، تفاصيل المستأجر، إلخ)" /> : <InterfaceText id="realestate.ValuationWizard.k1n9kaes" source="Additional Notes / Special Instructions" />}
                  </label>
                  <ManagedTextarea copyScope="realestate.ValuationWizard"
                    id="val-notes"
                    rows={3}
                    placeholder={
                      isAr
                        ? 'يرجى كتابة أي معلومات إضافية تساعدنا في إعداد التقرير بأعلى دقة...'
                        : 'Provide details such as tenanted status, service charges, view angle...'
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  ></ManagedTextarea>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    {isAr
                      ? <InterfaceText id="realestate.ValuationWizard.k1i09lie" source="بياناتك محمية بالكامل ومعتمدة وفق اشتراطات الهيئة العامة للعقار (REGA)." />
                      : <InterfaceText id="realestate.ValuationWizard.k1mebx32" source="Your property data is strictly confidential and protected under REGA brokerage escrow standards." />}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation & Action Buttons Suite */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handlePrev}
                  className="font-semibold"
                >
                  <ArrowPrev className="w-4 h-4" />
                  <span>{isAr ? <InterfaceText id="realestate.ValuationWizard.k1gvdbv8" source="الخطوة السابقة" /> : <InterfaceText id="realestate.ValuationWizard.ku58l96" source="Previous Step" />}</span>
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  className="font-bold shadow-md"
                >
                  <span>{isAr ? <InterfaceText id="realestate.ValuationWizard.km2zsf" source="الخطوة التالية" /> : <InterfaceText id="realestate.ValuationWizard.k2hwfug" source="Continue to Next Step" />}</span>
                  <ArrowNext className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="font-bold shadow-lg"
                >
                  {isSubmitting ? (
                    <span>{isAr ? <InterfaceText id="realestate.ValuationWizard.kds13zr" source="جاري إصدار التقرير..." /> : <InterfaceText id="realestate.ValuationWizard.kz4kwpn" source="Generating Valuation Dossier..." />}</span>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{isAr ? <InterfaceText id="realestate.ValuationWizard.k1nw6w9g" source="إرسال طلب التقييم" /> : <InterfaceText id="realestate.ValuationWizard.k1tmc3yj" source="Submit Valuation Request" />}</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
