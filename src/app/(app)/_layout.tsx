import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getThemedStackHeaderOptions } from '@/components/atoms/AppHeader';
import { ProtectedRoute } from '@/provider/ProtectedRoute';
import { useLanguage } from '@/provider/LanguageProvider';

export default function AppLayout() {
  const { copy } = useLanguage();

  return (
    <ProtectedRoute>
      <StatusBar style="light" />
      <Stack screenOptions={getThemedStackHeaderOptions()}>
        <Stack.Screen
          name="index"
          options={{
            ...getThemedStackHeaderOptions(copy.nav.application),
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="personal-info"
          options={getThemedStackHeaderOptions(copy.personalInfo.title)}
        />
        <Stack.Screen
          name="documents"
          options={getThemedStackHeaderOptions(copy.documents.title)}
        />
        <Stack.Screen
          name="payment"
          options={getThemedStackHeaderOptions(copy.payment.title)}
        />
        <Stack.Screen
          name="schedule"
          options={getThemedStackHeaderOptions(copy.scheduling.title)}
        />
        <Stack.Screen
          name="complete"
          options={getThemedStackHeaderOptions(copy.complete.title)}
        />
        <Stack.Screen
          name="profile"
          options={getThemedStackHeaderOptions(copy.profile.title)}
        />
      </Stack>
    </ProtectedRoute>
  );
}
