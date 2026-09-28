import { StyleSheet, Text, View } from 'react-native';
import { SoftSkillsMark } from '@/components/atoms/SoftSkillsMark';
import { Fonts, Spacing, getLocaleFontStyle } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/provider/LanguageProvider';

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showLogo?: boolean;
};

export function ScreenHeader({ title, subtitle, eyebrow, showLogo = false }: Props) {
  const colors = useTheme();
  const { isUrdu } = useLanguage();

  return (
    <View style={styles.wrap}>
      {showLogo ? (
        <View style={styles.logo}>
          <SoftSkillsMark size={42} />
        </View>
      ) : null}
      {eyebrow ? (
        <Text
          style={[
            styles.eyebrow,
            {
              color: colors.primary,
              letterSpacing: isUrdu ? 0 : 1.4,
              writingDirection: isUrdu ? 'rtl' : 'ltr',
            },
            getLocaleFontStyle(isUrdu, Fonts.bodySemiBold, 'semiBold'),
          ]}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            letterSpacing: isUrdu ? 0 : -0.5,
            writingDirection: isUrdu ? 'rtl' : 'ltr',
          },
          getLocaleFontStyle(isUrdu, Fonts.titleBold, 'bold'),
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              writingDirection: isUrdu ? 'rtl' : 'ltr',
            },
            getLocaleFontStyle(isUrdu, Fonts.body, 'regular'),
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.one, marginBottom: Spacing.three },
  // Keep brand mark LTR so bar order never mirrors in Urdu.
  logo: { direction: 'ltr', alignSelf: 'flex-start' },
  eyebrow: {
    marginTop: Spacing.two,
    fontSize: 11,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  title: {
    marginTop: Spacing.one,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
  },
});
