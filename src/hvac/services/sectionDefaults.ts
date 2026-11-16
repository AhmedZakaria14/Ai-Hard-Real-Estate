// --- Shared City & Service Area Interfaces ---
export interface HVACCityArea {
  id: string;
  cityNameEn: string;
  cityNameAr: string;
  regionEn: string;
  regionAr: string;
  responseTimeMin: number;
  isPrimaryArea: boolean;
  active: boolean;
}

export interface HVACHeroContent {
  badgeEn: string;
  badgeAr: string;
  headlineEn: string;
  headlineAr: string;
  subtitleEn: string;
  subtitleAr: string;
  bgImageUrl: string;
  ctaPrimaryEn: string;
  ctaPrimaryAr: string;
  ctaEmergencyEn: string;
  ctaEmergencyAr: string;
  isPublished?: boolean;
}

export interface HVACOperatingHoursContact {
  emergencyPhone: string;
  whatsappNumber: string;
  officeEmail: string;
  officeAddressEn: string;
  officeAddressAr: string;
  cityEn: string;
  cityAr: string;
  lat: number;
  lng: number;
  googleMapsUrl: string;
  hoursWeekdayEn: string;
  hoursWeekdayAr: string;
  hoursFridayEn: string;
  hoursFridayAr: string;
  is24x7EmergencyActive: boolean;
}

export interface HVACBookingCopy {
  modalTitleEn: string;
  modalTitleAr: string;
  modalSubtitleEn: string;
  modalSubtitleAr: string;
  urgentNoteEn: string;
  urgentNoteAr: string;
  submitButtonEn: string;
  submitButtonAr: string;
}

// Default Shared Cities for Eastern Province & Major KSA Centers
export const DEFAULT_HVAC_CITIES: HVACCityArea[] = [
  {
    id: 'city-khobar',
    cityNameEn: 'Al Khobar',
    cityNameAr: 'الخبر',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    responseTimeMin: 30,
    isPrimaryArea: true,
    active: true,
  },
  {
    id: 'city-dammam',
    cityNameEn: 'Dammam',
    cityNameAr: 'الدمام',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    responseTimeMin: 30,
    isPrimaryArea: true,
    active: true,
  },
  {
    id: 'city-dhahran',
    cityNameEn: 'Dhahran',
    cityNameAr: 'الظهران',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    responseTimeMin: 25,
    isPrimaryArea: true,
    active: true,
  },
  {
    id: 'city-jubail',
    cityNameEn: 'Jubail Industrial',
    cityNameAr: 'الجبيل الصناعية',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    responseTimeMin: 45,
    isPrimaryArea: false,
    active: true,
  },
  {
    id: 'city-[#009ee2]-qatif',
    cityNameEn: 'Qatif & Saihat',
    cityNameAr: 'القطيف وسيهات',
    regionEn: 'Eastern Province',
    regionAr: 'المنطقة الشرقية',
    responseTimeMin: 35,
    isPrimaryArea: false,
    active: true,
  },
  {
    id: 'city-riyadh',
    cityNameEn: 'Riyadh HQ Branch',
    cityNameAr: 'الرياض (فرع المقر الرئيسي)',
    regionEn: 'Central Region',
    regionAr: 'المنطقة الوسطى',
    responseTimeMin: 40,
    isPrimaryArea: true,
    active: true,
  },
];

export const DEFAULT_HVAC_HERO: HVACHeroContent = {
  badgeEn: '24/7 Rapid Emergency Response & Engineering Care',
  badgeAr: 'خدمة طوارئ واستجابة هاتفية على مدار الساعة ٢٤/٧',
  headlineEn: 'Master AC Repair & Precision Cooling Engineering',
  headlineAr: 'الاحترافية المطلقة في صيانة وتبريد أنظمة التكييف',
  subtitleEn: 'Certified HVAC technicians for split, concealed, package, and VRF systems across the Eastern Province and Riyadh.',
  subtitleAr: 'فنيون مهندسون معتمدون لصيانة كافة أنواع المكيفات: سبليت، كونسيلد، باكج سطحي، وأنظمة VRF في الشرقية والرياض.',
  bgImageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80',
  ctaPrimaryEn: 'Book Technician Visit',
  ctaPrimaryAr: 'حجز موعد فني صيانة',
  ctaEmergencyEn: 'Emergency Hotline Call',
  ctaEmergencyAr: 'الاتصال بالطوارئ فوراً',
  isPublished: true,
};

export const DEFAULT_HVAC_HOURS_CONTACT: HVACOperatingHoursContact = {
  emergencyPhone: '+966 13 800 4272',
  whatsappNumber: '+966501234567',
  officeEmail: 'hvac@hard-sa.com',
  officeAddressEn: 'King Fahd Road, Corniche District, Al Khobar, Saudi Arabia',
  officeAddressAr: 'طريق الملك فهد، حي الكورنيش، الخبر، المملكة العربية السعودية',
  cityEn: 'Al Khobar',
  cityAr: 'الخبر',
  lat: 26.288412,
  lng: 50.210543,
  googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=26.288412,50.210543',
  hoursWeekdayEn: 'Saturday - Thursday: 8:00 AM - 10:00 PM',
  hoursWeekdayAr: 'السبت - الخميس: ٨:٠٠ صباحاً - ١٠:٠٠ مساءً',
  hoursFridayEn: 'Friday: 2:00 PM - 10:00 PM (Emergency Active 24/7)',
  hoursFridayAr: 'الجمعة: ٢:٠٠ ظهراً - ١٠:٠٠ مساءً (الطوارئ مفعّلة ٢٤/٧)',
  is24x7EmergencyActive: true,
};

export const DEFAULT_HVAC_BOOKING_COPY: HVACBookingCopy = {
  modalTitleEn: 'Schedule HVAC Service Visit',
  modalTitleAr: 'حجز زيارة صيانة تكييف معتمدة',
  modalSubtitleEn: 'Select your preferred time window and emergency level. Our team dispatches certified technicians.',
  modalSubtitleAr: 'اختر الموعد المناسب ودرجة الاستعجال، وسيقوم فريقنا الفني بالتواصل ومباشرة الطلب فوراً.',
  urgentNoteEn: 'Urgent requests receive priority hotline dispatch within 30-45 minutes.',
  urgentNoteAr: 'الطلبات العاجلة تحظى بأولوية المباشرة الفورية خلال ٣٠ - ٤٥ دقيقة.',
  submitButtonEn: 'Confirm Service Reservation',
  submitButtonAr: 'تأكيد حجز الموعد الفني',
};

