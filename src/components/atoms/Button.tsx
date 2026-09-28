import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { Radius, Fonts, Spacing, getLocaleFontStyle } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/provider/LanguageProvider';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}: Props) {
  const colors = useTheme();
  const { isUrdu } = useLanguage();
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isGhost
            ? 'transparent'
            : isPrimary
              ? colors.primary
              : colors.backgroundElement,
          opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1,
          borderWidth: isGhost ? 1 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.primaryForeground : colors.text} />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: isPrimary
                ? colors.primaryForeground
                : isGhost
                  ? colors.primary
                  : colors.text,
              writingDirection: isUrdu ? 'rtl' : 'ltr',
            },
            getLocaleFontStyle(isUrdu, Fonts.title, 'bold'),
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  label: {
    fontSize: 16,
    textAlign: 'center',
  },
});
