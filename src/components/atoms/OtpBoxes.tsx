import { useRef } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const OTP_LENGTH = 6;

type Props = {
  value: string;
  onChange: (otp: string) => void;
  error?: string;
  autoFocus?: boolean;
};

export function OtpBoxes({ value, onChange, error, autoFocus = true }: Props) {
  const colors = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');

  const updateDigits = (next: string[]) => {
    onChange(next.join('').slice(0, OTP_LENGTH));
  };

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, '');

    // Paste / autofill of full code
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, OTP_LENGTH).split('');
      const next = Array.from({ length: OTP_LENGTH }, (_, i) => chars[i] ?? '');
      updateDigits(next);
      const focusIndex = Math.min(chars.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = cleaned.slice(-1);
    updateDigits(next);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text }]}>OTP code</Text>
      <View style={styles.row}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.box,
              {
                backgroundColor: colors.card,
                borderColor: error ? colors.danger : colors.border,
                color: colors.text,
              },
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={index === 0 ? OTP_LENGTH : 1}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            autoFocus={autoFocus && index === 0}
            selectTextOnFocus
          />
        ))}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    direction: 'ltr',
  },
  box: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: Radius.sm,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    padding: 0,
  },
  error: {
    fontSize: 12,
  },
});
