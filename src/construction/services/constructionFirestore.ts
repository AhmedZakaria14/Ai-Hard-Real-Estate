import { saveSectorSection, subscribeSectorSection } from '../../lib/db/hardSectorSections';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  ConstructionProject,
  ConstructionService,
  ConstructionQuoteLead,
  ConstructionLanguage,
} from '../types';
import { INITIAL_PROJECTS } from '../data/seedData';
import { sanitizePayload, withServerTimestamps } from '../../lib/firebase/serializers';

export * from './sectionDefaults';

// --- Firestore Collection Subscriptions ---

/**
 * Subscribes to construction projects in Firestore.
 */
export function subscribeConstructionProjects(
  callback: (projects: ConstructionProject[]) => void
): Unsubscribe {
  const colRef = collection(db, 'construction_projects');
  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        // Auto-seed if collection does not exist yet
        seedConstructionProjects().then(() => {
          callback(INITIAL_PROJECTS);
        });
        return;
      }
      const list: ConstructionProject[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          titleAr: data.titleAr || '',
          titleEn: data.titleEn || '',
          category: data.category || 'residential',
          status: data.status || 'in-progress',
          locationAr: data.locationAr || '',
          locationEn: data.locationEn || '',
          cityAr: data.cityAr || 'الرياض',
          cityEn: data.cityEn || 'Riyadh',
          year: data.year || '2025',
          buaM2: Number(data.buaM2) || 0,
          durationMonths: Number(data.durationMonths) || 12,
          valueSAR: data.valueSAR || '',
          clientAr: data.clientAr || '',
          clientEn: data.clientEn || '',
          image: data.image || '',
          galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
          descriptionAr: data.descriptionAr || '',
          descriptionEn: data.descriptionEn || '',
          scopeAr: Array.isArray(data.scopeAr) ? data.scopeAr : [],
          scopeEn: Array.isArray(data.scopeEn) ? data.scopeEn : [],
          structuralSystemAr: data.structuralSystemAr || '',
          structuralSystemEn: data.structuralSystemEn || '',
          finishingLevelAr: data.finishingLevelAr || '',
          finishingLevelEn: data.finishingLevelEn || '',
          highlightsAr: Array.isArray(data.highlightsAr) ? data.highlightsAr : [],
          highlightsEn: Array.isArray(data.highlightsEn) ? data.highlightsEn : [],
          featured: Boolean(data.featured),
        };
      });
      callback(list);
    },
    (err) => {
      console.warn('[subscribeConstructionProjects] Firestore read fallback:', err);
      callback(INITIAL_PROJECTS);
    }
  );
}

/**
 * Seeds initial construction projects to Firestore.
 */
export async function seedConstructionProjects(): Promise<void> {
  try {
    for (const proj of INITIAL_PROJECTS) {
      const docRef = doc(db, 'construction_projects', proj.id);
      await setDoc(docRef, sanitizePayload(proj), { merge: true });
    }
  } catch (e) {
    console.warn('[seedConstructionProjects] Error seeding projects:', e);
  }
}

/**
 * Saves or updates a construction project in Firestore.
 */
export async function saveConstructionProject(proj: ConstructionProject): Promise<void> {
  const docRef = doc(db, 'construction_projects', proj.id);
  await setDoc(docRef, withServerTimestamps(sanitizePayload(proj)), { merge: true });
}

/**
 * Deletes a construction project from Firestore.
 */
export async function deleteConstructionProject(id: string): Promise<void> {
  const docRef = doc(db, 'construction_projects', id);
  await deleteDoc(docRef);
}

/**
 * Subscribes to Hero & Company content sections in Supabase.
 */
export function subscribeConstructionSectionContent<T>(
  sectionKey: 'hero' | 'company' | 'stages' | 'offices',
  defaultFallback: T,
  callback: (data: T) => void
): Unsubscribe {
  return subscribeSectorSection({ sector: 'construction', key: sectionKey }, defaultFallback, callback);
}

/**
 * Saves a construction content section in Firestore.
 */
export async function saveConstructionSectionContent<T extends object>(
  sectionKey: 'hero' | 'company' | 'stages' | 'offices',
  data: T
): Promise<void> {
  await saveSectorSection({ sector: 'construction', key: sectionKey }, data);
}

/**
 * Subscribes to Construction Quote Leads in Firestore.
 */
export function subscribeConstructionLeads(
  callback: (leads: ConstructionQuoteLead[]) => void
): Unsubscribe {
  const colRef = collection(db, 'construction_leads');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: ConstructionQuoteLead[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ConstructionQuoteLead, 'id'>),
      }));
      callback(list);
    },
    (err) => {
      console.warn('[subscribeConstructionLeads] Error reading leads:', err);
      callback([]);
    }
  );
}

/**
 * Saves a new Construction Quote Lead to Firestore.
 */
export async function saveConstructionLead(
  leadData: ConstructionQuoteLead
): Promise<void> {
  const docRef = doc(db, 'construction_leads', leadData.id);
  await setDoc(docRef, withServerTimestamps(sanitizePayload(leadData)));
}

/**
 * Updates a lead status in Firestore.
 */
export async function updateConstructionLeadStatusInDb(
  id: string,
  status: ConstructionQuoteLead['status'],
  adminNotes?: string
): Promise<void> {
  const docRef = doc(db, 'construction_leads', id);
  const updatePayload: Record<string, any> = { status };
  if (adminNotes !== undefined) {
    updatePayload.adminNotes = adminNotes;
  }
  await updateDoc(docRef, withServerTimestamps(updatePayload));
}

/**
 * Deletes a lead in Firestore.
 */
export async function deleteConstructionLeadInDb(id: string): Promise<void> {
  const docRef = doc(db, 'construction_leads', id);
  await deleteDoc(docRef);
}
