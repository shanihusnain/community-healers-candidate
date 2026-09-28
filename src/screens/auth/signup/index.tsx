import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/atoms/Button';
import { KeyboardScreen } from '@/components/atoms/KeyboardScreen';
import { LanguageToggle } from '@/components/atoms/LanguageToggle';
import { ScreenHeader } from '@/components/atoms/ScreenHeader';
import { TextField } from '@/components/atoms/TextField';
import { Fonts, Spacing, getLocaleFontStyle } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getApiErrorMessage } from '@/lib/errors';
import { useAuth } from '@/provider/AuthProvider';
import { useLanguage } from '@/provider/LanguageProvider';
import { candidateSignupSchema, CandidateSignupInput } from '@/schemas/authSchemas';

export default function SignupScreen() {
  const { signup } = useAuth();
  const { copy, isUrdu } = useLanguage();
  const colors = useTheme();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateSignupInput>({
    resolver: zodResolver(candidateSignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const result = await signup(values);
      Toast.show({
        type: 'success',
        text1: copy.auth.otpSent,
        text2: result.otp ? `Dev OTP: ${result.otp}` : undefined,
      });
      router.push({
        pathname: '/(auth)/otp',
        params: { phoneNumber: values.phoneNumber },
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: copy.auth.signupFailed,
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
        eyebrow={copy.auth.signupEyebrow}
        title={copy.auth.signupTitle}
        subtitle={copy.auth.signupDesc}
        showLogo
      />
      <View style={styles.form}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={copy.auth.firstName}
              placeholder={copy.auth.firstNamePlaceholder}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.firstName?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={copy.auth.lastName}
              placeholder={copy.auth.lastNamePlaceholder}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.lastName?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={copy.auth.email}
              placeholder={copy.auth.emailPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={copy.auth.mobile}
              placeholder={copy.auth.mobilePlaceholder}
              keyboardType="phone-pad"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.phoneNumber?.message}
            />
          )}
        />
        <Text
          style={[
            styles.hint,
            {
              color: colors.textSecondary,
              writingDirection: isUrdu ? 'rtl' : 'ltr',
            },
            getLocaleFontStyle(isUrdu, Fonts.body, 'regular'),
          ]}
        >
          {copy.auth.mobileHint}
        </Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={copy.auth.password}
              placeholder={copy.auth.passwordPlaceholderSignup}
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={copy.auth.confirmPassword}
              placeholder={copy.auth.confirmPasswordPlaceholder}
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.confirmPassword?.message}
            />
          )}
        />
        <Button
          title={submitting ? copy.auth.pleaseWait : copy.auth.signupButton}
          onPress={onSubmit}
          loading={submitting}
        />
        <Text
          style={[
            styles.notice,
            {
              color: colors.textSecondary,
              textAlign: 'center',
              writingDirection: isUrdu ? 'rtl' : 'ltr',
            },
            getLocaleFontStyle(isUrdu, Fonts.body, 'regular'),
          ]}
        >
          {copy.auth.secureNotice}
        </Text>
        <Text
          style={[
            styles.footer,
            {
              color: colors.textSecondary,
              writingDirection: isUrdu ? 'rtl' : 'ltr',
            },
            getLocaleFontStyle(isUrdu, Fonts.body, 'regular'),
          ]}
        >
          {copy.auth.haveAccount}{' '}
          <Link
            href="/(auth)/login"
            style={[
              { color: colors.primary },
              getLocaleFontStyle(isUrdu, Fonts.bodySemiBold, 'semiBold'),
            ]}
          >
            {copy.auth.signInLink}
          </Link>
        </Text>
      </View>
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
  },
  form: { gap: Spacing.three },
  hint: { fontSize: 12, marginTop: -Spacing.two, textAlign: 'left' },
  notice: { fontSize: 12, lineHeight: 18 },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
    fontSize: 14,
  },
});
