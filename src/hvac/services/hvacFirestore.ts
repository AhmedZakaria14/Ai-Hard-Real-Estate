import { saveSectorSection, subscribeSectorSection } from '../../lib/db/hardSectorSections';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  HVACService,
  HVACGalleryItem,
  HVACTestimonial,
  HVACFaqItem,
  HVACChecklistItem,
  HVACLead,
} from '../types';
import {
  initialServices,
  initialGallery,
  initialTestimonials,
  initialFaqs,
  summerChecklist as initialChecklist,
  initialSampleLeads,
} from '../data/initialData';
import { sanitizePayload, withServerTimestamps } from '../../lib/firebase/serializers';

export * from './sectionDefaults';

// --- Firestore Collection Subscriptions ---

/**
 * Subscribes to HVAC Services in Firestore.
 */
export function subscribeHVACServices(
  callback: (services: HVACService[]) => void
): Unsubscribe {
  const colRef = collection(db, 'hvac_services');
  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        seedHVACServices().then(() => callback(initialServices));
        return;
      }
      const list: HVACService[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          slug: data.slug || d.id,
          titleEn: data.titleEn || '',
          titleAr: data.titleAr || '',
          descriptionEn: data.descriptionEn || '',
          descriptionAr: data.descriptionAr || '',
          image: data.image || '',
          badgeEn: data.badgeEn || '',
          badgeAr: data.badgeAr || '',
          active: data.active !== false,
          sortOrder: Number(data.sortOrder) || 1,
        };
      });
      callback(list.sort((a, b) => a.sortOrder - b.sortOrder));
    },
    (err) => {
      console.warn('[subscribeHVACServices] Fallback to default:', err);
      callback(initialServices);
    }
  );
}

export async function seedHVACServices(): Promise<void> {
  try {
    for (const svc of initialServices) {
      const docRef = doc(db, 'hvac_services', svc.id);
      await setDoc(docRef, sanitizePayload(svc), { merge: true });
    }
  } catch (e) {
    console.warn('[seedHVACServices] Seed err:', e);
  }
}

export async function saveHVACServiceDoc(service: HVACService): Promise<void> {
  const docRef = doc(db, 'hvac_services', service.id);
  await setDoc(docRef, withServerTimestamps(sanitizePayload(service)), { merge: true });
}

export async function deleteHVACServiceDoc(id: string): Promise<void> {
  const docRef = doc(db, 'hvac_services', id);
  await deleteDoc(docRef);
}

/**
 * Subscribes to HVAC Section Content documents in Firestore.
 */
export function subscribeHVACSectionContent<T>(
  sectionKey: 'hero' | 'hours_contact' | 'booking_copy' | 'service_areas' | 'work_gallery' | 'maintenance_guide' | 'reviews',
  defaultFallback: T,
  callback: (data: T) => void
): Unsubscribe {
  return subscribeSectorSection({ sector: 'hvac', key: sectionKey }, defaultFallback, callback);
}

export async function saveHVACSectionContent<T extends object>(
  sectionKey: 'hero' | 'hours_contact' | 'booking_copy' | 'service_areas' | 'work_gallery' | 'maintenance_guide' | 'reviews',
  data: T
): Promise<void> {
  await saveSectorSection({ sector: 'hvac', key: sectionKey }, data);
}

/**
 * Subscribes to HVAC Gallery items.
 */
export function subscribeHVACGallery(
  callback: (gallery: HVACGalleryItem[]) => void
): Unsubscribe {
  const colRef = collection(db, 'hvac_gallery');
  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        callback(initialGallery);
        return;
      }
      const list: HVACGalleryItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<HVACGalleryItem, 'id'>),
      }));
      callback(list);
    },
    (err) => {
      console.warn('[subscribeHVACGallery] Fallback:', err);
      callback(initialGallery);
    }
  );
}

export async function saveHVACGalleryDoc(item: HVACGalleryItem): Promise<void> {
  const docRef = doc(db, 'hvac_gallery', item.id);
  await setDoc(docRef, withServerTimestamps(sanitizePayload(item)), { merge: true });
}

export async function deleteHVACGalleryDoc(id: string): Promise<void> {
  const docRef = doc(db, 'hvac_gallery', id);
  await deleteDoc(docRef);
}

/**
 * Subscribes to HVAC Testimonials in Firestore.
 */
export function subscribeHVACTestimonials(
  callback: (testimonials: HVACTestimonial[]) => void
): Unsubscribe {
  const colRef = collection(db, 'hvac_testimonials');
  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        callback(initialTestimonials);
        return;
      }
      const list: HVACTestimonial[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<HVACTestimonial, 'id'>),
      }));
      callback(list);
    },
    (err) => {
      console.warn('[subscribeHVACTestimonials] Fallback:', err);
      callback(initialTestimonials);
    }
  );
}

export async function saveHVACTestimonialDoc(item: HVACTestimonial): Promise<void> {
  const docRef = doc(db, 'hvac_testimonials', item.id);
  await setDoc(docRef, withServerTimestamps(sanitizePayload(item)), { merge: true });
}

export async function deleteHVACTestimonialDoc(id: string): Promise<void> {
  const docRef = doc(db, 'hvac_testimonials', id);
  await deleteDoc(docRef);
}

/**
 * Subscribes to HVAC Leads / Bookings in Firestore.
 */
export function subscribeHVACLeads(
  callback: (leads: HVACLead[]) => void
): Unsubscribe {
  const colRef = collection(db, 'hvac_leads');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: HVACLead[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<HVACLead, 'id'>),
      }));
      callback(list);
    },
    (err) => {
      console.warn('[subscribeHVACLeads] Error reading HVAC leads:', err);
      callback(initialSampleLeads);
    }
  );
}

export async function saveHVACLeadDoc(leadData: HVACLead): Promise<void> {
  const docRef = doc(db, 'hvac_leads', leadData.id);
  await setDoc(docRef, withServerTimestamps(sanitizePayload(leadData)));
}

export async function updateHVACLeadStatusDoc(
  id: string,
  status: HVACLead['status']
): Promise<void> {
  const docRef = doc(db, 'hvac_leads', id);
  await updateDoc(docRef, withServerTimestamps({ status }));
}

export async function deleteHVACLeadDoc(id: string): Promise<void> {
  const docRef = doc(db, 'hvac_leads', id);
  await deleteDoc(docRef);
}
