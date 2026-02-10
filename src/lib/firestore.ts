import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface TestResult {
  id?: string;
  patientId: string;
  testType: 'tapping' | 'speech' | 'spiral';
  score: number;
  details: Record<string, any>;
  createdAt?: Date;
}

export interface MedicationLog {
  id?: string;
  patientId: string;
  medicationName: string;
  scheduledTime: Date;
  takenTime?: Date;
  taken: boolean;
  createdAt?: Date;
}

export interface PatientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  createdAt?: Date;
  lastTestDate?: Date;
  testCount?: number;
}

// Get all patients (for doctors)
export const getAllPatients = async (): Promise<PatientData[]> => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'patient'),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const patients: PatientData[] = [];
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    
    // Get test count for each patient
    const testsQuery = query(
      collection(db, 'testResults'),
      where('patientId', '==', docSnap.id)
    );
    const testsSnapshot = await getDocs(testsQuery);
    
    // Get last test date
    const lastTestQuery = query(
      collection(db, 'testResults'),
      where('patientId', '==', docSnap.id),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const lastTestSnapshot = await getDocs(lastTestQuery);
    
    patients.push({
      id: docSnap.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      age: data.age,
      gender: data.gender,
      createdAt: data.createdAt?.toDate(),
      testCount: testsSnapshot.size,
      lastTestDate: lastTestSnapshot.docs[0]?.data()?.createdAt?.toDate(),
    });
  }
  
  return patients;
};

// Save test result
export const saveTestResult = async (result: Omit<TestResult, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'testResults'), {
    ...result,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get patient test results
export const getPatientTestResults = async (patientId: string): Promise<TestResult[]> => {
  const q = query(
    collection(db, 'testResults'),
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as TestResult[];
};

// Get test results by type
export const getTestResultsByType = async (
  patientId: string, 
  testType: 'tapping' | 'speech' | 'spiral'
): Promise<TestResult[]> => {
  const q = query(
    collection(db, 'testResults'),
    where('patientId', '==', patientId),
    where('testType', '==', testType),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as TestResult[];
};

// Save medication log
export const saveMedicationLog = async (log: Omit<MedicationLog, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'medicationLogs'), {
    ...log,
    scheduledTime: Timestamp.fromDate(log.scheduledTime),
    takenTime: log.takenTime ? Timestamp.fromDate(log.takenTime) : null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get patient medication logs
export const getPatientMedicationLogs = async (
  patientId: string, 
  startDate?: Date, 
  endDate?: Date
): Promise<MedicationLog[]> => {
  let q = query(
    collection(db, 'medicationLogs'),
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    scheduledTime: doc.data().scheduledTime?.toDate(),
    takenTime: doc.data().takenTime?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as MedicationLog[];
};

// Get medication adherence stats
export const getMedicationAdherence = async (patientId: string, days: number = 7): Promise<{
  totalScheduled: number;
  totalTaken: number;
  adherenceRate: number;
}> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const q = query(
    collection(db, 'medicationLogs'),
    where('patientId', '==', patientId),
    where('createdAt', '>=', Timestamp.fromDate(startDate))
  );
  
  const snapshot = await getDocs(q);
  const logs = snapshot.docs.map(doc => doc.data());
  
  const totalScheduled = logs.length;
  const totalTaken = logs.filter(log => log.taken).length;
  
  return {
    totalScheduled,
    totalTaken,
    adherenceRate: totalScheduled > 0 ? (totalTaken / totalScheduled) * 100 : 0,
  };
};
