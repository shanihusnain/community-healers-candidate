import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DevSettings, I18nManager, Platform, View } from 'react-native';
import { en } from '@/i18n/en';
import { ur } from '@/i18n/ur';
import type { AppLocale, AppMessages } from '@/i18n/types';

const STORAGE_KEY = 'softskills-language';

type LanguageContextValue = {
  locale: AppLocale;
  isUrdu: boolean;
  /** Layout / text direction for the active locale. */
  direction: 'rtl' | 'ltr';
  copy: AppMessages;
  /** Always-English labels (for bilingual EN|UR field headings like the web portal). */
  copyEn: AppMessages;
  /** Always-Urdu labels. */
  copyUr: AppMessages;
  setLocale: (locale: AppLocale) => void;
  toggleLanguage: () => void;
  ready: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Native RTL only applies after a full reload. Returns true when a reload is required.
 * `I18nManager.forceRTL` persists natively; reload applies Yoga layout mirroring.
 * @see https://docs.expo.dev/guides/localization/#dynamically-overriding-rtl-settings
 */
function syncNativeRtl(wantRtl: boolean): boolean {
  if (Platform.OS === 'web') return false;
  if (I18nManager.isRTL === wantRtl) return false;
  I18nManager.allowRTL(wantRtl);
  I18nManager.forceRTL(wantRtl);
  return true;
}

function reloadApp() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.location.reload();
    return;
  }
  // forceRTL is persisted; reload applies layout. DevSettings works in debug builds.
  if (typeof DevSettings?.reload === 'function') {
    DevSettings.reload();
    return;
  }
  // Release: native flag is saved; next cold start is RTL/LTR correctly.
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const next: AppLocale = stored === 'ur' ? 'ur' : 'en';
        const needsReload = syncNativeRtl(next === 'ur');
        if (!cancelled) {
          setLocaleState(next);
        }
        if (needsReload) {
          // Native flag persisted; reload so Yoga / I18nManager match stored locale.
          reloadApp();
          return;
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: AppLocale) => {
    void (async () => {
      await AsyncStorage.setItem(STORAGE_KEY, next);
      const needsReload = syncNativeRtl(next === 'ur');
      setLocaleState(next);
      if (needsReload) {
        reloadApp();
      }
    })();
  }, []);

  const toggleLanguage = useCallback(() => {
    setLocale(locale === 'ur' ? 'en' : 'ur');
  }, [locale, setLocale]);

  const direction = locale === 'ur' ? 'rtl' : 'ltr';

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      isUrdu: locale === 'ur',
      direction,
      copy: locale === 'ur' ? ur : en,
      copyEn: en,
      copyUr: ur,
      setLocale,
      toggleLanguage,
      ready,
    }),
    [locale, direction, setLocale, toggleLanguage, ready],
  );

  return (
    <LanguageContext.Provider value={value}>
      <View
        style={{ flex: 1, direction }}
        // @ts-expect-error `dir` is used by react-native-web for document direction
        dir={Platform.OS === 'web' ? direction : undefined}
      >
        {children}
      </View>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
