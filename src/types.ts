export type Language = 'en' | 'ar';

export type PageId =
  | 'portal'
  | 'home'
  | 'about'
  | 'properties'
  | 'property-details'
  | 'projects'
  | 'marketing'
  | 'blog'
  | 'contact'
  | 'construction'
  | 'hvac'
  | 'admin';

export type PropertyType = 'villa' | 'apartment' | 'penthouse' | 'townhouse' | 'commercial' | 'mansion';
export type ListingStatus = 'for-sale' | 'for-rent' | 'off-plan' | 'exclusive' | 'new-launch';

export interface Property {
  id: string;
  slug: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  location: {
    city: { en: string; ar: string };
    area: { en: string; ar: string };
    country: { en: string; ar: string };
    address: { en: string; ar: string };
    coordinates?: { lat: number; lng: number };
  };
  price: {
    sar: number;
    formattedSAR: string;
    period?: 'year' | 'month';
  };
  type: PropertyType;
  status: ListingStatus;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  areaSqM: number;
  featured: boolean;
  images: string[];
  amenities: {
    en: string[];
    ar: string[];
  };
  features: {
    yearBuilt: number;
    parkingSpaces: number;
    furnishing: { en: string; ar: string };
    view: { en: string; ar: string };
    completionDate?: string;
  };
  agent: {
    name: { en: string; ar: string };
    title: { en: string; ar: string };
    phone: string;
    whatsapp: string;
    email: string;
    avatar: string;
  };
}

export type ProjectStatus = 'planning' | 'off-plan' | 'under-construction' | 'completed' | 'handover';
export type BlogStatus = 'published' | 'draft' | 'archived';

export interface Project {
  id: string;
  slug?: string;
  title: { en: string; ar: string };
  developer: { en: string; ar: string };
  location: { en: string; ar: string };
  city?: { en: string; ar: string };
  startingPriceSAR: string;
  handoverDate: { en: string; ar: string };
  unitsTotal: number;
  unitsAvailable: number;
  roiProjected: string;
  image: string;
  gallery?: string[];
  category: { en: string; ar: string };
  status?: ProjectStatus;
  progressPercentage?: number;
  description: { en: string; ar: string };
  highlights: { en: string[]; ar: string[] };
  featured?: boolean;
}

export interface BlogPost {
  id: string;
  slug?: string;
  title: { en: string; ar: string };
  excerpt: { en: string; ar: string };
  category: { en: string; ar: string };
  date: string;
  readTime: { en: string; ar: string };
  author: { en: string; ar: string };
  authorRole?: { en: string; ar: string };
  authorAvatar?: string;
  image: string;
  content: { en: string; ar: string };
  status?: BlogStatus;
  featured?: boolean;
  tags?: string[];
}

export interface FilterState {
  searchQuery: string;
  status: string; // 'all' | 'for-sale' | 'for-rent' | 'off-plan'
  type: string;   // 'all' | PropertyType
  city: string;   // 'all' | string
  bedrooms: string; // 'all' | '1' | '2' | '3' | '4+'
  minPrice: number;
  maxPrice: number;
  currency: 'SAR';
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export interface ViewingBookingData {
  propertyId: string;
  propertyTitle: string;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  tourType: 'in-person' | 'virtual';
  notes?: string;
}

export interface PropertyListingData {
  ownerName: string;
  email: string;
  phone: string;
  userRole: 'owner' | 'investor' | 'developer' | 'broker';
  propertyType: PropertyType;
  listingType: 'sale' | 'rent';
  locationCity: string;
  expectedPrice: string;
  bedrooms: number;
  areaSize: string;
  notes?: string;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  inquiryType: 'buying' | 'renting' | 'listing' | 'investment' | 'consultation' | 'partnership';
  message: string;
}

export interface Testimonial {
  id: string;
  name: { en: string; ar: string };
  role: { en: string; ar: string };
  location: { en: string; ar: string };
  avatar: string;
  rating: number;
  quote: { en: string; ar: string };
  dealHighlight: { en: string; ar: string };
  category: 'buyer' | 'seller' | 'investor' | 'tenant';
  date?: string;
  featured?: boolean;
}

export interface JoinListSubscriber {
  id: string;
  email: string;
  createdAt: string;
  status: 'active' | 'unsubscribed';
  source: string;
  notes?: string;
}

export interface ServiceDetail {
  id: string;
  slug: string;
  tag: { en: string; ar: string };
  title: { en: string; ar: string };
  subtitle: { en: string; ar: string };
  description: { en: string; ar: string };
  features: {
    title: { en: string; ar: string };
    desc: { en: string; ar: string };
  }[];
  stats: {
    value: string;
    label: { en: string; ar: string };
  }[];
  image: string;
  actionText: { en: string; ar: string };
  actionType: 'properties' | 'list-property' | 'contact' | 'projects';
}

export interface PropertyFilterParams {
  city?: string;
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  priceRange?: string;
  searchQuery?: string;
  bedroom?: string;
}
