import { Property, Project, BlogPost, ServiceDetail, Testimonial, JoinListSubscriber } from '../types';

export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    slug: 'the-sky-crest-penthouse-khobar-corniche',
    title: {
      en: 'The Sky Crest Penthouse with Panoramic Arabian Gulf Views',
      ar: 'بنتهاوس ذا سكاي كريست مع إطلالات بانورامية على كورنيش الخُبر والخليج',
    },
    description: {
      en: 'An architectural masterpiece atop Al Khobar Corniche featuring double-height floor-to-ceiling glass, private infinity pool, Italian marble finishes, bespoke designer kitchen, and private direct elevator lobby.',
      ar: 'تحفة معمارية في قمة كورنيش الخُبر تتميز بزجاج مزدوج الارتفاع من الأرض حتى السقف، ومسبح إنفينيتي خاص، وتشطيبات من الرخام الإيطالي الفاخر، ومصعد خاص مباشر بإطلالة ساحلية مفتوحة.',
    },
    location: {
      city: { en: 'Al Khobar', ar: 'الخُبر' },
      area: { en: 'Corniche Waterfront', ar: 'كورنيش الخُبر' },
      country: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
      address: { en: 'Prince Turki Street, Corniche, Al Khobar', ar: 'طريق الأمير تركي، الكورنيش، الخُبر' },
      coordinates: { lat: 26.2886, lng: 50.2185 },
    },
    price: {
      sar: 25687500,
      formattedSAR: '25,687,500 SAR',
    },
    type: 'penthouse',
    status: 'for-sale',
    bedrooms: 5,
    bathrooms: 6,
    areaSqFt: 7850,
    areaSqM: 729,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: {
      en: [
        'Private Infinity Pool',
        'Private Elevator',
        'Concierge & Valet 24/7',
        'Smart Home Automation',
        'Private Spa & Sauna',
        'Majlis & Executive Lounge',
        '4 Covered Parking Bays',
        'Private Coastal Promenade Access',
      ],
      ar: [
        'مسبح إنفينيتي خاص',
        'مصعد خاص مباشر',
        'خدمات استقبال وحراسة 24/7',
        'نظام تحكم منزلي ذكي متكامل',
        'سبا وساونا خاصة',
        'مجلس وصالون استقبال تنفيذي',
        '4 مواقف سيارات مغطاة',
        'مدخل مباشر للممشى البحري',
      ],
    },
    features: {
      yearBuilt: 2025,
      parkingSpaces: 4,
      furnishing: { en: 'Fully Furnished (Luxury Italian)', ar: 'مفروشة بالكامل (تصميم إيطالي فاخر)' },
      view: { en: 'Full Arabian Gulf & Corniche View', ar: 'إطلالة بحرية كاملة على الخليج والكورنيش' },
    },
    agent: {
      name: { en: 'Faisal Al-Otaibi', ar: 'فيصل العتيبي' },
      title: { en: 'Senior Luxury Director - Eastern Province', ar: 'مدير قطاع العقارات الفاخرة - المنطقة الشرقية' },
      phone: '+966 13 800 4273',
      whatsapp: '966556125711',
      email: 'faisal@hardrealestate.sa',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    id: 'prop-2',
    slug: 'serene-haven-mansion-dhahran-hills',
    title: {
      en: 'Serene Royal Oasis Mansion in Dhahran Hills',
      ar: 'قصر الواحة الملكية في تلال الظهران الفاخرة',
    },
    description: {
      en: 'A palatial contemporary estate nestled in the exclusive Dhahran Hills district. Features bespoke landscaped botanical gardens, resort-style heated lap pool, private cinema, separate grand reception majlis, separate driver & staff quarters, and high-security automation.',
      ar: 'قصر عصري استثنائي يقع في أرقى أحياء تلال الظهران. يتضمن حدائق منسقة خاصة ونوافير، ومسبحاً مدفأ بطراز المنتجعات، وسينما خاصة، ومجالس ضيافة ملكية مستقلة للرجال والنساء، وجناحاً مستقلاً للخدمات، ونظام أمان ذكي متكامل.',
    },
    location: {
      city: { en: 'Dhahran', ar: 'الظهران' },
      area: { en: 'Dhahran Hills / Al Dana', ar: 'تلال الظهران / الدانة' },
      country: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
      address: { en: 'Royal Boulevard, Dhahran Hills, Dhahran', ar: 'شارع القصور، تلال الظهران' },
      coordinates: { lat: 26.305, lng: 50.145 },
    },
    price: {
      sar: 45937500,
      formattedSAR: '45,937,500 SAR',
    },
    type: 'mansion',
    status: 'for-sale',
    bedrooms: 6,
    bathrooms: 8,
    areaSqFt: 14200,
    areaSqM: 1319,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: {
      en: [
        'Private 12-Seat Cinema',
        'Private Grand Royal Majlis',
        'Heated Lap Pool',
        'Chef Commercial Kitchen',
        'Gymnasium & Moroccan Hammam',
        'Smart Security & Solar Infrastructure',
        '6 Covered Parking Bays',
        'Driver & Maid Quarters',
      ],
      ar: [
        'سينما خاصة 12 مقعداً',
        'مجلس ضيافة ملكي فسيح',
        'مسبح مدفأ متدرج',
        'مطبخ تحضيري ومركزي مجهز',
        'صالة رياضية وحمام مغربي',
        'نظام أمن ذكي وطاقة شمسية',
        '6 مواقف سيارات مغطاة',
        'أجنحة مستقلة للسائق والخدمات',
      ],
    },
    features: {
      yearBuilt: 2024,
      parkingSpaces: 6,
      furnishing: { en: 'Custom Turnkey Furnished', ar: 'مؤثثة بالكامل بتصميم خاص' },
      view: { en: 'Private Botanical Gardens & City Horizon', ar: 'إطلالة على الحدائق الخاصة وأفق المدينة' },
    },
    agent: {
      name: { en: 'Reem Al-Qahtani', ar: 'ريم القحطاني' },
      title: { en: 'Principal Private Client Advisor', ar: 'مستشارة أولى لكبار العملاء والمستثمرين' },
      phone: '+966 13 800 4273',
      whatsapp: '966556125711',
      email: 'reem@hardrealestate.sa',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    id: 'prop-3',
    slug: 'azure-shobaily-waterfront-residence',
    title: {
      en: 'Azure Luxury Residence in Al Shobaily Waterfront',
      ar: 'شقة فاخرة بإطلالة مائية في الشبيلي جراند مول - الخُبر',
    },
    description: {
      en: 'Sophisticated 3-bedroom residence offering uninterrupted views of Al Shobaily Bay and Al Khobar coast. Features floor-to-ceiling acoustic glass, wrap-around balcony, Miele-equipped kitchen, and luxury tower amenities.',
      ar: 'شقة فاخرة بتصميم عصري مكونة من 3 غرف نوم توفر إطلالات ساحرة على خليج الشبيلي وواجهة الخُبر البحرية. تتميز بزجاج عازل للصوت من الأرض حتى السقف وشرفة واسعة ومطبخ حديث متكامل.',
    },
    location: {
      city: { en: 'Al Khobar', ar: 'الخُبر' },
      area: { en: 'Al Shobaily District', ar: 'حي الشبيلي' },
      country: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
      address: { en: 'Al Shobaily Bay Boulevard, Al Khobar', ar: 'بوليفارد الشبيلي، الخُبر' },
      coordinates: { lat: 26.241, lng: 50.211 },
    },
    price: {
      sar: 5325000,
      formattedSAR: '5,325,000 SAR',
    },
    type: 'apartment',
    status: 'for-sale',
    bedrooms: 3,
    bathrooms: 4,
    areaSqFt: 2950,
    areaSqM: 274,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: {
      en: [
        'Panoramic Sea View Balcony',
        'State-of-the-Art Fitness Center',
        'Infinity Bay Swimming Pool',
        'Resident Private Cinema',
        '2 Covered Parking Slots',
        'Private Marina Berth Access',
      ],
      ar: [
        'شرفة بانورامية بإطلالة بحرية',
        'نادي لياقة بدنية مجهز بالكامل',
        'مسبح إنفينيتي بإطلالة مائية',
        'سينما خاصة للقاطنين',
        'موقفان مغطيان للسيارات',
        'مرسى لليخوت والقوارب',
      ],
    },
    features: {
      yearBuilt: 2024,
      parkingSpaces: 2,
      furnishing: { en: 'Semi-Furnished (Custom Wardrobes)', ar: 'نصف مفروشة (خزائن مدمجة فاخرة)' },
      view: { en: 'Shobaily Bay & Marine Skyline', ar: 'خليج الشبيلي والأفق البحري' },
    },
    agent: {
      name: { en: 'Sultan Al-Ghamdi', ar: 'سلطان الغامدي' },
      title: { en: 'Waterfront Properties Specialist', ar: 'أخصائي المشاريع والواجهات البحرية' },
      phone: '+966 13 800 4273',
      whatsapp: '966556125711',
      email: 'sultan@hardrealestate.sa',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    id: 'prop-4',
    slug: 'contemporary-greenery-villa-dammam-shati',
    title: {
      en: 'Contemporary Waterfront Villa in Al Shati Dammam',
      ar: 'فيلا عصرية فاخرة بحي الشاطئ الغربي - الدمام',
    },
    description: {
      en: 'Charming modern 4-bedroom contemporary villa located in Al Shati, Dammam. Open-plan living spaces bathed in natural sunlight, landscaped private courtyard with waterfall fountain, high ceilings, and premium ceramic & wood flooring.',
      ar: 'فيلا عصرية حديثة مكونة من 4 غرف نوم في حي الشاطئ بالدمام. مساحات معيشة مفتوحة غارقة بالضوء الطبيعي، وفناء خاص منسق مع شلال مائي، وأسقف مرتفعة وتشطيبات خشبية ورخامية راقية.',
    },
    location: {
      city: { en: 'Dammam', ar: 'الدمام' },
      area: { en: 'Al Shati District', ar: 'حي الشاطئ' },
      country: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
      address: { en: 'Corniche Road, Al Shati, Dammam', ar: 'طريق الكورنيش، حي الشاطئ، الدمام' },
      coordinates: { lat: 26.462, lng: 50.118 },
    },
    price: {
      sar: 4050000,
      formattedSAR: '4,050,000 SAR',
    },
    type: 'villa',
    status: 'for-sale',
    bedrooms: 4,
    bathrooms: 5,
    areaSqFt: 4600,
    areaSqM: 427,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: {
      en: [
        'Private Landscaped Garden & Water Feature',
        'Rooftop Terrace Lounge',
        'Smart Entry & Ambient Lighting',
        'Maid Room with En-suite',
        'Close to Dammam Corniche & Parks',
        '2 Covered Parking Bays',
      ],
      ar: [
        'حديقة خاصة منسقة مع شلال مائي',
        'جلسة روف عصرية بإطلالة مفتوحة',
        'دخول ذكي وإضاءات تفاعلية',
        'غرفة خادمة بدورة مياه خاصة',
        'قريب من ممشى كورنيش الدمام والحدائق',
        'موقفان مغطيان للسيارات',
      ],
    },
    features: {
      yearBuilt: 2023,
      parkingSpaces: 2,
      furnishing: { en: 'Unfurnished', ar: 'غير مفروشة (جاهزة للتأثيث)' },
      view: { en: 'Garden & Coastal Avenue', ar: 'إطلالة على الحديقة والشارع الساحلي' },
    },
    agent: {
      name: { en: 'Sara Al-Dossary', ar: 'سارة الدوسري' },
      title: { en: 'Residential Investment Advisor', ar: 'مستشارة الاستثمار والتطوير السكني' },
      phone: '+966 13 800 4273',
      whatsapp: '966556125711',
      email: 'sara@hardrealestate.sa',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    id: 'prop-5',
    slug: 'the-grand-rakah-executive-suite-khobar',
    title: {
      en: 'The Grand Rakah Executive Sky Suite',
      ar: 'جناح تنفيذي راقٍ للإيجار السنوي - حي الراكة الخُبر',
    },
    description: {
      en: 'Prime luxury rental home ready for immediate occupancy. High-end furnished layout, custom ambient lighting, walk-in closets, central HVAC, and immediate highway access to Dhahran Techno Valley and Al Khobar commercial core.',
      ar: 'شقة فاخرة مؤثثة بالكامل للإيجار السنوي في حي الراكة الراقي بين الخُبر والدمام. تشطيبات فندقية فاخرة وتكييف مركزي وموقع استراتيجي ممتاز بالقرب من وادي الظهران للتقنية وأرامكو.',
    },
    location: {
      city: { en: 'Al Khobar', ar: 'الخُبر' },
      area: { en: 'Al Rakah South', ar: 'حي الراكة الجنوبية' },
      country: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
      address: { en: 'King Khalid Road, Al Rakah, Al Khobar', ar: 'طريق الملك خالد، حي الراكة، الخُبر' },
      coordinates: { lat: 26.368, lng: 50.198 },
    },
    price: {
      sar: 240000,
      formattedSAR: '240,000 SAR / yr',
      period: 'year',
    },
    type: 'apartment',
    status: 'for-rent',
    bedrooms: 2,
    bathrooms: 3,
    areaSqFt: 1850,
    areaSqM: 172,
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab00f?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: {
      en: [
        'Fully Designer Furnished',
        'All Utilities & High-Speed WiFi Ready',
        '24/7 Secure Access & CCTV',
        'Heated Indoor Pool & Gym',
        'Assigned Basement Parking',
        'Weekly Housekeeping Available',
      ],
      ar: [
        'مفروشة بالكامل بتصميم راقٍ',
        'جاهزة بالخدمات وإنترنت فائق السرعة',
        'دخول آمن وحراسة على مدار الساعة',
        'مسبح داخلي مدفأ ونادي صحي',
        'موقف سيارة مخصص بالقبو',
        'خدمات تنظيف دورية متوفرة',
      ],
    },
    features: {
      yearBuilt: 2024,
      parkingSpaces: 1,
      furnishing: { en: 'Fully Furnished (Brand New)', ar: 'مفروشة بالكامل (أثاث جديد فاخر)' },
      view: { en: 'City Skyline & Boulevard', ar: 'إطلالة على بوليفارد المدينة' },
    },
    agent: {
      name: { en: 'Tariq Al-Shehri', ar: 'طارق الشهري' },
      title: { en: 'Leasing & Corporate Relocation Specialist', ar: 'أخصائي التأجير وإسكان الشركات التنفيذية' },
      phone: '+966 13 800 4273',
      whatsapp: '966556125711',
      email: 'tariq@hardrealestate.sa',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    id: 'prop-6',
    slug: 'the-shobaily-bay-royal-villa',
    title: {
      en: 'The Royal Marina Villa in Al Shobaily Bay',
      ar: 'فيلا المارينا الملكية المستقلة - خليج الشبيلي الخُبر',
    },
    description: {
      en: 'A premier waterfront estate located on the tranquil shores of Al Shobaily Bay. Featuring private direct boat slip, expansive marble terraces, floor-to-ceiling glass pavilions, and grand reception halls.',
      ar: 'فيلا ملكية فاخرة مستقلة مباشرة على مياه خليج الشبيلي مع مرسى خاص للقوارب واليخوت. تتميز بتراسات رخامية شاسعة وصالات استقبال فاخرة وإطلالات بحرية آسرة.',
    },
    location: {
      city: { en: 'Al Khobar', ar: 'الخُبر' },
      area: { en: 'Al Shobaily Waterfront', ar: 'واجهة الشبيلي البحرية' },
      country: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
      address: { en: 'Marina Island Way, Al Shobaily, Al Khobar', ar: 'طريق جزيرة المارينا، الشبيلي، الخُبر' },
      coordinates: { lat: 26.235, lng: 50.219 },
    },
    price: {
      sar: 8062500,
      formattedSAR: '8,062,500 SAR',
    },
    type: 'villa',
    status: 'for-sale',
    bedrooms: 5,
    bathrooms: 6,
    areaSqFt: 6200,
    areaSqM: 576,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
    ],
    amenities: {
      en: [
        'Private Boat Berth & Slipway',
        'Sea-Facing Infinity Pool',
        'Separate Guest Majlis',
        'Chef & Service Kitchens',
        'Smart Automation & Security',
        '4 Covered Garage Bays',
      ],
      ar: [
        'مرسى خاص مباشر للقوارب',
        'مسبح إنفينيتي مواجه للبحر',
        'مجلس ضيافة مستقل للزوار',
        'مطبخ رئيسي وتحضيري',
        'نظام تحكم ذكي وأمان متطور',
        'كراج مغطى يتسع لـ 4 سيارات',
      ],
    },
    features: {
      yearBuilt: 2024,
      parkingSpaces: 4,
      furnishing: { en: 'Fully Furnished (Bespoke)', ar: 'مفروشة بالكامل بتصميم مخصص' },
      view: { en: 'Direct Shobaily Bay & Sunset Sea View', ar: 'إطلالة بحرية مباشرة على الخليج وغروب الشمس' },
    },
    agent: {
      name: { en: 'Faisal Al-Otaibi', ar: 'فيصل العتيبي' },
      title: { en: 'Senior Luxury Director - Eastern Province', ar: 'مدير قطاع العقارات الفاخرة - المنطقة الشرقية' },
      phone: '+966 13 800 4273',
      whatsapp: '966556125711',
      email: 'faisal@hardrealestate.sa',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    },
  },
];

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    title: {
      en: 'The Pearl of Khobar Waterfront Towers',
      ar: 'أبراج لؤلؤة الخُبر البحرية الفاخرة',
    },
    developer: {
      en: 'HARD Developments & Real Estate Assets',
      ar: 'هارد للتطوير والاستثمار العقاري',
    },
    location: {
      en: 'Al Shobaily Waterfront, Al Khobar, Eastern Province',
      ar: 'واجهة الشبيلي البحرية، الخُبر، المنطقة الشرقية',
    },
    startingPriceSAR: '1,912,500 SAR',
    handoverDate: { en: 'Q4 2026', ar: 'الربع الرابع 2026' },
    unitsTotal: 280,
    unitsAvailable: 42,
    roiProjected: '9.8% Net ROI',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    category: { en: 'Luxury Residential Towers', ar: 'أبراج سكنية فاخرة' },
    description: {
      en: 'A premier waterfront master community featuring branded residences, private marina slips, Michelin-curated promenade dining, and smart wellness club.',
      ar: 'مجتمع سكني بحري متكامل يضم شققاً فندقية فاخرة ومراسي خاصة لليخوت ومطاعم عالمية وممشى ساحلي ونادي صحي متطور.',
    },
    highlights: {
      en: [
        'Flexible Milestone Payment Plan',
        'Direct Access to Al Shobaily Bay Promenade',
        'Guaranteed 3-Year Rental Management Yield',
        'Full REGA Compliance & Certified Governance',
      ],
      ar: [
        'خطة سداد مرنة مرتبطة بمراحل الإنجاز',
        'وصول مباشر لممشى خليج الشبيلي والمارينا',
        'إدارة تأجير وتشغيل متكاملة بعوائد مجزية',
        'مرخص رسمياً ومعتمد من الهيئة العامة للعقار',
      ],
    },
  },
  {
    id: 'proj-2',
    title: {
      en: 'Dhahran Heights Executive Residential Club',
      ar: 'مرتفعات الظهران السكنية الفاخرة',
    },
    developer: {
      en: 'Eastern Province Luxury Properties Fund',
      ar: 'صندوق التطوير العقاري الفاخر بالمنطقة الشرقية',
    },
    location: {
      en: 'King Saud Road, Dhahran / Al Dana',
      ar: 'طريق الملك سعود، الظهران / حي الدانة',
    },
    startingPriceSAR: '7,875,000 SAR',
    handoverDate: { en: 'Q2 2026', ar: 'الربع الثاني 2026' },
    unitsTotal: 48,
    unitsAvailable: 9,
    roiProjected: '11.4% Projected Appreciation',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    category: { en: 'Gated Luxury Mansions', ar: 'فلل وقصور مستقلة بمجمع مغلق' },
    description: {
      en: 'An exclusive gated community comprising modern architectural villas, private clubhouses, and central green parks adjacent to Dhahran business district.',
      ar: 'مجمع سكني خاص مغلق يضم قصوراً وفللاً فاخرة بتصاميم معمارية فريدة ومساحات خضراء شاسعة بالقرب من مراكز الأعمال في الظهران.',
    },
    highlights: {
      en: [
        'Private 18-Hole Championship Golf Proximity',
        'Dedicated Private Chauffeur & Concierge Suite',
        'High-Ceiling Solar & Smart Micro-Grid Design',
        'Comprehensive REGA Developer Security Bond',
      ],
      ar: [
        'بالقرب من ملاعب الجولف والأندية الخاصة',
        'خدمات استقبال واستقبال ضيوف على مدار الساعة',
        'تصميم بيئي ذكي يعتمد على الطاقة المستدامة',
        'ضمانات إنشائية واعتمادات موثقة من الهيئة العامة للعقار',
      ],
    },
  },
  {
    id: 'proj-3',
    title: {
      en: 'Dammam Marina Crystal Residences',
      ar: 'أبراج مارينا الدمام الكريستالية',
    },
    developer: {
      en: 'HARD Capital & Real Estate Marketing',
      ar: 'هارد كابيتال للتسويق والتطوير العقاري',
    },
    location: {
      en: 'Corniche Al Shati, Dammam',
      ar: 'كورنيش حي الشاطئ، الدمام',
    },
    startingPriceSAR: '3,262,500 SAR',
    handoverDate: { en: 'Q1 2027', ar: 'الربع الأول 2027' },
    unitsTotal: 160,
    unitsAvailable: 28,
    roiProjected: '8.9% High Rental Demand',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    category: { en: 'Waterfront Sky Residences', ar: 'شقق وأجنحة بحرية فاخرة' },
    description: {
      en: 'Iconic crystal-glass high-rise residences along Dammam waterfront featuring sky lounges, infinity ocean pools, and commercial boardwalk.',
      ar: 'أبراج سكنية زجاجية شاهقة على واجهة الدمام البحرية تتميز بصالات سكاي لاونج ومسابح معلقة وممشى تجاري فاخر.',
    },
    highlights: {
      en: [
        'Unobstructed Direct Arabian Gulf Views',
        '10% Down Payment with Easy Installments',
        'EV Charging & Smart Parking for Every Unit',
        'Official Escrow & Certified REGA Standards',
      ],
      ar: [
        'إطلالات بحرية مفتوحة ومباشرة على الخليج العربي',
        'دفعة أولى 10% وأقساط ميسرة',
        'محطات شحن سيارات كهربائية ومواقف ذكية لكل وحدة',
        'حساب ضمان معتمد وتوثيق رسمي لدى الهيئة العامة للعقار',
      ],
    },
  },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: {
      en: 'Eastern Province Real Estate Outlook 2025: Khobar & Dammam Growth Corridors',
      ar: 'آفاق السوق العقاري في المنطقة الشرقية 2025: محاور النمو في الخُبر والدمام',
    },
    excerpt: {
      en: 'An in-depth market report examining luxury capital appreciation, rental yield dynamics, and infrastructure investments across Eastern Province.',
      ar: 'تقرير شامل يحلل نمو العوائد الاستثمارية وارتفاع القيمة الرأسمالية ومشاريع البنية التحتية العملاقة في المنطقة الشرقية.',
    },
    category: { en: 'Market Intelligence', ar: 'دراسات وتقارير السوق' },
    date: 'August 12, 2025',
    readTime: { en: '6 min read', ar: 'قراءة 6 دقائق' },
    author: { en: 'Faisal Al-Otaibi', ar: 'فيصل العتيبي' },
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    content: {
      en: 'The Eastern Province real estate ecosystem is experiencing unprecedented structural momentum driven by Vision 2030 initiatives, industrial expansion in Dhahran and Jubail, and robust demand for prime coastal waterfront properties in Al Khobar...',
      ar: 'يشهد القطاع العقاري في المنطقة الشرقية زخماً استثنائياً مدفوعاً بمبادرات رؤية المملكة 2030 وتوسع مشاريع الطاقة والتقنية بالظهران، وزيادة الطلب على العقارات والواجهات البحرية الفاخرة في الخُبر والدمام...',
    },
  },
  {
    id: 'post-2',
    title: {
      en: 'Navigating REGA & FAL Brokerage Regulations in Saudi Arabia',
      ar: 'دليل المستثمر للوائح الهيئة العامة للعقار ورخص الوساطة (فال)',
    },
    excerpt: {
      en: 'Essential legal considerations, escrow protection frameworks, and compliance standards for foreign and local investors in Saudi real estate.',
      ar: 'أبرز الإرشادات القانونية والضمانات البنكية وحماية العقود عبر منصات الهيئة العامة للعقار وبرنامج إيجار.',
    },
    category: { en: 'Regulatory Insights', ar: 'إرشادات وتنظيمات عقارية' },
    date: 'July 28, 2025',
    readTime: { en: '5 min read', ar: 'قراءة 5 دقائق' },
    author: { en: 'Reem Al-Qahtani', ar: 'ريم القحطاني' },
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    content: {
      en: 'Transparency and investor protection in Saudi Arabia have reached world-class standards through REGA licensing and Ejar contract authentication...',
      ar: 'وصلت معايير الشفافية وحماية المستثمر العقاري في المملكة العربية السعودية إلى مستويات عالمية رائدة بفضل تنظيمات الهيئة العامة للعقار وتوثيق العقود الإلكترونية...',
    },
  },
  {
    id: 'post-3',
    title: {
      en: 'Why Luxury Waterfront Living in Al Shobaily & Khobar Corniche Outperforms',
      ar: 'لماذا تتفوق العقارات الساحلية في الشبيلي وكورنيش الخُبر استثمارياً؟',
    },
    excerpt: {
      en: 'A strategic review of capital growth, high occupancy rates, and lifestyle premium in Eastern Province coastal communities.',
      ar: 'تحليل مقارن لمعدلات الإشغال وارتفاع القيمة الإيجارية في المشاريع والواجهات البحرية بالمنطقة الشرقية.',
    },
    category: { en: 'Investment Strategy', ar: 'استراتيجيات الاستثمار' },
    date: 'June 30, 2025',
    readTime: { en: '4 min read', ar: 'قراءة 4 دقائق' },
    author: { en: 'Sultan Al-Ghamdi', ar: 'سلطان الغامدي' },
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    content: {
      en: 'Coastal properties in Al Khobar command the highest tenant retention and premium pricing across the Eastern Province...',
      ar: 'تسجل العقارات البحرية في الخُبر أعلى نسب إقبال واستقرار إيجاري بالمنطقة الشرقية بفضل جودة الحياة والبيئة الترفيهية المتكاملة...',
    },
  },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: { en: 'Eng. Khalid Al-Zahrani', ar: 'م. خالد الزهراني' },
    role: { en: 'Managing Director, Energy Investments', ar: 'مدير تنفيذي لاستثمارات الطاقة' },
    location: { en: 'Dhahran / Al Khobar', ar: 'الظهران / الخُبر' },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    quote: {
      en: 'Listing my luxury villa in Al Khobar with HARD was the best decision. Their cinematic media marketing and verified buyer network brought 3 qualified cash offers in under two weeks. We closed smoothly above our initial reserve price.',
      ar: 'كان عرض قصرنا في الخُبر مع شركة هارد للعقارات أفضل قرار اتخذته. حملتهم الإعلامية السينمائية وشبكة المشترين المعتمدين حققت 3 عروض شراء نقدية خلال أقل من أسبوعين، وتم الإفراغ بسلاسة تفوق توقعاتنا.',
    },
    dealHighlight: {
      en: 'Sold Khobar Waterfront Villa in 11 Days',
      ar: 'بيع فيلا كورنيش الخُبر في 11 يوماً',
    },
    category: 'seller',
  },
  {
    id: 'test-2',
    name: { en: 'Dr. Fatima Al-Mansoor', ar: 'د. فاطمة المنصور' },
    role: { en: 'Healthcare Executive & Portfolio Investor', ar: 'مستثمرة عقارية وقيادية في القطاع الصحي' },
    location: { en: 'Dammam / Riyadh', ar: 'الدمام / الرياض' },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    quote: {
      en: 'As an active investor acquiring prime residential towers and commercial land in the Eastern Province, the market intelligence and REGA-verified transaction advisory provided by HARD were truly exceptional.',
      ar: 'بصفتي مستثمرة في الأراضي والمجمعات السكنية بالمنطقة الشرقية، كانت دراسات السوق والوساطة الاحترافية الموثقة عبر منصات الهيئة العامة للعقار مع هارد على أعلى مستوى من الدقة والاحترافية.',
    },
    dealHighlight: {
      en: 'Acquired 2 Prime Waterfront Assets (28M SAR)',
      ar: 'شراء أصلين بحريين فاخرين بقيمة 28 مليون ريال',
    },
    category: 'investor',
  },
  {
    id: 'test-3',
    name: { en: 'Mark & Sarah Thompson', ar: 'مارك وسارة طومسون' },
    role: { en: 'Executive Relocation Clients', ar: 'عائلة تنفيذية مقيمة بالمنطقة الشرقية' },
    location: { en: 'Dhahran Hills / London', ar: 'تلال الظهران / لندن' },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    quote: {
      en: 'Relocating to Saudi Arabia, navigating local title registries and neighborhood selections seemed daunting. The advisors at HARD guided us through every step, finding our dream family home in Dhahran Hills completely hassle-free.',
      ar: 'أثناء انتقالنا للعمل في المملكة، ساعدنا فريق هارد في اختيار الحي المثالي واستكمال كافة إجراءات التوثيق السكني بسلاسة تامة وشفافية مطلقة في تلال الظهران.',
    },
    dealHighlight: {
      en: 'Family Home in Dhahran Hills',
      ar: 'شراء منزل عائلي فاخر في تلال الظهران',
    },
    category: 'buyer',
  },
];

