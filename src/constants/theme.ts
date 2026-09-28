import { Platform, TextStyle } from 'react-native';

/**
 * Brand tokens aligned with Community Healers / SoftSkills web.
 * SoftSkills landing: Manrope (headings) + DM Sans (body).
 * Portal chrome: Alumni Sans titles.
 */
export const Colors = {
  light: {
    text: '#183d34',
    textSecondary: '#64736d',
    background: '#FAFAFA',
    backgroundElement: '#F0F0F0',
    backgroundSelected: '#E5E5E5',
    primary: '#277A4F',
    primaryForeground: '#FFFFFF',
    border: '#E0E0E0',
    danger: '#C62828',
    success: '#2E7D32',
    warning: '#ED6C02',
    card: '#FFFFFF',
  },
  dark: {
    text: '#F5F5F5',
    textSecondary: '#B0B0B0',
    background: '#121212',
    backgroundElement: '#1E1E1E',
    backgroundSelected: '#2A2A2A',
    primary: '#3D9B68',
    primaryForeground: '#FFFFFF',
    border: '#333333',
    danger: '#EF5350',
    success: '#66BB6A',
    warning: '#FFA726',
    card: '#1E1E1E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Urdu / Arabic system fonts — same approach as Wasiyyati-Mobile:
 * iOS Damascus, Android noto-sans, weight via `fontWeight` (not a separate file).
 */
const URDU_FAMILY = Platform.OS === 'ios' ? 'Damascus' : 'noto-sans';

export type UrduWeight = 'regular' | 'medium' | 'semiBold' | 'bold';

const URDU_WEIGHT: Record<UrduWeight, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

/** Wasiyyati-style Urdu text style (family + weight + Android padding). */
export function getUrduFontStyle(weight: UrduWeight = 'regular'): TextStyle {
  return {
    fontFamily: URDU_FAMILY,
    fontWeight: URDU_WEIGHT[weight],
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  };
}

/**
 * Latin font family when English; Urdu system font + weight when اردو.
 * Mirrors Wasiyyati `getFontStyle`.
 */
export function getLocaleFontStyle(
  isUrdu: boolean,
  latinFamily: string,
  urduWeight: UrduWeight = 'regular',
): TextStyle {
  if (isUrdu) return getUrduFontStyle(urduWeight);
  return { fontFamily: latinFamily, fontWeight: 'normal' };
}

/** Loaded via @expo-google-fonts — names match useFonts keys. */
export const Fonts = {
  /** SoftSkills headings (LandingTest h1/h2). */
  title: 'Manrope_600SemiBold',
  titleBold: 'Manrope_700Bold',
  /** Portal-style titles (alumni-sans-title). */
  display: 'AlumniSans_700Bold',
  /** Body / labels / inputs (DM Sans). */
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  /** SoftSkills brand wordmark weight for “Skills”. */
  brandLight: 'Manrope_500Medium',
  /** SoftSkills brand wordmark weight for “Soft”. */
  brandHeavy: 'Manrope_800ExtraBold',
  /** Urdu / Arabic — Wasiyyati system fonts (use getUrduFontStyle for weight). */
  urdu: URDU_FAMILY,
  urduBold: URDU_FAMILY,
  /** Fallback before fonts load. */
  system: Platform.select({ ios: 'System', default: 'sans-serif' })!,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;
