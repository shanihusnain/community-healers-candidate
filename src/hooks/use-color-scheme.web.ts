import { useColorScheme as useRNColorScheme } from 'react-native';

/** Web: match native hook — prefer OS scheme when available. */
export function useColorScheme() {
  return useRNColorScheme() ?? 'light';
}
