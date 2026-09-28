import { isAxiosError } from 'axios';
import { api } from '@/api';
import { getApiErrorMessage } from '@/lib/errors';
import {
  AuthResponse,
  CandidateLoginCredentials,
  CandidateVerificationCredentials,
  ExamScheduledResponse,
  SignupCredentials,
  SignupOtpRequestResponse,
} from '@/types/auth';

function loginErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && error.response?.status === 403) {
    return 'This account cannot access the candidate portal.';
  }
  return getApiErrorMessage(error, fallback);
}

const loginCandidate = async (
  credentials: CandidateLoginCredentials,
): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login/candidate', credentials);
    return response.data;
  } catch (error: unknown) {
    throw new Error(loginErrorMessage(error, 'Login failed. Please check your credentials.'));
  }
};

const signup = async (credentials: SignupCredentials): Promise<SignupOtpRequestResponse> => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = credentials;
    const response = await api.post('/auth/signup/request', {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Signup failed. Please try again.'));
  }
};

const verifyCandidate = async (
  credentials: CandidateVerificationCredentials,
): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/signup/verify', credentials);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Verification failed. Please check your OTP.'));
  }
};

const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Still clear local session
  }
};

const getMe = async (): Promise<AuthResponse> => {
  const response = await api.get('/auth/me');
  return response.data;
};

const checkExamScheduled = async (): Promise<ExamScheduledResponse> => {
  try {
    const response = await api.get('/candidates/me/exam-scheduled');
    return response.data;
  } catch {
    return {
      examScheduled: false,
      message: 'Failed to check exam status',
    };
  }
};

export const authService = {
  loginCandidate,
  signup,
  verifyCandidate,
  logout,
  getMe,
  checkExamScheduled,
};
