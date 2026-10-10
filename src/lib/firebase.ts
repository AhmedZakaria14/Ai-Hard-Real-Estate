import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import fallbackConfig from '../../firebase-applet-config.json';

// Environment-specific configuration with applet config fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || fallbackConfig.firestoreDatabaseId,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const storage: FirebaseStorage = getStorage(app);

// Connect Local Firebase Emulator Suite if configured
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
let emulatorsConnected = false;

if (useEmulator && !emulatorsConnected) {
  try {
    const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
    const firestoreHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost';
    const storageHost = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost';

    connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
    
    const [fsHost, fsPort] = firestoreHost.split(':');
    connectFirestoreEmulator(db, fsHost || 'localhost', Number(fsPort) || 8080);

    const [stHost, stPort] = storageHost.split(':');
    connectStorageEmulator(storage, stHost || 'localhost', Number(stPort) || 9199);

    emulatorsConnected = true;
    console.info('[Firebase Client] Connected to Local Firebase Emulator Suite');
  } catch (err) {
    console.warn('[Firebase Client] Emulator connection notice:', err);
  }
}

// Connection test per SKILL.md specification
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_check', 'ping'));
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firebase client is offline. Checking network parameters.');
      return false;
    }
    return true;
  }
}

// Auto test connection on import
validateFirestoreConnection().catch(() => {});