export const mockServices: ServiceDetail[] = [
  {
    id: 'serv-1',
    slug: 'prime-residential-brokerage',
    tag: { en: 'Luxury Sales & Acquisitions', ar: 'وساطة واستحواذ العقارات الفاخرة' },
    title: {
      en: 'Prime Residential Brokerage & Portfolio Advisory',
      ar: 'الوساطة العقارية المعتمدة وإدارة المحافظ السكنية',
    },
    subtitle: {
      en: 'Discreet acquisition and disposition of exceptional waterfront villas, penthouses, and private estates.',
      ar: 'خدمات وساطة واستشارات تملك متخصصة للقصور والفلل البحرية والشقق الفاخرة بالمنطقة الشرقية.',
    },
    description: {
      en: 'Our certified real estate advisors represent high-net-worth individuals, family offices, and discerning investors across Khobar, Dhahran, and Dammam with unmatched market intelligence and REGA compliance.',
      ar: 'يقدم مستشارونا المعتمدون خدمات الوساطة والاستشارة للمستثمرين وكبرى العائلات في الخُبر والظهران والدمام وفق أعلى معايير الشفافية وتنظيمات الهيئة العامة للعقار.',
    },
    features: [
      {
        title: { en: 'REGA & FAL Certified Advisory', ar: 'وساطة معتمدة وتراخيص فال الرسمية' },
        desc: {
          en: '100% compliant transactions with authentic electronic title transfers and escrow protocols.',
          ar: 'صفقات نظامية متوافقة بالكامل مع التوثيق الإلكتروني وحسابات الضمان المعتمدة.',
        },
      },
      {
        title: { en: 'Exclusive Off-Market Collection', ar: 'عقارات وقصور حصرية غير معلنة' },
        desc: {
          en: 'Direct access to ultra-prime private estates and coastal compounds reserved for pre-qualified buyers.',
          ar: 'وصول مباشر لعقارات وقصور خاصة نادرة مخصصة لكبار المشترين والمستثمرين المؤهلين.',
        },
      },
      {
        title: { en: 'End-to-End Closing Concierge', ar: 'إفراغ وتوثيق متكامل وسريع' },
        desc: {
          en: 'Dedicated legal and documentation team ensuring swift title transfers and verified bank escrow settlements.',
          ar: 'فريق قانوني وإداري متخصص يتابع كافة إجراءات الإفراغ العقاري والضمانات البنكية.',
        },
      },
    ],
    stats: [
      { value: '15M+ SAR', label: { en: 'Volume Transacted', ar: 'حجم الصفقات المنجزة' } },
      { value: '98.7%', label: { en: 'Client Satisfaction', ar: 'نسبة رضا العملاء' } },
      { value: '14 Days', label: { en: 'Avg. Closing Time', ar: 'متوسط مدة الإفراغ' } },
    ],
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    actionText: { en: 'Explore Prime Properties', ar: 'تصفح العقارات الفاخرة' },
    actionType: 'properties',
  },
  {
    id: 'serv-2',
    slug: 'cinematic-property-marketing',
    tag: { en: 'Omnichannel Marketing', ar: 'التسويق العقاري السينمائي المتكامل' },
    title: {
      en: 'Global Exposure & Bespoke Media Production',
      ar: 'تسويق عقاري سينمائي وحملات ترويجية مستهدفة',
    },
    subtitle: {
      en: 'Elevate your property above the market with 4K drone cinematography, 3D architectural tours, and targeted campaigns.',
      ar: 'إبراز قيمة عقارك عبر إنتاج سينمائي بدقة 4K وتصوير جوي وجولات ثلاثية الأبعاد وحملات رقمية كبرى.',
    },
    description: {
      en: 'We craft comprehensive multimedia campaigns that present your property as an irreplaceable lifestyle asset, reaching thousands of verified GCC and international qualified buyers.',
      ar: 'نصمم حملات تسويقية متكاملة تبرز التفاصيل المعمارية الاستثنائية لعقارك وتصل إلى آلاف المشترين الجادين في السعودية والخليج.',
    },
    features: [
      {
        title: { en: '4K Drone & Architectural Video', ar: 'تصوير جوي وسينمائي معماري 4K' },
        desc: {
          en: 'Bespoke storytelling capturing the prime coastal location, interior finishes, and surrounding lifestyle.',
          ar: 'سرد بصري سينمائي يبرز الموقع الساحلي المميز وجودة التشطيبات وأنماط الحياة المحيطة.',
        },
      },
      {
        title: { en: 'Targeted High-Net-Worth Reach', ar: 'وصول مباشر لشرائح المشترين المستهدفين' },
        desc: {
          en: 'Data-driven private syndication across premium channels, investor portals, and VIP networks.',
          ar: 'نشر موجه عبر المنصات الاستثمارية الرائدة وشبكات المستثمرين وكبار العملاء.',
        },
      },
      {
        title: { en: 'Real-Time Performance Dashboard', ar: 'تقارير أداء ومؤشرات تفاعل لحظية' },
        desc: {
          en: 'Weekly analytics on inquiries, qualified viewing appointments, and buyer feedback.',
          ar: 'تقارير أسبوعية تفصيلية عن المشاهدات وطلبات المعاينة الجادة والعروض المقدمة.',
        },
      },
    ],
    stats: [
      { value: '1.7M+', label: { en: 'Monthly Impressions', ar: 'مشاهدة شهرية لحملاتنا' } },
      { value: '20 Days', label: { en: 'Avg. Time to Offer', ar: 'متوسط استلام أول عرض' } },
      { value: '100%', label: { en: 'REGA Compliant Ads', ar: 'إعلانات مرخصة وموثقة' } },
    ],
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    actionText: { en: 'List Your Property With Us', ar: 'اعرض عقارك معنا' },
    actionType: 'list-property',
  },
  {
    id: 'serv-3',
    slug: 'investment-advisory-developments',
    tag: { en: 'Strategic Investment Advisory', ar: 'الاستشارات والاستثمار العقاري الاستراتيجي' },
    title: {
      en: 'High-Yield Investment Advisory & Master Developments',
      ar: 'استشارات الاستثمار العقاري والمشاريع التطويرية الكبرى',
    },
    subtitle: {
      en: 'Data-driven insights to maximize capital appreciation and rental yield across master developments.',
      ar: 'تحليلات بيانات استثمارية لتعظيم العائد الإيجاري والنمو الرأسمالي في كبرى المخططات والمشاريع.',
    },
    description: {
      en: 'We evaluate market cycles, rental benchmarks, and infrastructure growth corridors in the Eastern Province to identify lucrative commercial and income-generating opportunities.',
      ar: 'نحلل دورات السوق ومؤشرات الإيجارات ومحاور التوسع العمراني بالمنطقة الشرقية لاقتناص أفضل الفرص الاستثمارية الواعدة.',
    },
    features: [
      {
        title: { en: 'Comprehensive Yield & ROI Modeling', ar: 'نماذج مالية دقيقة للعائد الاستثماري' },
        desc: {
          en: 'Detailed cash-flow forecasts, projected appreciation curves, and exit strategy recommendations.',
          ar: 'توقعات دقيقة للتدفقات النقدية ومنحنيات نمو القيمة الرأسمالية واستراتيجيات الخروج.',
        },
      },
      {
        title: { en: 'Prime Master Project Allocation', ar: 'أولوية الحجز في كبرى المشاريع والمخططات' },
        desc: {
          en: 'First-phase allocation and preferential pricing in flagship waterfront and urban developments.',
          ar: 'تخصيص مبكر وأسعار تفضيلية في المرحلة الأولى لأبرز المشاريع السكنية والتجارية.',
        },
      },
      {
        title: { en: 'Turnkey Portfolio Management', ar: 'إدارة أصول وتشغيل إيجاري شامل' },
        desc: {
          en: 'Post-handover tenant acquisition, rent collection, and property maintenance coordination.',
          ar: 'خدمات ما بعد الاستلام وتأجير الوحدات وتحصيل الإيجارات ومتابعة الصيانة الدورية.',
        },
      },
    ],
    stats: [
      { value: '8.9%', label: { en: 'Avg. Gross Yield', ar: 'متوسط العائد الإيجاري' } },
      { value: '12+', label: { en: 'Master Projects', ar: 'مشروع رئيسي معتمد' } },
      { value: '100%', label: { en: 'REGA Compliant', ar: 'معتمد وموثق نظاماً' } },
    ],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    actionText: { en: 'Explore New Projects', ar: 'استكشف المشاريع الجديدة' },
    actionType: 'projects',
  },
];

