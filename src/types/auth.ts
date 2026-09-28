import { UserRole } from './roles';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
}

export interface CandidateLoginCredentials {
  phoneNumber: string;
  password?: string;
}

export interface CandidateVerificationCredentials {
  phoneNumber: string;
  otp: string;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
}

export interface SignupOtpRequestResponse {
  sent: boolean;
  otp?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ExamScheduledResponse {
  examScheduled: boolean;
  examDate?: string;
  examStartTime?: string;
  trainingEndTime?: string;
  arriveByTime?: string;
  verificationClosesAt?: string;
  verificationMessage?: string;
  verificationOpen?: boolean;
  wasAutoRescheduled?: boolean;
  requiresRepayment?: boolean;
  consecutiveMisses?: number;
  centerName?: string;
  centerAddress?: string;
  centerLicenseNumber?: string | null;
  centerPhone?: string | null;
  cityName?: string;
  durationMinutes?: number;
  numberOfQuestions?: number;
  message?: string;
  candidateStatus?: string;
  verifiedAt?: string | null;
  examUnlocksAt?: string | null;
  examUnlocked?: boolean;
  examUnlockDelayHours?: number;
  examReleased?: boolean;
  examReleasedAt?: string | null;
  canStartExam?: boolean;
}
