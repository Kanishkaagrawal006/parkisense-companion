import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  ConfirmationResult,
  RecaptchaVerifier
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db, setupRecaptcha } from '@/lib/firebase';

type UserRole = 'patient' | 'doctor' | null;

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  age?: number;
  gender?: string;
  createdAt?: Date;
}

interface FirebaseAuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOTP: (phoneNumber: string, recaptchaContainerId: string) => Promise<{ error?: string; confirmationResult?: ConfirmationResult }>;
  verifyOTPAndSignUp: (otp: string, confirmationResult: ConfirmationResult, profile: Omit<UserProfile, 'id' | 'role' | 'createdAt'>) => Promise<{ error?: string }>;
  verifyOTPAndLogin: (otp: string, confirmationResult: ConfirmationResult) => Promise<{ error?: string }>;
  signUpDoctor: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  loginDoctor: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({
            id: fbUser.uid,
            name: data.name,
            role: data.role,
            phone: data.phone,
            email: data.email,
            age: data.age,
            gender: data.gender,
            createdAt: data.createdAt?.toDate(),
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sendOTP = async (
    phoneNumber: string, 
    recaptchaContainerId: string
  ): Promise<{ error?: string; confirmationResult?: ConfirmationResult }> => {
    try {
      const recaptchaVerifier = setupRecaptcha(recaptchaContainerId);
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return { confirmationResult };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      if (error.code === 'auth/invalid-phone-number') {
        return { error: 'Invalid phone number format. Please use format: +1234567890' };
      }
      if (error.code === 'auth/too-many-requests') {
        return { error: 'Too many requests. Please try again later.' };
      }
      return { error: error.message || 'Failed to send OTP' };
    }
  };

  const verifyOTPAndSignUp = async (
    otp: string, 
    confirmationResult: ConfirmationResult,
    profile: Omit<UserProfile, 'id' | 'role' | 'createdAt'>
  ): Promise<{ error?: string }> => {
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const uid = userCredential.user.uid;

      // Check if user already exists
      const existingUser = await getDoc(doc(db, 'users', uid));
      if (existingUser.exists()) {
        return { error: 'This phone number is already registered. Please login instead.' };
      }

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', uid), {
        name: profile.name,
        role: 'patient',
        phone: profile.phone || userCredential.user.phoneNumber || '',
        email: profile.email || '',
        age: profile.age || null,
        gender: profile.gender || '',
        createdAt: serverTimestamp(),
      });

      return {};
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      if (error.code === 'auth/invalid-verification-code') {
        return { error: 'Invalid OTP. Please try again.' };
      }
      if (error.code === 'auth/code-expired') {
        return { error: 'OTP has expired. Please request a new one.' };
      }
      return { error: error.message || 'Failed to verify OTP' };
    }
  };

  const verifyOTPAndLogin = async (
    otp: string, 
    confirmationResult: ConfirmationResult
  ): Promise<{ error?: string }> => {
    try {
      const userCredential = await confirmationResult.confirm(otp);
      
      // Verify user exists and is a patient
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        return { error: 'Account not found. Please sign up first.' };
      }
      
      if (userDoc.data().role !== 'patient') {
        await signOut(auth);
        return { error: 'This account is not registered as a patient.' };
      }

      return {};
    } catch (error: any) {
      console.error('Verify OTP login error:', error);
      if (error.code === 'auth/invalid-verification-code') {
        return { error: 'Invalid OTP. Please try again.' };
      }
      if (error.code === 'auth/code-expired') {
        return { error: 'OTP has expired. Please request a new one.' };
      }
      return { error: error.message || 'Failed to verify OTP' };
    }
  };

  const signUpDoctor = async (
    email: string, 
    password: string, 
    name: string
  ): Promise<{ error?: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Create doctor profile in Firestore
      await setDoc(doc(db, 'users', uid), {
        name: name,
        role: 'doctor',
        email: email,
        createdAt: serverTimestamp(),
      });

      return {};
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        return { error: 'This email is already registered. Please login instead.' };
      }
      if (error.code === 'auth/weak-password') {
        return { error: 'Password should be at least 6 characters.' };
      }
      return { error: error.message || 'Failed to create account' };
    }
  };

  const loginDoctor = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verify user is a doctor
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        return { error: 'Account not found. Please sign up first.' };
      }
      
      if (userDoc.data().role !== 'doctor') {
        await signOut(auth);
        return { error: 'This account is not registered as a doctor.' };
      }

      return {};
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { error: 'Invalid email or password.' };
      }
      return { error: error.message || 'Failed to login' };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return {};
    } catch (error: any) {
      return { error: error.message || 'Failed to send reset email' };
    }
  };

  return (
    <FirebaseAuthContext.Provider 
      value={{ 
        user, 
        firebaseUser,
        isAuthenticated: !!user, 
        isLoading,
        sendOTP,
        verifyOTPAndSignUp,
        verifyOTPAndLogin,
        signUpDoctor,
        loginDoctor,
        logout,
        resetPassword
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};
