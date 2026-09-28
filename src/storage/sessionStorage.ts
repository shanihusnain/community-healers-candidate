import AsyncStorage from '@react-native-async-storage/async-storage';

const COOKIE_KEY = 'session_cookies';
const USER_KEY = 'user';

/**
 * Manual cookie jar for React Native — the web app relies on httpOnly cookies
 * via withCredentials; RN must capture Set-Cookie and re-attach Cookie.
 */
export async function getStoredCookieHeader(): Promise<string | null> {
  return AsyncStorage.getItem(COOKIE_KEY);
}

export async function setStoredCookieHeader(cookieHeader: string): Promise<void> {
  await AsyncStorage.setItem(COOKIE_KEY, cookieHeader);
}

export async function clearStoredCookies(): Promise<void> {
  await AsyncStorage.removeItem(COOKIE_KEY);
}

/**
 * Merge Set-Cookie header values into a single Cookie request header string.
 * Handles both string and string[] shapes from axios/RN.
 */
export async function mergeSetCookieHeaders(
  setCookie: string | string[] | undefined,
): Promise<void> {
  if (!setCookie) return;

  const incoming = (Array.isArray(setCookie) ? setCookie : [setCookie])
    .map((raw) => raw.split(';')[0]?.trim())
    .filter(Boolean) as string[];

  if (incoming.length === 0) return;

  const existing = await getStoredCookieHeader();
  const jar = new Map<string, string>();

  if (existing) {
    for (const part of existing.split(';')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      jar.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
    }
  }

  for (const pair of incoming) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    jar.set(pair.slice(0, eq), pair.slice(eq + 1));
  }

  const header = Array.from(jar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');

  await setStoredCookieHeader(header);
}

export async function getStoredUser<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: unknown): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearStoredUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function clearSessionStorage(): Promise<void> {
  await Promise.all([clearStoredCookies(), clearStoredUser()]);
}
