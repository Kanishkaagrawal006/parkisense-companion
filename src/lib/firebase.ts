import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Replace these values with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAcwvTtVY1GFSCLQIG7WpQwactDFGX5n6M",
  authDomain: "parkisense-companion-5e7d4.firebaseapp.com",
  projectId: "parkisense-companion-5e7d4",
  storageBucket: "parkisense-companion-5e7d4.firebasestorage.app",
  messagingSenderId: "576763392542",
  appId: "1:576763392542:web:47c1851af2301674d8740f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Setup reCAPTCHA verifier for phone auth
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA verified');
    },
  });
  return recaptchaVerifier;
};

export default app;
