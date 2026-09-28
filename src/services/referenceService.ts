import { api } from '@/api';
import { getApiErrorMessage } from '@/lib/errors';
import { District, Province, Tehsil } from '@/types/candidate';

export const getProvinces = async (): Promise<Province[]> => {
  try {
    const response = await api.get('/super-admin/provinces');
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch provinces.'));
  }
};

export const getDistricts = async (provinceId?: string): Promise<District[]> => {
  try {
    const response = await api.get('/super-admin/districts', {
      params: provinceId ? { provinceId } : undefined,
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch districts.'));
  }
};

export const getTehsils = async (districtId?: string): Promise<Tehsil[]> => {
  try {
    const response = await api.get('/super-admin/tehsils', {
      params: districtId ? { districtId } : undefined,
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch tehsils.'));
  }
};

export const referenceService = {
  getProvinces,
  getDistricts,
  getTehsils,
};
