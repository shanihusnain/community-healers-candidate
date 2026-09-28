import { Stack } from 'expo-router';
import { PublicRoute } from '@/provider/PublicRoute';

export default function AuthLayout() {
  return (
    <PublicRoute>
      <Stack screenOptions={{ headerShown: false }} />
    </PublicRoute>
  );
}
