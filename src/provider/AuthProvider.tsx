import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { registerSessionExpiredHandler } from '@/api';
import { authKeys, useExamSchedule } from '@/hooks/queries/useAuthQueries';
import { authService } from '@/services/authService';
import {
  clearSessionStorage,
  getStoredUser,
  setStoredUser,
} from '@/storage/sessionStorage';
import {
  AuthState,
  CandidateLoginCredentials,
  CandidateVerificationCredentials,
  ExamScheduledResponse,
  SignupCredentials,
  User,
} from '@/types/auth';

interface AuthContextType extends AuthState {
  loginCandidate: (credentials: CandidateLoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<{ otp?: string }>;
  verifyCandidate: (credentials: CandidateVerificationCredentials) => Promise<void>;
  logout: () => Promise<void>;
  examScheduleInfo: ExamScheduledResponse | null;
  pendingPhone: string | null;
  setPendingPhone: (phone: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function hydrateFromUser(user: User): AuthState {
  return {
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  const examScheduleQuery = useExamSchedule({
    enabled: state.isAuthenticated && state.user?.role === 'CANDIDATE',
  });
  const examScheduleInfo = examScheduleQuery.data ?? null;

  const applySession = useCallback(async (user: User) => {
    await setStoredUser(user);
    setState(hydrateFromUser(user));
  }, []);

  const clearSession = useCallback(async () => {
    await clearSessionStorage();
    queryClient.clear();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, [queryClient]);

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      void clearSession();
    });
  }, [clearSession]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const cached = await getStoredUser<User>();
        if (cached) {
          setState({
            user: cached,
            isAuthenticated: true,
            isLoading: true,
            error: null,
          });
        }
        const response = await authService.getMe();
        await applySession(response.user);
      } catch {
        await clearSessionStorage();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };
    void checkAuth();
  }, [applySession]);

  const loginCandidate = useCallback(
    async (credentials: CandidateLoginCredentials) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await authService.loginCandidate(credentials);
        await applySession(response.user);
        if (response.user.role === 'CANDIDATE') {
          queryClient.invalidateQueries({ queryKey: authKeys.examSchedule() });
        }
      } catch (error: unknown) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Login failed',
        }));
        throw error;
      }
    },
    [applySession, queryClient],
  );

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authService.signup(credentials);
      setPendingPhone(credentials.phoneNumber);
      setState((prev) => ({ ...prev, isLoading: false, error: null }));
      return { otp: response.otp };
    } catch (error: unknown) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      }));
      throw error;
    }
  }, []);

  const verifyCandidate = useCallback(
    async (credentials: CandidateVerificationCredentials) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await authService.verifyCandidate(credentials);
        setPendingPhone(null);
        await applySession(response.user);
        if (response.user.role === 'CANDIDATE') {
          queryClient.invalidateQueries({ queryKey: authKeys.examSchedule() });
        }
      } catch (error: unknown) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Verification failed',
        }));
        throw error;
      }
    },
    [applySession, queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      loginCandidate,
      signup,
      verifyCandidate,
      logout,
      examScheduleInfo,
      pendingPhone,
      setPendingPhone,
    }),
    [
      state,
      loginCandidate,
      signup,
      verifyCandidate,
      logout,
      examScheduleInfo,
      pendingPhone,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
