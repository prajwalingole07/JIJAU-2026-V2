export type Role = 'FOUNDER' | 'ADMIN' | 'TEACHER';

export type User = {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  photo?: string;
};

export type CasteNormalized = 
  | 'OPEN' | 'SC' | 'ST' | 'VJ/DT' | 'NT-B' | 'NT-C' | 'NT-D' | 'OBC' | 'SEBC' | 'TFWS' | 'ORPHAN' | 'EWS' | 'SBC';

export type Student = {
  id: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  rollNumber: string;
  motherName: string;
  class: string;
  division: string;
  cetDetails?: string;
  mobile?: string;
  address: string;
  admissionDate: string;
  casteInput: string;
  casteNormalized: CasteNormalized;
  aadhaarNumber: string;
  totalFees: number;
  feesPaid: number;
};

export type StaffCategory = 'Academic' | 'Support';
export type AcademicRole = 'Principal' | 'Vice-Principal' | 'Teacher' | 'None';

export type Teacher = {
  id: string;
  fullName: string;
  subject: string;
  experience: number;
  mobile: string;
  address: string;
  casteInput: string;
  casteNormalized: CasteNormalized;
  photo: string;
  username: string;
  password?: string;
  aadhaarNumber: string;
  classDetails: string;
  baseSalary: number;
  category: StaffCategory;
  academicRole: AcademicRole;
};

export type PaymentMode = 'Cash' | 'Online';
export type PaymentStatus = 'Paid' | 'Pending';

export type Payment = {
  id: string;
  teacherId: string;
  teacherName: string;
  amount: number;
  status: PaymentStatus;
  mode: PaymentMode;
  date: string;
  screenshot?: string;
  remarks?: string;
};

export type FeePayment = {
  id: string;
  receiptNumber?: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  remarks?: string;
  screenshot?: string;
};

export type AttendanceStatus = 'Present' | 'Absent';

export type StudentAttendance = {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  class: string;
};

export type StaffAttendanceStatus = 'Pending' | 'Approved' | 'Rejected';

export type StaffAttendance = {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  status: AttendanceStatus;
  approvalStatus: StaffAttendanceStatus;
};

export type Homework = {
  id: string;
  teacherId: string;
  teacherName: string;
  class: string;
  date: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
};
