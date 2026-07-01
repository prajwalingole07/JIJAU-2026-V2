"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Student, Teacher, Payment, FeePayment, User, StudentAttendance, StaffAttendance, Homework } from './types';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
} from 'firebase/firestore';

interface SchoolContextType {
  isLoaded: boolean;
  isLiveSync: boolean;
  students: Student[];
  teachers: Teacher[];
  payments: Payment[];
  feePayments: FeePayment[];
  studentAttendance: StudentAttendance[];
  staffAttendance: StaffAttendance[];
  homeworks: Homework[];
  currentUser: User | null;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (id: string, updated: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  addPayment: (payment: Payment) => void;
  addFeePayment: (payment: FeePayment) => void;
  updatePayment: (id: string, updated: Partial<Payment>) => void;
  markStudentAttendance: (records: StudentAttendance[]) => void;
  markStaffAttendance: (record: StaffAttendance) => void;
  updateStaffAttendanceStatus: (id: string, status: StaffAttendance['approvalStatus']) => void;
  addHomework: (homework: Homework) => void;
  updateHomework: (id: string, updated: Partial<Pick<Homework, 'content' | 'imageUrl'>>) => void;
  login: (user: User) => void;
  logout: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

function readFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key} from local storage`, error);
    localStorage.removeItem(key);
    return fallback;
  }
}

function saveToStorage(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Unable to save ${key} to local storage`, error);
    return false;
  }
}

// Firestore rejects `undefined` field values (e.g. an optional field left
// blank). Strip them out before every write so updates never throw.
function stripUndefined<T extends object>(obj: T): T {
  const clean: any = {};
  Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined) clean[key] = value;
  });
  return clean;
}

