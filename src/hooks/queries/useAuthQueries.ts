import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { ExamScheduledResponse } from '@/types/auth';

export const authKeys = {
  all: ['auth'] as const,
  examSchedule: () => [...authKeys.all, 'examSchedule'] as const,
};

export function useExamSchedule(
  options?: Pick<UseQueryOptions<ExamScheduledResponse>, 'enabled'>,
) {
  return useQuery({
    queryKey: authKeys.examSchedule(),
    queryFn: authService.checkExamScheduled,
    enabled: options?.enabled,
  });
}
