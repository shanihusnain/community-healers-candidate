import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AppColorScheme = 'light' | 'dark';

export function resolveColorScheme(
  scheme: string | null | undefined,
): AppColorScheme {
  return scheme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  const scheme = useColorScheme();
  return Colors[resolveColorScheme(scheme)];
}

export function useAppColorScheme(): AppColorScheme {
  return resolveColorScheme(useColorScheme());
}
