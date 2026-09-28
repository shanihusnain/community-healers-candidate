import { StyleSheet, Text, View } from 'react-native';
import { Fonts, Spacing, getUrduFontStyle } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  /** English label (left in LTR, like web portal). */
  en: string;
  /** Urdu label (right in LTR / dir=rtl). */
  ur: string;
};

/**
 * Dual EN | UR field heading matching web PersonalInfoForm:
 * `<div dir="ltr"><Label EN/><Label dir="rtl" UR/></div>`
 */
export function BilingualLabel({ en, ur }: Props) {
  const colors = useTheme();

  return (
    <View style={styles.row} accessibilityRole="text">
      <Text style={[styles.en, { color: colors.text }]}>{en}</Text>
      <Text style={[styles.ur, { color: colors.text }, getUrduFontStyle('regular')]}>{ur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    direction: 'ltr',
  },
  en: {
    flexShrink: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  ur: {
    flexShrink: 1,
    fontSize: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
