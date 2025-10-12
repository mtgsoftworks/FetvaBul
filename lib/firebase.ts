import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore, doc, getDoc, updateDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore';

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

const siteStatsDoc = doc(db, 'site_stats', 'global');
const searchStatsDoc = doc(db, 'site_stats', 'search');

let analyticsPromise: Promise<ReturnType<typeof getAnalytics> | null> | null = null;
if (typeof window !== 'undefined') {
  analyticsPromise = isSupported().then(supported => (supported ? getAnalytics(app) : null));
}

// Görüntüleme sayısı yönetimi için fonksiyonlar
export async function incrementViewCount(fetvaId: string): Promise<number> {
  try {
    const fetvaRef = doc(db, 'fetvas', fetvaId);
    const fetvaDoc = await getDoc(fetvaRef);
    
    if (fetvaDoc.exists()) {
      // Mevcut dokümanı güncelle
      await updateDoc(fetvaRef, {
        views: increment(1),
        lastViewedAt: serverTimestamp()
      });
      return (fetvaDoc.data().views || 0) + 1;
    } else {
      // Yeni doküman oluştur
      await setDoc(fetvaRef, {
        id: fetvaId,
        views: 1,
        createdAt: serverTimestamp(),
        lastViewedAt: serverTimestamp()
      });
      return 1;
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
    throw error;
  }
}

export async function getViewCount(fetvaId: string): Promise<number> {
  try {
    const fetvaRef = doc(db, 'fetvas', fetvaId);
    const fetvaDoc = await getDoc(fetvaRef);
    
    if (fetvaDoc.exists()) {
      return fetvaDoc.data().views || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting view count:', error);
    return 0;
  }
}

export async function incrementSiteViewCount(): Promise<number> {
  try {
    const siteStatsSnapshot = await getDoc(siteStatsDoc);

    if (siteStatsSnapshot.exists()) {
      await updateDoc(siteStatsDoc, {
        homepageViews: increment(1),
        updatedAt: serverTimestamp()
      });
      const current = siteStatsSnapshot.data()?.homepageViews ?? 0;
      return Number.isFinite(current) ? current + 1 : 1;
    }

    await setDoc(siteStatsDoc, {
      homepageViews: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return 1;
  } catch (error) {
    console.error('Error incrementing site view count:', error);
    throw error;
  }
}

export async function getSiteViewCount(): Promise<number> {
  try {
    const siteStatsSnapshot = await getDoc(siteStatsDoc);
    if (siteStatsSnapshot.exists()) {
      const value = siteStatsSnapshot.data()?.homepageViews;
      return typeof value === 'number' && Number.isFinite(value) ? value : 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting site view count:', error);
    return 0;
  }
}

export async function incrementSearchCount(): Promise<number> {
  try {
    const snapshot = await getDoc(searchStatsDoc);

    if (snapshot.exists()) {
      await updateDoc(searchStatsDoc, {
        totalSearches: increment(1),
        updatedAt: serverTimestamp(),
      });
      const current = snapshot.data()?.totalSearches ?? 0;
      return Number.isFinite(current) ? current + 1 : 1;
    }

    await setDoc(searchStatsDoc, {
      totalSearches: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return 1;
  } catch (error) {
    console.error('Error incrementing search count:', error);
    throw error;
  }
}

export async function getSearchCount(): Promise<number> {
  try {
    const snapshot = await getDoc(searchStatsDoc);
    if (snapshot.exists()) {
      const value = snapshot.data()?.totalSearches;
      return typeof value === 'number' && Number.isFinite(value) ? value : 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting search count:', error);
    return 0;
  }
}

export { app, db, analyticsPromise as analytics };
