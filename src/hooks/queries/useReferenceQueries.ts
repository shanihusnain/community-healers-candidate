import { useQuery } from '@tanstack/react-query';
import { referenceService } from '@/services/referenceService';

export const referenceKeys = {
  all: ['reference'] as const,
  provinces: () => [...referenceKeys.all, 'provinces'] as const,
  districts: (provinceId?: string) =>
    [...referenceKeys.all, 'districts', provinceId ?? 'all'] as const,
  tehsils: (districtId?: string) =>
    [...referenceKeys.all, 'tehsils', districtId ?? 'all'] as const,
};

export function useProvinces() {
  return useQuery({
    queryKey: referenceKeys.provinces(),
    queryFn: referenceService.getProvinces,
    staleTime: 5 * 60_000,
  });
}

export function useDistricts(provinceId: string | undefined) {
  return useQuery({
    queryKey: referenceKeys.districts(provinceId),
    queryFn: () => referenceService.getDistricts(provinceId),
    enabled: !!provinceId,
    staleTime: 5 * 60_000,
  });
}

export function useTehsils(districtId: string | undefined) {
  return useQuery({
    queryKey: referenceKeys.tehsils(districtId),
    queryFn: () => referenceService.getTehsils(districtId),
    enabled: !!districtId,
    staleTime: 5 * 60_000,
  });
}
