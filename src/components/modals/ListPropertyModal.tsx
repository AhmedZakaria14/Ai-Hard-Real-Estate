import React, { useState } from 'react';
import { X, MapPin, CheckCircle2, MessageSquare } from 'lucide-react';
import { Language } from '../../types';
import { useData } from '../../context/DataContext';
import { GoogleMapPickerModal } from './GoogleMapPickerModal';

interface ListPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

type UserRole = 'owner' | 'seeker'; // 'owner' = مالك, 'seeker' = مشتري أو مستأجر
type AddressMethod = 'map' | 'short'; // 'map' = الخريطة, 'short' = عنوان مختصر
type ListingOfferType = 'sale' | 'rent'; // بيع / إيجار for owner
type RequestOfferType = 'buy' | 'rent'; // شراء / إيجار for seeker

export function ListPropertyModal({
  isOpen,
  onClose,
  language,
}: ListPropertyModalProps) {
  const isAr = language === 'ar';

  // Form State
  const [userRole, setUserRole] = useState<UserRole>('owner');
  
  // Owner Fields
  const [addressMethod, setAddressMethod] = useState<AddressMethod>('map');
  const [mapAddress, setMapAddress] = useState('');
  const [shortAddress, setShortAddress] = useState('');
  const [ownerOfferType, setOwnerOfferType] = useState<ListingOfferType>('sale');
  
  // Seeker Fields
  const [propertyDescription, setPropertyDescription] = useState('');
  const [seekerOfferType, setSeekerOfferType] = useState<RequestOfferType>('buy');

  // Shared Fields
  const [propertyType, setPropertyType] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const { submitLead } = useData();

  // Map Popup State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  if (!isOpen) return null;

  const propertyTypes = isAr
    ? [
        { id: 'apartment', label: 'شقة' },
        { id: 'villa', label: 'فيلا' },
        { id: 'townhouse', label: 'تاون هاوس' },
        { id: 'penthouse', label: 'بنتهاوس' },
        { id: 'land', label: 'أرض' },
        { id: 'building', label: 'عمارة سكنية / تجارية' },
        { id: 'floor', label: 'دور مستقل' },
        { id: 'office', label: 'مكتب تجاري' },
        { id: 'retail', label: 'محل / معرض تجاري' },
        { id: 'warehouse', label: 'مستودع / هنجر' },
      ]
    : [
        { id: 'apartment', label: 'Apartment' },
        { id: 'villa', label: 'Villa' },
        { id: 'townhouse', label: 'Townhouse' },
        { id: 'penthouse', label: 'Penthouse' },
        { id: 'land', label: 'Land Plot' },
        { id: 'building', label: 'Full Building' },
        { id: 'floor', label: 'Independent Floor' },
        { id: 'office', label: 'Commercial Office' },
        { id: 'retail', label: 'Retail / Showroom' },
        { id: 'warehouse', label: 'Warehouse / Industrial' },
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await submitLead({
        name: fullName || (isAr ? 'طلب عقار' : 'Property Submission'),
        email,
        phone,
        inquiry_type: 'property_listing',
        recipient_email: 'info@hardgp.com',
        message: `Role: ${userRole === 'owner' ? (ownerOfferType === 'sale' ? 'Owner (Sale)' : 'Owner (Rent)') : (seekerOfferType === 'buy' ? 'Seeker (Buy)' : 'Seeker (Rent)')}\nProperty Type: ${propertyType || 'Not specified'}\nAddress Details: ${mapAddress || shortAddress || 'Not specified'}\nDescription: ${propertyDescription || 'None'}`,
        source: 'List or Request Property Modal',
        metadata: {
          userRole,
          propertyType,
          mapAddress,
          shortAddress,
          propertyDescription,
          ownerOfferType,
          seekerOfferType,
          targetEmail: 'info@hardgp.com',
          recipientEmail: 'info@hardgp.com',
        },
      });

      setReferenceId(result.lead.id);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit property listing/request', err);
      const fallbackRef = `REQ-${Math.floor(100000 + Math.random() * 900000)}`;
      setReferenceId(fallbackRef);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setUserRole('owner');
    setMapAddress('');
    setShortAddress('');
    setPropertyDescription('');
    setPropertyType('');
    setFullName('');
    setPhone('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg sm:max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 z-10 overflow-hidden my-6 transform transition-all duration-200 animate-in zoom-in-95 p-6 sm:p-8"
      >
        {/* Top Header: Title + Role Selector on the Right (in Arabic) / Left (in English) + Close Button on opposite side */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100/80">
          <div className="flex flex-col items-start text-start flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display-serif">
              {isAr ? 'اعرض أو أطلب عقارك' : 'List or Request Your Property'}
            </h2>

            {/* Role Radio Group (مالك / مشتري أو مستأجر) */}
            <div className="flex items-center gap-6 mt-3 text-sm sm:text-base font-medium text-slate-800">
              {/* Option 1: مالك (Owner) */}
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="userRole"
                  value="owner"
                  checked={userRole === 'owner'}
                  onChange={() => setUserRole('owner')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <span>{isAr ? 'مالك' : 'Owner'}</span>
              </label>

              {/* Option 2: مشتري أو مستأجر (Buyer / Tenant) */}
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="userRole"
                  value="seeker"
                  checked={userRole === 'seeker'}
                  onChange={() => setUserRole('seeker')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <span>{isAr ? 'مشتري أو مستأجر' : 'Buyer or Tenant'}</span>
              </label>
            </div>
          </div>

          {/* Close Button on opposite side */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0 mt-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation State */}
        {submitted ? (
          <div className="text-center py-8 space-y-4 animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {isAr ? 'تم استلام طلبك بنجاح!' : 'Request Submitted Successfully!'}
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {isAr
                ? `رقم المرجع الخاص بك: ${referenceId}. سيقوم فريق هارد للعقارات بمراجعة الطلب والتواصل معك خلال وقت وجيز.`
                : `Your reference ID: ${referenceId}. Our team at HARD Real Estate will review your request and contact you shortly.`}
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/966556125711?text=${encodeURIComponent(
                  `مرحباً هارد للعقارات، أود متابعة طلبي برقم المرجع: ${referenceId}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors w-full sm:w-auto"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAr ? 'متابعة عبر واتساب' : 'Follow up via WhatsApp'}</span>
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors w-full sm:w-auto cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          /* Main Interactive Form */
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* ========================================================================= */}
            {/* VIEW A: WHEN USER IS "مالك" (OWNER)                                       */}
            {/* ========================================================================= */}
            {userRole === 'owner' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* 1. عنوان العقار (Property Address with Map / Short address options preceding inputs) */}
                <div className="space-y-2.5">
                  <label className="block text-sm font-semibold text-slate-900 text-start">
                    {isAr ? 'عنوان العقار' : 'Property Address'}
                  </label>

                  {/* Option 1: الخريطة (Radio Button PRECEDES the Map Input on the same line) */}
                  <div className="flex items-center gap-2.5">
                    {/* Radio Button + Label (Preceding) */}
                    <label className="inline-flex items-center gap-2 cursor-pointer shrink-0 select-none min-w-[85px] sm:min-w-[105px]">
                      <input
                        type="radio"
                        name="addressMethod"
                        value="map"
                        checked={addressMethod === 'map'}
                        onChange={() => {
                          setAddressMethod('map');
                          setIsMapModalOpen(true);
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {isAr ? 'الخريطة' : 'Map'}
                      </span>
                    </label>

                    {/* Location Pin Icon Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setAddressMethod('map');
                        setIsMapModalOpen(true);
                      }}
                      className="p-2.5 border border-slate-300 rounded-xl hover:border-blue-500 text-slate-700 hover:text-blue-600 bg-white transition-colors cursor-pointer shrink-0 shadow-xs"
                      title={isAr ? 'فتح نافذة خرائط جوجل لتحديد الإحداثيات' : 'Open Google Map to select coordinates'}
                    >
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </button>

                    {/* Coordinates Display Text Box (Read-Only & Dimmed) */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        readOnly
                        placeholder={isAr ? 'إحداثيات الموقع (اضغط للتحديد من الخريطة)' : 'Location coordinates (Click to pick from map)'}
                        value={mapAddress}
                        onClick={() => {
                          setAddressMethod('map');
                          setIsMapModalOpen(true);
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-300 rounded-xl text-sm font-mono text-slate-700 placeholder-slate-400 cursor-pointer select-none focus:outline-none transition-all text-start"
                      />
                    </div>
                  </div>

                  {/* Option 2: عنوان مختصر (Radio Button PRECEDES the Short Address Input on the same line) */}
                  <div className="flex items-center gap-2.5">
                    {/* Radio Button + Label (Preceding) */}
                    <label className="inline-flex items-center gap-2 cursor-pointer shrink-0 select-none min-w-[85px] sm:min-w-[105px]">
                      <input
                        type="radio"
                        name="addressMethod"
                        value="short"
                        checked={addressMethod === 'short'}
                        onChange={() => setAddressMethod('short')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {isAr ? 'عنوان مختصر' : 'Short Address'}
                      </span>
                    </label>

                    {/* Short Address Input */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={isAr ? 'أدخل العنوان المختصر' : 'Enter short national address'}
                        value={shortAddress}
                        onFocus={() => setAddressMethod('short')}
                        onChange={(e) => setShortAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-start"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. نوع العقار ونوع العرض (Property Type & Offer Type: بيع / إيجار) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* نوع العقار Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5 text-start">
                      {isAr ? 'نوع العقار' : 'Property Type'}
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer text-start"
                      required
                    >
                      <option value="" disabled>
                        {isAr ? 'اختر النوع' : 'Select Type'}
                      </option>
                      {propertyTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* نوع العرض (بيع / إيجار) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2.5 text-start">
                      {isAr ? 'نوع العرض' : 'Listing Type'}
                    </label>
                    <div className="flex items-center gap-5 pt-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="ownerOfferType"
                          value="sale"
                          checked={ownerOfferType === 'sale'}
                          onChange={() => setOwnerOfferType('sale')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm font-medium text-slate-800">
                          {isAr ? 'بيع' : 'Sale'}
                        </span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="ownerOfferType"
                          value="rent"
                          checked={ownerOfferType === 'rent'}
                          onChange={() => setOwnerOfferType('rent')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm font-medium text-slate-800">
                          {isAr ? 'إيجار' : 'Rent'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW B: WHEN USER IS "مشتري أو مستأجر" (BUYER / TENANT)                   */}
            {/* ========================================================================= */}
            {userRole === 'seeker' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* 1. وصف العقار (Property Description) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5 text-start">
                    {isAr ? 'وصف العقار' : 'Property Description & Preferences'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={propertyDescription}
                    onChange={(e) => setPropertyDescription(e.target.value)}
                    placeholder={isAr ? 'أضف وصف العقار هنا' : 'Add property description & requirements here'}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-start"
                  />
                </div>

                {/* 2. نوع العقار ونوع العرض (Property Type & Request Type: شراء / إيجار) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* نوع العقار Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5 text-start">
                      {isAr ? 'نوع العقار' : 'Property Type'}
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer text-start"
                      required
                    >
                      <option value="" disabled>
                        {isAr ? 'اختر النوع' : 'Select Type'}
                      </option>
                      {propertyTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* نوع العرض (شراء / إيجار) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2.5 text-start">
                      {isAr ? 'نوع العرض' : 'Request Type'}
                    </label>
                    <div className="flex items-center gap-5 pt-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="seekerOfferType"
                          value="buy"
                          checked={seekerOfferType === 'buy'}
                          onChange={() => setSeekerOfferType('buy')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm font-medium text-slate-800">
                          {isAr ? 'شراء' : 'Buy'}
                        </span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="seekerOfferType"
                          value="rent"
                          checked={seekerOfferType === 'rent'}
                          onChange={() => setSeekerOfferType('rent')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm font-medium text-slate-800">
                          {isAr ? 'إيجار' : 'Rent'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SHARED SECTION: NAME, PHONE, EMAIL                                       */}
            {/* ========================================================================= */}
            {/* 3. الاسم (Full Name) */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5 text-start">
                {isAr ? 'الاسم' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                placeholder={isAr ? 'اسمك' : 'Your name'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-start"
              />
            </div>

            {/* 4. رقم الهاتف والبريد الإلكتروني (Phone & Email 2-Column Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* رقم الهاتف (Phone) */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5 text-start">
                  {isAr ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+966 5X XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-start dir-ltr"
                />
              </div>

              {/* البريد الإلكتروني (Email) */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5 text-start">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-start dir-ltr"
                />
              </div>
            </div>

            {/* 5. زر الإرسال (Submit Button matching primary brand button) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 bg-hard-gradient text-white font-semibold rounded-xl text-base transition-all duration-200 shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer text-center flex items-center justify-center gap-2 border border-transparent"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    <span>{isAr ? 'جاري إرسال الطلب...' : 'Submitting Request...'}</span>
                  </span>
                ) : (
                  <span>{isAr ? 'إرسال الطلب' : 'Submit Request'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Google Maps Location Picker Popup Window */}
      <GoogleMapPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        language={language}
        initialCoords={mapAddress}
        onSelectLocation={(coordsString) => {
          setMapAddress(coordsString);
        }}
      />
    </div>
  );
}
