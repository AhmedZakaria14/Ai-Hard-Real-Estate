import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebase';

export interface AdminProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'superadmin' | 'admin' | 'editor';
  createdAt: string;
}

export interface CmsSectionData {
  sectionId: string;
  sector: 'portal' | 'realestate' | 'construction' | 'hvac' | 'global';
  published: Record<string, any>;
  draft: Record<string, any>;
  updatedAt: string;
  updatedBy?: string;
  isPublished?: boolean;
}

// ==============================================================================
// 1. FIREBASE AUTHENTICATION & ADMIN ROLES
// ==============================================================================

export async function loginAdmin(email: string, pass: string): Promise<AdminProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const uid = userCredential.user.uid;

  // Fetch role profile from /users/{uid}
  const userRef = doc(db, 'users', uid);
  let snap = await getDoc(userRef);

  if (!snap.exists()) {
    // Bootstrap initial admin record
    const newProfile: AdminProfile = {
      uid,
      email,
      displayName: userCredential.user.displayName || email.split('@')[0],
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }

  return snap.data() as AdminProfile;
}

export async function logoutAdmin(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeAuth(callback: (user: AdminProfile | null) => void) {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        callback(snap.data() as AdminProfile);
      } else {
        const fallbackProfile: AdminProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'CMS Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        callback(fallbackProfile);
      }
    } catch {
      callback({
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'CMS Admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    }
  });
}

// Bootstrap default superadmin if needed
export async function bootstrapAdminAccount(): Promise<void> {
  try {
    const adminEmail = 'admin@hard.sa';
    const adminPass = 'HardGroup2026!';
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPass);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          email: adminEmail,
          displayName: 'HARD Executive Admin',
          role: 'superadmin',
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (e) {
    // Auth bootstrap handled safely
  }
}

// ==============================================================================
// 2. CLOUD STORAGE MEDIA UPLOADS
// ==============================================================================

export async function uploadCmsFile(file: File, folder: string = 'cms_assets'): Promise<string> {
  try {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Storage upload fallback to Data URL:', error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

// ==============================================================================
// 3. CMS SITE CONTENT (Draft & Publish Workflow)
// ==============================================================================

export async function getCmsSection(sectionId: string): Promise<CmsSectionData | null> {
  try {
    const docRef = doc(db, 'site_content', sectionId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CmsSectionData;
    }
    return null;
  } catch (e) {
    console.error('Error fetching CMS section:', e);
    return null;
  }
}

export function subscribeCmsSection(
  sectionId: string,
  callback: (data: CmsSectionData | null) => void
) {
  const docRef = doc(db, 'site_content', sectionId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as CmsSectionData);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn(`Firestore listener warning for ${sectionId}:`, err);
    }
  );
}

export async function saveCmsSectionDraft(
  sectionId: string,
  sector: CmsSectionData['sector'],
  draftContent: Record<string, any>,
  updatedBy: string = 'CMS User'
): Promise<void> {
  const docRef = doc(db, 'site_content', sectionId);
  const existingSnap = await getDoc(docRef);

  if (existingSnap.exists()) {
    await updateDoc(docRef, {
      draft: draftContent,
      updatedAt: new Date().toISOString(),
      updatedBy,
    });
  } else {
    await setDoc(docRef, {
      sectionId,
      sector,
      published: draftContent, // Default initial publish
      draft: draftContent,
      updatedAt: new Date().toISOString(),
      updatedBy,
      isPublished: true,
    });
  }
}

export async function publishCmsSection(
  sectionId: string,
  updatedBy: string = 'CMS User'
): Promise<void> {
  const docRef = doc(db, 'site_content', sectionId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data() as CmsSectionData;
    const currentDraft = data.draft || data.published;
    await updateDoc(docRef, {
      published: currentDraft,
      updatedAt: new Date().toISOString(),
      updatedBy,
      isPublished: true,
    });
  }
}

// ==============================================================================
// 4. FIRESTORE INGESTION (Leads, Bookings, Newsletter)
// ==============================================================================

export async function saveLeadToFirestore(leadData: {
  name: string;
  email: string;
  phone: string;
  sector: 'realestate' | 'construction' | 'hvac' | 'general';
  type: string;
  details?: Record<string, any>;
}): Promise<{ id: string; trackingCode: string }> {
  const trackingCode = `LEAD-${Math.floor(100000 + Math.random() * 900000)}`;
  const leadId = `lead-${Date.now()}`;
  const docRef = doc(db, 'leads', leadId);

  const payload = {
    id: leadId,
    trackingCode,
    name: leadData.name.trim(),
    email: leadData.email.trim(),
    phone: leadData.phone.trim(),
    sector: leadData.sector,
    type: leadData.type,
    details: leadData.details || {},
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload);
  return { id: leadId, trackingCode };
}

export async function saveSubscriberToFirestore(
  email: string,
  source: string = 'Website Footer'
): Promise<{ id: string }> {
  const subId = `sub-${Date.now()}`;
  const docRef = doc(db, 'subscribers', subId);

  const payload = {
    id: subId,
    email: email.trim(),
    source,
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload);
  return { id: subId };
}

export function subscribeLeadsList(callback: (leads: any[]) => void) {
  const colRef = collection(db, 'leads');
  return onSnapshot(colRef, (snap) => {
    const items = snap.docs.map((doc) => doc.data());
    callback(items);
  });
}

export function subscribeSubscribersList(callback: (subs: any[]) => void) {
  const colRef = collection(db, 'subscribers');
  return onSnapshot(colRef, (snap) => {
    const items = snap.docs.map((doc) => doc.data());
    callback(items);
  });
}
