import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDkStkaUFNloLc3Ji7vL_A_30Vcrp7dia0',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'fetvabul-fdb31.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'fetvabul-fdb31',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'fetvabul-fdb31.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '964601180247',
  appId: process.env.FIREBASE_APP_ID || '1:964601180247:web:3b22acfb440882ea607312',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-M9S8756XS8',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

let analyticsPromise: Promise<ReturnType<typeof getAnalytics> | null> | null = null;
if (typeof window !== 'undefined') {
  analyticsPromise = isSupported().then(supported => (supported ? getAnalytics(app) : null));
}

export { app, db, analyticsPromise as analytics };
