import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDkStkaUFNloLc3Ji7vL_A_30Vcrp7dia0',
  authDomain: 'fetvabul-fdb31.firebaseapp.com',
  projectId: 'fetvabul-fdb31',
  storageBucket: 'fetvabul-fdb31.firebasestorage.app',
  messagingSenderId: '964601180247',
  appId: '1:964601180247:web:3b22acfb440882ea607312',
  measurementId: 'G-M9S8756XS8',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

let analyticsPromise: Promise<ReturnType<typeof getAnalytics> | null> | null = null;
if (typeof window !== 'undefined') {
  analyticsPromise = isSupported().then(supported => (supported ? getAnalytics(app) : null));
}

export { app, db, analyticsPromise as analytics };
