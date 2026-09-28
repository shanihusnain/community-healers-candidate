import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Radius, Spacing, getLocaleFontStyle } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/provider/LanguageProvider';

/** SoftSkills header language control — toggles English / اردو + RTL (reloads when direction flips). */
export function LanguageToggle() {
  const colors = useTheme();
  const { isUrdu, toggleLanguage, copy } = useLanguage();

  return (
    <Pressable
      onPress={toggleLanguage}
      accessibilityRole="button"
      accessibilityLabel={isUrdu ? copy.auth.switchToEnglish : 'اردو میں دیکھیں'}
      style={({ pressed }) => [
        styles.btn,
        {
          borderColor: colors.border,
          backgroundColor: colors.card,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Ionicons name="language-outline" size={17} color={colors.primary} />
      <Text
        style={[
          styles.label,
          {
            color: colors.text,
            writingDirection: isUrdu ? 'rtl' : 'ltr',
          },
          getLocaleFontStyle(isUrdu, Fonts.bodySemiBold, 'semiBold'),
        ]}
      >
        {isUrdu ? copy.auth.switchToEnglish : copy.auth.switchToUrdu}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignSelf: 'flex-end',
  },
  label: {
    fontSize: 13,
  },
});