const COLLECTIONS = {
  students: 'jijau_students',
  teachers: 'jijau_teachers',
  payments: 'jijau_payments',
  feePayments: 'jijau_fee_payments',
  studentAttendance: 'jijau_student_att',
  staffAttendance: 'jijau_staff_att',
  homeworks: 'jijau_homeworks',
};

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendance[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Keep a live ref mirror of staffAttendance for the "already marked today"
  // de-dupe check inside markStaffAttendance without re-subscribing.
  const staffAttendanceRef = useRef<StaffAttendance[]>([]);
  useEffect(() => { staffAttendanceRef.current = staffAttendance; }, [staffAttendance]);

  const liveSync = isFirebaseConfigured && !!db;

  useEffect(() => {
    setCurrentUser(readFromStorage<User | null>('jijau_current_user', null));

    if (liveSync && db) {
      const unsubscribers = [
        onSnapshot(collection(db, COLLECTIONS.students), (snap) => {
          setStudents(snap.docs.map((d) => d.data() as Student));
        }),
        onSnapshot(collection(db, COLLECTIONS.teachers), (snap) => {
          setTeachers(snap.docs.map((d) => d.data() as Teacher));
        }),
        onSnapshot(collection(db, COLLECTIONS.payments), (snap) => {
          setPayments(snap.docs.map((d) => d.data() as Payment));
        }),
        onSnapshot(collection(db, COLLECTIONS.feePayments), (snap) => {
          setFeePayments(snap.docs.map((d) => d.data() as FeePayment));
        }),
        onSnapshot(collection(db, COLLECTIONS.studentAttendance), (snap) => {
          setStudentAttendance(snap.docs.map((d) => d.data() as StudentAttendance));
        }),
        onSnapshot(collection(db, COLLECTIONS.staffAttendance), (snap) => {
          setStaffAttendance(snap.docs.map((d) => d.data() as StaffAttendance));
        }),
        onSnapshot(collection(db, COLLECTIONS.homeworks), (snap) => {
          setHomeworks(snap.docs.map((d) => d.data() as Homework));
        }),
      ];
      setIsLoaded(true);
      return () => unsubscribers.forEach((unsub) => unsub());
    } else {
      setStudents(readFromStorage<Student[]>('jijau_students', []));
      setTeachers(readFromStorage<Teacher[]>('jijau_teachers', []));
      setPayments(readFromStorage<Payment[]>('jijau_payments', []));
      setFeePayments(readFromStorage<FeePayment[]>('jijau_fee_payments', []));
      setStudentAttendance(readFromStorage<StudentAttendance[]>('jijau_student_att', []));
      setStaffAttendance(readFromStorage<StaffAttendance[]>('jijau_staff_att', []));
      setHomeworks(readFromStorage<Homework[]>('jijau_homeworks', []));
      setIsLoaded(true);
    }
  }, [liveSync]);

  // ---------------- Students ----------------
  const addStudent = (student: Student) => {
    if (liveSync && db) {
      setDoc(doc(db, COLLECTIONS.students, student.id), stripUndefined(student)).catch((e) => console.error('addStudent failed', e));
      return;
    }
    setStudents(prev => {
      const next = [...prev, student];
      saveToStorage('jijau_students', next);
      return next;
    });
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    if (liveSync && db) {
      updateDoc(doc(db, COLLECTIONS.students, id), stripUndefined(updated as any)).catch((e) => console.error('updateStudent failed', e));
      return;
    }
    setStudents(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...updated } : s);
      saveToStorage('jijau_students', next);
      return next;
    });
  };

  const deleteStudent = (id: string) => {
    if (liveSync && db) {
      deleteDoc(doc(db, COLLECTIONS.students, id)).catch((e) => console.error('deleteStudent failed', e));
      return;
    }
    setStudents(prev => {
      const next = prev.filter(s => s.id !== id);
      saveToStorage('jijau_students', next);
      return next;
    });
  };

  // ---------------- Teachers ----------------
  const addTeacher = (teacher: Teacher) => {
    if (liveSync && db) {
      setDoc(doc(db, COLLECTIONS.teachers, teacher.id), stripUndefined(teacher)).catch((e) => console.error('addTeacher failed', e));
      return;
    }
    setTeachers(prev => {
      const next = [...prev, teacher];
      saveToStorage('jijau_teachers', next);
      return next;
    });
  };

  const updateTeacher = (id: string, updated: Partial<Teacher>) => {
    if (liveSync && db) {
      updateDoc(doc(db, COLLECTIONS.teachers, id), stripUndefined(updated as any)).catch((e) => console.error('updateTeacher failed', e));
      return;
    }
    setTeachers(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updated } : t);
      saveToStorage('jijau_teachers', next);
      return next;
    });
  };

  const deleteTeacher = (id: string) => {
    if (liveSync && db) {
      deleteDoc(doc(db, COLLECTIONS.teachers, id)).catch((e) => console.error('deleteTeacher failed', e));
      return;
    }
    setTeachers(prev => {
      const next = prev.filter(t => t.id !== id);
      saveToStorage('jijau_teachers', next);
      return next;
    });
  };

  // ---------------- Payments (staff salary) ----------------
  const addPayment = (payment: Payment) => {
    if (liveSync && db) {
      setDoc(doc(db, COLLECTIONS.payments, payment.id), stripUndefined(payment)).catch((e) => console.error('addPayment failed', e));
      return;
    }
    setPayments(prev => {
      const next = [...prev, payment];
      saveToStorage('jijau_payments', next);
      return next;
    });
  };

  const updatePayment = (id: string, updated: Partial<Payment>) => {
    if (liveSync && db) {
      updateDoc(doc(db, COLLECTIONS.payments, id), stripUndefined(updated as any)).catch((e) => console.error('updatePayment failed', e));
      return;
    }
    setPayments(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updated } : p);
      saveToStorage('jijau_payments', next);
      return next;
    });
  };

  // ---------------- Fee Payments (student fees) ----------------
  const addFeePayment = (payment: FeePayment) => {
    if (liveSync && db) {
      setDoc(doc(db, COLLECTIONS.feePayments, payment.id), stripUndefined(payment)).catch((e) => console.error('addFeePayment failed', e));
      updateDoc(doc(db, COLLECTIONS.students, payment.studentId), {
        feesPaid: increment(payment.amount),
      }).catch((e) => console.error('feesPaid increment failed', e));
      return;
    }

    setFeePayments(prev => {
      const next = [...prev, payment];
      saveToStorage('jijau_fee_payments', next);
      return next;
    });

    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id === payment.studentId) {
          return { ...s, feesPaid: (s.feesPaid || 0) + payment.amount };
        }
        return s;
      });
      saveToStorage('jijau_students', next);
      return next;
    });
  };

  // ---------------- Attendance ----------------
  const markStudentAttendance = (records: StudentAttendance[]) => {
    if (liveSync && db) {
      const firestore = db;
      const batch = writeBatch(firestore);
      records.forEach((record) => {
        batch.set(doc(firestore, COLLECTIONS.studentAttendance, record.id), record);
      });
      batch.commit().catch((e) => console.error('markStudentAttendance failed', e));
      return;
    }
    setStudentAttendance(prev => {
      const next = [...prev, ...records];
      saveToStorage('jijau_student_att', next);
      return next;
    });
  };

  const markStaffAttendance = (record: StaffAttendance) => {
    const existing = staffAttendanceRef.current.find(a => a.teacherId === record.teacherId && a.date === record.date);
    if (existing) return;

    if (liveSync && db) {
      setDoc(doc(db, COLLECTIONS.staffAttendance, record.id), record).catch((e) => console.error('markStaffAttendance failed', e));
      return;
    }
    setStaffAttendance(prev => {
      const next = [...prev, record];
      saveToStorage('jijau_staff_att', next);
      return next;
    });
  };

  const updateStaffAttendanceStatus = (id: string, status: StaffAttendance['approvalStatus']) => {
    if (liveSync && db) {
      updateDoc(doc(db, COLLECTIONS.staffAttendance, id), { approvalStatus: status }).catch((e) => console.error('updateStaffAttendanceStatus failed', e));
      return;
    }
    setStaffAttendance(prev => {
      const next = prev.map(a => a.id === id ? { ...a, approvalStatus: status } : a);
      saveToStorage('jijau_staff_att', next);
      return next;
    });
  };

  // ---------------- Homework ----------------
  const addHomework = (homework: Homework) => {
    if (liveSync && db) {
      setDoc(doc(db, COLLECTIONS.homeworks, homework.id), stripUndefined(homework)).catch((e) => console.error('addHomework failed', e));
      return;
    }
    setHomeworks(prev => {
      const next = [...prev, homework];
      saveToStorage('jijau_homeworks', next);
      return next;
    });
  };

  const updateHomework = (id: string, updated: Partial<Pick<Homework, 'content' | 'imageUrl'>>) => {
    if (liveSync && db) {
      updateDoc(doc(db, COLLECTIONS.homeworks, id), stripUndefined(updated as any)).catch((e) => console.error('updateHomework failed', e));
      return;
    }
    setHomeworks(prev => {
      const next = prev.map(h => h.id === id ? { ...h, ...updated } : h);
      saveToStorage('jijau_homeworks', next);
      return next;
    });
  };

  // ---------------- Auth (always local: each device keeps its own session) ----------------
  const login = (user: User) => {
    setCurrentUser(user);
    saveToStorage('jijau_current_user', user);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('jijau_current_user');
  };

  return (
    <SchoolContext.Provider value={{
      isLoaded, isLiveSync: liveSync, students, teachers, payments, feePayments, studentAttendance, staffAttendance, homeworks, currentUser,
      addStudent, updateStudent, deleteStudent,
      addTeacher, updateTeacher, deleteTeacher,
      addPayment, addFeePayment, updatePayment, markStudentAttendance, markStaffAttendance, updateStaffAttendanceStatus,
      addHomework, updateHomework,
      login, logout
    }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchoolStore() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchoolStore must be used within a SchoolProvider');
  }
  return context;
}
