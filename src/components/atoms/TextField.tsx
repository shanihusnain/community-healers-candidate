import { useState } from 'react';
import {
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BilingualLabel } from '@/components/atoms/BilingualLabel';
import { Radius, Fonts, Spacing, getLocaleFontStyle, getUrduFontStyle } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/provider/LanguageProvider';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = TextInputProps & {
  label: string;
  /** When set, shows EN | UR heading like the web personal-info form. */
  labelUrdu?: string;
  error?: string;
  isPassword?: boolean;
  /** Leading icon inside the field (web PersonalInfoForm pattern). */
  leftIcon?: IconName;
};

function isLtrKeyboard(keyboardType: TextInputProps['keyboardType']) {
  return (
    keyboardType === 'phone-pad' ||
    keyboardType === 'number-pad' ||
    keyboardType === 'email-address' ||
    keyboardType === 'numeric' ||
    keyboardType === 'decimal-pad'
  );
}

/** Under I18nManager RTL, `left` means start (right edge). Flip to keep placeholders flush left like the web. */
function physicalTextAlign(): 'left' | 'right' {
  return I18nManager.isRTL ? 'right' : 'left';
}

export function TextField({
  label,
  labelUrdu,
  error,
  style,
  isPassword = false,
  secureTextEntry,
  leftIcon,
  ...rest
}: Props) {
  const colors = useTheme();
  const { isUrdu } = useLanguage();
  const [hidden, setHidden] = useState(true);
  const isSecure = isPassword ? hidden : !!secureTextEntry;
  const forceLtrValue = isLtrKeyboard(rest.keyboardType);
  const isMultiline = !!rest.multiline;

  return (
    <View style={styles.wrap}>
      {labelUrdu ? (
        <BilingualLabel en={label} ur={labelUrdu} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: colors.text, writingDirection: isUrdu ? 'rtl' : 'ltr' },
            getLocaleFontStyle(isUrdu, Fonts.bodySemiBold, 'semiBold'),
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.danger : colors.border,
            // Keep icon + placeholder on the physical left (web uses pl-10).
            direction: 'ltr',
            // Multiline: pin icon to the first text line (web `top-3`), not vertical center.
            alignItems: isMultiline ? 'flex-start' : 'center',
            paddingVertical: isMultiline ? Spacing.two : 0,
          },
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={18}
            color={colors.textSecondary}
            style={[styles.leftIcon, isMultiline && styles.leftIconMultiline]}
          />
        ) : null}
        <TextInput
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            {
              color: colors.text,
              textAlign: physicalTextAlign(),
              writingDirection: forceLtrValue || !isUrdu ? 'ltr' : 'rtl',
            },
            forceLtrValue || !isUrdu
              ? { fontFamily: Fonts.body }
              : getUrduFontStyle('regular'),
            isMultiline && styles.inputMultiline,
            style,
          ]}
          {...rest}
          secureTextEntry={isSecure}
          autoCapitalize={isPassword ? 'none' : rest.autoCapitalize}
          autoCorrect={isPassword ? false : rest.autoCorrect}
          textContentType={isPassword ? 'password' : rest.textContentType}
          autoComplete={isPassword ? 'password' : rest.autoComplete}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={8}
            onPress={() => setHidden((prev) => !prev)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text
          style={[
            styles.error,
            {
              color: colors.danger,
              writingDirection: isUrdu ? 'rtl' : 'ltr',
            },
            getLocaleFontStyle(isUrdu, Fonts.body, 'regular'),
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    textAlign: 'left',
  },
  inputRow: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  leftIcon: {
    marginRight: Spacing.two,
  },
  leftIconMultiline: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 16,
    paddingVertical: Spacing.two,
    paddingRight: Spacing.two,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'top',
  },
  eyeButton: {
    padding: Spacing.one,
  },
  error: {
    fontSize: 12,
    textAlign: 'left',
  },
});
