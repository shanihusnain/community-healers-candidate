import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '@/services/candidateService';
import { DocumentFile } from '@/types/candidate';
import { authKeys } from './useAuthQueries';

export const candidateKeys = {
  all: ['candidate'] as const,
  me: () => [...candidateKeys.all, 'me'] as const,
  documentValidation: () => [...candidateKeys.all, 'documentValidation'] as const,
  paymentStatus: () => [...candidateKeys.all, 'paymentStatus'] as const,
  eligibleCities: (examDate: string) =>
    [...candidateKeys.all, 'eligibleCities', examDate] as const,
};

export function useCandidateMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: candidateKeys.me(),
    queryFn: candidateService.getMe,
    enabled: options?.enabled,
  });
}

export function useDocumentValidation(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: candidateKeys.documentValidation(),
    queryFn: candidateService.validateDocuments,
    enabled: options?.enabled,
  });
}

export function usePaymentStatus(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: candidateKeys.paymentStatus(),
    queryFn: candidateService.getPaymentStatus,
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
  });
}

export function useEligibleCities(examDate: string | undefined) {
  return useQuery({
    queryKey: candidateKeys.eligibleCities(examDate ?? ''),
    queryFn: () => candidateService.getEligibleCities(examDate as string),
    enabled: !!examDate,
  });
}

export function useUpdateCandidateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => candidateService.updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.me() });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, file }: { type: string; file: DocumentFile }) =>
      candidateService.uploadDocument(type, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.me() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.documentValidation() });
    },
  });
}

export function useScheduleExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examDate, cityId }: { examDate: string; cityId: string }) =>
      candidateService.scheduleExam(examDate, cityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.examSchedule() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.me() });
    },
  });
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: candidateService.initiatePayment,
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      transactionId,
      bankTransactionRef,
    }: {
      transactionId: string;
      bankTransactionRef: string;
    }) => candidateService.confirmPayment(transactionId, bankTransactionRef),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.me() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.paymentStatus() });
    },
  });
}
