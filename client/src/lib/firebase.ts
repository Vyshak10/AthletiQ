import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Log environment variables to debug (values will be hidden in production)
console.log('Firebase Config Environment Variables Available:');
console.log('API Key exists:', !!import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Auth Domain exists:', !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('Project ID exists:', !!import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log('Storage Bucket exists:', !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
console.log('Messaging Sender ID exists:', !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
console.log('App ID exists:', !!import.meta.env.VITE_FIREBASE_APP_ID);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
console.log('Initializing Firebase with config');
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);