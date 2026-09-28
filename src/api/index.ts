import {
  AxiosResponse,
  InternalAxiosRequestConfig,
  create as createAxios,
} from 'axios';
import {
  clearSessionStorage,
  getStoredCookieHeader,
  mergeSetCookieHeaders,
} from '@/storage/sessionStorage';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'https://app.worldwidebusinessesnetwork.com';

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler | null = null;

export function registerSessionExpiredHandler(handler: SessionExpiredHandler) {
  onSessionExpired = handler;
}

export const api = createAxios({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export function unwrapEnvelope(response: AxiosResponse): AxiosResponse {
  const body = response.data;
  if (body && typeof body === 'object' && 'data' in body) {
    response.data = body.data;
  }
  return response;
}

function getSetCookieHeader(headers: AxiosResponse['headers']): string | string[] | undefined {
  const h = headers as Record<string, string | string[] | undefined>;
  return h['set-cookie'] ?? h['Set-Cookie'];
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const cookie = await getStoredCookieHeader();
  if (cookie) {
    config.headers.set('Cookie', cookie);
  }
  return config;
});

api.interceptors.response.use(
  async (response) => {
    await mergeSetCookieHeaders(getSetCookieHeader(response.headers));
    return unwrapEnvelope(response);
  },
  async (error) => {
    if (error.response?.headers) {
      await mergeSetCookieHeaders(getSetCookieHeader(error.response.headers));
    }

    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/signup') ||
        requestUrl.includes('/auth/verify') ||
        requestUrl.includes('/auth/me');

      if (!isAuthRequest) {
        await clearSessionStorage();
        onSessionExpired?.();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
