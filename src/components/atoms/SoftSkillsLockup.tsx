import { StyleSheet, Text, View } from 'react-native';
import { SoftSkillsMark } from '@/components/atoms/SoftSkillsMark';
import { Fonts } from '@/constants/theme';

type Props = {
  /** Mark size (CSS brand-symbol is 42). */
  markSize?: number;
  /** Title font size (web brand is ~25). */
  titleSize?: number;
};

/**
 * SoftSkills header lockup from LandingTest:
 * tilted mark + SoftSkills + READY FOR WHAT’S NEXT
 */
export function SoftSkillsLockup({ markSize = 48, titleSize = 28 }: Props) {
  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel="SoftSkills">
      <SoftSkillsMark size={markSize} />
      <View style={styles.textCol}>
        <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.1 }]}>
          <Text style={styles.soft}>Soft</Text>
          <Text style={styles.skills}>Skills</Text>
        </Text>
        <Text style={styles.tagline}>READY FOR WHAT’S NEXT</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    direction: 'ltr',
  },
  textCol: {
    justifyContent: 'center',
  },
  title: {
    color: '#174c3e',
    letterSpacing: -1,
  },
  soft: {
    fontFamily: Fonts.brandHeavy,
  },
  skills: {
    fontFamily: Fonts.brandLight,
  },
  tagline: {
    marginTop: 6,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1.7,
    color: '#174c3e',
  },
});
