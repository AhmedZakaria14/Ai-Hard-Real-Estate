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
  ['city-dammam', 'Dammam', 'الدمام'],
  ['city-khobar', 'Al Khobar', 'الخبر'],
  ['city-dhahran', 'Dhahran', 'الظهران'],
  ['city-qatif', 'Qatif', 'القطيف'],
  ['city-saihat', 'Saihat', 'سيهات'],
  ['city-safwa', 'Safwa', 'صفوى'],
  ['city-tarout', 'Tarout Island', 'جزيرة تاروت'],
  ['city-jubail', 'Jubail and Jubail Industrial City', 'الجبيل والجبيل الصناعية'],
  ['city-ras-tanura', 'Ras Tanura', 'رأس تنورة'],
  ['city-abqaiq', 'Abqaiq', 'بقيق'],
  ['other', 'Other city…', 'مدينة أخرى…'],
].map(([id, cityNameEn, cityNameAr], index) => ({
  id, cityNameEn, cityNameAr, regionEn: index < 10 ? 'Eastern Province' : '',
  regionAr: index < 10 ? 'المنطقة الشرقية' : '', responseTimeMin: 0,
  isPrimaryArea: index < 3, active: true,
}));

export const DEFAULT_HVAC_HERO: HVACHeroContent = {
  badgeEn: '',
  badgeAr: '',
  headlineEn: 'Professional AC Maintenance and Cooling to the Highest Standards',
  headlineAr: 'صيانة وغسيل أجهزة التكييف والتبريد بأعلى معايير الدقة والاحترافية',
  subtitleEn: 'Specialized engineers and technicians provide comprehensive AC washing, complex fault repairs, and air duct sanitization with reliable periodic maintenance contracts in the Eastern Province.',
  subtitleAr: 'كوادر هندسية وفنية متخصصة تقدم غسيل شامل لأجهزة التكييف، صيانة الأعطال المعقدة، وتعقيم مجاري الهواء مع عقود صيانة دورية موثوقة في المنطقة الشرقية.',
  bgImageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80',
  ctaPrimaryEn: 'Book Technician Visit',
  ctaPrimaryAr: 'حجز موعد فني صيانة',
  ctaEmergencyEn: '',
  ctaEmergencyAr: '',
  isPublished: true,
};

export const DEFAULT_HVAC_HOURS_CONTACT: HVACOperatingHoursContact = {
  emergencyPhone: '+966 55 064 1000',
  whatsappNumber: '+966550641000',
  officeEmail: 'info@hardgp.com',
  officeAddressEn: 'Prince Mutaib bin Abdulaziz Road, Hajr District, Dammam, Saudi Arabia',
  officeAddressAr: 'طريق الأمير متعب بن عبد العزيز، حي هجر، الدمام، المملكة العربية السعودية',
  cityEn: 'Dammam',
  cityAr: 'الدمام',
  lat: 26.373703,
  lng: 50.102998,
  googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=26.373703,50.102998',
  hoursWeekdayEn: 'Saturday - Thursday: 8:00 AM - 5:00 PM',
  hoursWeekdayAr: 'السبت - الخميس: ٨:٠٠ ص – ٠٥:٠٠ م',
  hoursFridayEn: '',
  hoursFridayAr: '',
  is24x7EmergencyActive: false,
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

