import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAcwvTtVY1GFSCLQIG7WpQwactDFGX5n6M",
  authDomain: "parkisense-companion-5e7d4.firebaseapp.com",
  projectId: "parkisense-companion-5e7d4",
  storageBucket: "parkisense-companion-5e7d4.firebasestorage.app",
  messagingSenderId: "576763392542",
  appId: "1:576763392542:web:47c1851af2301674d8740f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
