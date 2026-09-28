import { router } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/atoms/Button';
import { KeyboardScreen } from '@/components/atoms/KeyboardScreen';
import { LanguageToggle } from '@/components/atoms/LanguageToggle';
import { ScreenHeader } from '@/components/atoms/ScreenHeader';
import { ScreenSkeleton } from '@/components/atoms/Skeleton';
import { Fonts, Radius, Spacing, getLocaleFontStyle } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useExamSchedule } from '@/hooks/queries/useAuthQueries';
import { useCandidateMe, useDocumentValidation, usePaymentStatus } from '@/hooks/queries/useCandidateQueries';
import { useAuth } from '@/provider/AuthProvider';
import { useLanguage } from '@/provider/LanguageProvider';

type StepStatus = 'complete' | 'current' | 'upcoming' | 'locked';

function StepCard({
  title,
  description,
  status,
  onPress,
}: {
  title: string;
  description: string;
  status: StepStatus;
  onPress?: () => void;
}) {
  const colors = useTheme();
  const { isUrdu } = useLanguage();
  const disabled = status === 'locked' || status === 'upcoming';

  return (
    <Pressable
      disabled={disabled || !onPress}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor:
            status === 'current'
              ? colors.primary
              : status === 'complete'
                ? colors.success
                : colors.border,
          opacity: status === 'locked' ? 0.55 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.cardTitle,
          {
            color: colors.text,
            textAlign: 'left',
            writingDirection: isUrdu ? 'rtl' : 'ltr',
          },
          getLocaleFontStyle(isUrdu, Fonts.title, 'bold'),
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          {
            color: colors.textSecondary,
            marginTop: 4,
            textAlign: 'left',
            writingDirection: isUrdu ? 'rtl' : 'ltr',
          },
          getLocaleFontStyle(isUrdu, Fonts.body, 'regular'),
        ]}
      >
        {description}
      </Text>
      <Text
        style={[
          {
            marginTop: 8,
            color:
              status === 'complete'
                ? colors.success
                : status === 'current'
                  ? colors.primary
                  : colors.textSecondary,
            textTransform: 'capitalize',
            textAlign: 'left',
            writingDirection: isUrdu ? 'rtl' : 'ltr',
          },
          getLocaleFontStyle(isUrdu, Fonts.bodySemiBold, 'semiBold'),
        ]}
      >
        {status}
      </Text>
    </Pressable>
  );
}

export default function ApplicationHomeScreen() {
  const { logout, examScheduleInfo } = useAuth();
  const { copy, isUrdu } = useLanguage();
  const colors = useTheme();

  const meQuery = useCandidateMe();
  const docsQuery = useDocumentValidation();
  const paymentQuery = usePaymentStatus();
  const scheduleQuery = useExamSchedule({ enabled: true });

  const me = meQuery.data;
  const profileComplete = !!(me?.fatherName && me?.cnic && me?.dob && me?.tehsil?.id && me?.address);
  const docsReady = !!docsQuery.data?.canProceedToPayment;
  const paymentDone =
    paymentQuery.data?.status === 'PAID' ||
    !!paymentQuery.data?.canProceedToExam ||
    !!me?.payment?.isPaid;
  const scheduled =
    !!examScheduleInfo?.examScheduled || !!scheduleQuery.data?.examScheduled;

  const personalStatus: StepStatus = profileComplete ? 'complete' : 'current';
  const docsStatus: StepStatus = !profileComplete
    ? 'locked'
    : docsReady
      ? 'complete'
      : 'current';
  const paymentStatus: StepStatus = !docsReady
    ? 'locked'
    : paymentDone
      ? 'complete'
      : 'current';
  const scheduleStatus: StepStatus = !paymentDone
    ? 'locked'
    : scheduled
      ? 'complete'
      : 'current';

  if (meQuery.isLoading) {
    return <ScreenSkeleton variant="cards" />;
  }

  return (
    <KeyboardScreen
      edges={['bottom', 'left', 'right']}
      contentContainerStyle={styles.content}
    >
      <LanguageToggle />
      <ScreenHeader
        title={copy.wizard.applicationProgress}
        subtitle={copy.wizard.completeAllSteps}
      />

      {scheduled ? (
        <Pressable
          onPress={() => router.push('/(app)/profile')}
          style={[
            styles.doneBanner,
            { backgroundColor: colors.primary + '18', borderColor: colors.primary },
          ]}
        >
          <Text
            style={[
              { color: colors.primary, fontSize: 16, writingDirection: isUrdu ? 'rtl' : 'ltr' },
              getLocaleFontStyle(isUrdu, Fonts.title, 'bold'),
            ]}
          >
            {copy.home.trainingScheduled}
          </Text>
          <Text
            style={[
              {
                color: colors.textSecondary,
                marginTop: 4,
                writingDirection: isUrdu ? 'rtl' : 'ltr',
              },
              getLocaleFontStyle(isUrdu, Fonts.body, 'regular'),
            ]}
          >
            {scheduleQuery.data?.centerName || examScheduleInfo?.centerName || 'Center assigned'}
            {scheduleQuery.data?.examDate || examScheduleInfo?.examDate
              ? ` · ${scheduleQuery.data?.examDate || examScheduleInfo?.examDate}`
              : ''}
          </Text>
          <Text
            style={[
              {
                color: colors.primary,
                marginTop: 8,
                fontSize: 13,
                writingDirection: isUrdu ? 'rtl' : 'ltr',
              },
              getLocaleFontStyle(isUrdu, Fonts.body, 'semiBold'),
            ]}
          >
            {copy.home.viewCompletion}
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.steps}>
        <StepCard
          title={copy.home.personalInfo}
          description={copy.home.personalInfoDesc}
          status={personalStatus}
          onPress={() => router.push('/(app)/personal-info')}
        />
        <StepCard
          title={copy.home.documents}
          description={copy.home.documentsDesc}
          status={docsStatus}
          onPress={() => router.push('/(app)/documents')}
        />
        <StepCard
          title={copy.home.payment}
          description={copy.home.paymentDesc}
          status={paymentStatus}
          onPress={() => router.push('/(app)/payment')}
        />
        <StepCard
          title={copy.home.schedule}
          description={copy.home.scheduleDesc}
          status={scheduleStatus}
          onPress={() =>
            router.push(scheduled ? '/(app)/profile' : '/(app)/schedule')
          }
        />
      </View>

      <Button title={copy.nav.logout} variant="ghost" onPress={() => void logout()} />
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  steps: { gap: Spacing.three },
  card: {
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  cardTitle: { fontSize: 17, fontFamily: Fonts.title },
  doneBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
});
