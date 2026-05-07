import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ══════════════════════════════════════════════
// ⚠️  מלא כאן את הפרטים מ-Firebase Console
//     Project Settings > General > Your apps > Web
// ══════════════════════════════════════════════
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDy7nFQ18weRFWGfUwJ74qCXHjjMHaPmvI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'shoppinglist-fb2ba.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shoppinglist-fb2ba',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'shoppinglist-fb2ba.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '302105837318',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:302105837318:web:c7cdfae863ed3e0701e887',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
