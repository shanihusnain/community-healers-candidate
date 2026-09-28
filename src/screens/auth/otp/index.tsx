import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/atoms/Button';
import { KeyboardScreen } from '@/components/atoms/KeyboardScreen';
import { LanguageToggle } from '@/components/atoms/LanguageToggle';
import { OtpBoxes } from '@/components/atoms/OtpBoxes';
import { ScreenHeader } from '@/components/atoms/ScreenHeader';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/lib/errors';
import { useAuth } from '@/provider/AuthProvider';
import { useLanguage } from '@/provider/LanguageProvider';
import { candidateVerifySchema, CandidateVerifyInput } from '@/schemas/authSchemas';

export default function OtpScreen() {
  const { verifyCandidate, pendingPhone } = useAuth();
  const { copy } = useLanguage();
  const params = useLocalSearchParams<{ phoneNumber?: string }>();
  const phoneNumber = params.phoneNumber || pendingPhone || '';
  const colors = useTheme();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateVerifyInput>({
    resolver: zodResolver(candidateVerifySchema),
    defaultValues: { phoneNumber, otp: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await verifyCandidate(values);
      router.replace('/(app)');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: copy.auth.verificationFailed,
        text2: getApiErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <KeyboardScreen contentContainerStyle={styles.content}>
      <LanguageToggle />
      <ScreenHeader
        title={copy.auth.otpTitle}
        subtitle={copy.auth.otpDesc}
        showLogo
      />
      <View style={styles.form}>
        {phoneNumber ? (
          <Text
            style={[
              styles.phoneHint,
              {
                color: colors.textSecondary,
              },
              // Phone numbers stay LTR Latin digits.
              { fontFamily: Fonts.bodySemiBold },
            ]}
          >
            {phoneNumber}
          </Text>
        ) : null}

        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, value } }) => (
            <OtpBoxes value={value} onChange={onChange} error={errors.otp?.message} />
          )}
        />

        <Button
          title={submitting ? copy.auth.verifying : copy.auth.verifyButton}
          onPress={onSubmit}
          loading={submitting}
        />
      </View>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: Spacing.four,
    justifyContent: 'center',
  },
  form: { gap: Spacing.three },
  phoneHint: {
    fontSize: 15,
    textAlign: 'center',
    writingDirection: 'ltr',
  },
});
