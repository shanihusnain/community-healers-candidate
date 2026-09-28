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
import { candidateLoginSchema, CandidateLoginInput } from '@/schemas/authSchemas';

export default function LoginScreen() {
  const { loginCandidate } = useAuth();
  const { copy, isUrdu } = useLanguage();
  const colors = useTheme();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateLoginInput>({
    resolver: zodResolver(candidateLoginSchema),
    defaultValues: { phoneNumber: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await loginCandidate(values);
      router.replace('/(app)');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: copy.auth.loginFailed,
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
        eyebrow={copy.auth.loginEyebrow}
        title={copy.auth.loginTitle}
        subtitle={copy.auth.loginDesc}
        showLogo
      />
      <View style={styles.form}>
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
              placeholder={copy.auth.passwordPlaceholderLogin}
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />
        <Button
          title={submitting ? copy.auth.pleaseWait : copy.auth.loginButton}
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
          {copy.auth.noAccount}{' '}
          <Link
            href="/(auth)/signup"
            style={[
              { color: colors.primary },
              getLocaleFontStyle(isUrdu, Fonts.bodySemiBold, 'semiBold'),
            ]}
          >
            {copy.auth.signUpLink}
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
    paddingBottom: Spacing.six,
    justifyContent: 'center',
  },
  form: { gap: Spacing.three },
  hint: { fontSize: 12, marginTop: -Spacing.two, textAlign: 'left' },
  notice: { fontSize: 12, lineHeight: 18 },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    fontSize: 14,
  },
});
