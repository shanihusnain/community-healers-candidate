import { Redirect } from 'expo-router';
import { ScreenSkeleton } from '@/components/atoms/Skeleton';
import { useAuth } from '@/provider/AuthProvider';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <ScreenSkeleton variant="boot" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <>{children}</>;
}