export const mockSubscribers: JoinListSubscriber[] = [
  {
    id: 'sub-1',
    email: 'khalid.alzahrani@energycap.sa',
    createdAt: '2026-08-18T10:30:00.000Z',
    status: 'active',
    source: 'Website Footer',
    notes: 'Interested in Al Khobar luxury villas and off-plan launches',
  },
  {
    id: 'sub-2',
    email: 'dr.fatima.investments@gmail.com',
    createdAt: '2026-08-16T14:15:00.000Z',
    status: 'active',
    source: 'Website Footer',
    notes: 'Commercial portfolios and waterfront assets',
  },
  {
    id: 'sub-3',
    email: 'mark.thompson@aramco.com',
    createdAt: '2026-08-12T09:00:00.000Z',
    status: 'active',
    source: 'Website Footer',
    notes: 'Family residential inquiries in Dhahran Hills',
  },
  {
    id: 'sub-4',
    email: 'sara.alotaibi@ventureeast.com',
    createdAt: '2026-08-05T18:45:00.000Z',
    status: 'active',
    source: 'Website Footer',
    notes: 'Off-market VIP listings & weekly index report',
  },
  {
    id: 'sub-5',
    email: 'tariq.alghmdi@realestate-sa.org',
    createdAt: '2026-07-28T11:20:00.000Z',
    status: 'unsubscribed',
    source: 'Website Footer',
    notes: 'Unsubscribed on 2026-08-10',
  },
];
