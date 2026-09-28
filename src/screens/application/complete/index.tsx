import { format, isValid, parseISO } from 'date-fns';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenSkeleton } from '@/components/atoms/Skeleton';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useExamSchedule } from '@/hooks/queries/useAuthQueries';
import { useLanguage } from '@/provider/LanguageProvider';
import { centerInitials, formatTimeLabel } from '@/utils/time';

export default function RegistrationCompleteScreen() {
  const colors = useTheme();
  const { copy } = useLanguage();
  // Shares cache with AuthProvider — no extra network when already fetched.
  const scheduleQuery = useExamSchedule({ enabled: true });
  const info = scheduleQuery.data;
  const scheduled = !!info?.examScheduled;
  const waiting =
    scheduleQuery.isLoading || (scheduleQuery.isFetching && !scheduled);

  useEffect(() => {
    if (!waiting && !scheduled) {
      router.replace('/(app)/schedule');
    }
  }, [waiting, scheduled]);

  if (waiting || !scheduled || !info) {
    return <ScreenSkeleton variant="form" />;
  }

  const dateObj = (() => {
    if (!info.examDate) return new Date();
    const parsed = parseISO(info.examDate);
    return isValid(parsed) ? parsed : new Date();
  })();
  const datePart = format(dateObj, 'yyyy-MM-dd');
  const startLabel = formatTimeLabel(info.examStartTime, { fallback: '—', datePart });
  const arriveLabel = formatTimeLabel(info.arriveByTime, { fallback: '', datePart });
  const centerCode = centerInitials(info.centerName);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
      >
        <View
          style={[
            styles.banner,
            {
              backgroundColor: colors.success + '0F',
              borderColor: colors.success + '4D',
            },
          ]}
        >
          <View style={[styles.heroIcon, { backgroundColor: colors.success + '1A' }]}>
            <MaterialCommunityIcons name="party-popper" size={40} color={colors.success} />
          </View>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.success + '22',
                borderColor: colors.success + '66',
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={[styles.badgeText, { color: colors.success }]}>
              {copy.complete.registrationComplete}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {copy.complete.congratulations}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {copy.complete.successMessage}
          </Text>

          {info.wasAutoRescheduled ? (
            <View
              style={[
                styles.notice,
                {
                  backgroundColor: colors.warning + '18',
                  borderColor: colors.warning + '4D',
                },
              ]}
            >
              <Ionicons name="refresh" size={18} color={colors.warning} />
              <Text style={[styles.noticeText, { color: colors.warning }]}>
                {copy.complete.autoRescheduledNotice}
              </Text>
            </View>
          ) : null}

          <View
            style={[
              styles.scheduleCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.scheduleHeader}>
              <View
                style={[styles.scheduleHeaderIcon, { backgroundColor: colors.primary + '1A' }]}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.scheduleTitle, { color: colors.text }]}>
                  {copy.complete.examSchedule}
                </Text>
                <Text style={[styles.scheduleDesc, { color: colors.textSecondary }]}>
                  {copy.complete.scheduledDetails}
                </Text>
              </View>
            </View>

            <View style={styles.detailGrid}>
              <DetailTile
                icon="calendar-outline"
                label={copy.complete.date}
                value={format(dateObj, 'MMMM d, yyyy')}
                colors={colors}
              />
              <DetailTile
                icon="time-outline"
                label={copy.complete.time}
                value={startLabel}
                colors={colors}
              />
              <DetailTile
                icon="location-outline"
                label={copy.complete.center}
                value={centerCode}
                colors={colors}
              />
            </View>

            {arriveLabel ? (
              <View
                style={[
                  styles.arriveBy,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.arriveLabel, { color: colors.textSecondary }]}>
                  {copy.complete.arriveBy}
                </Text>
                <Text style={[styles.arriveValue, { color: colors.text }]}>{arriveLabel}</Text>
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.centerRow,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <View style={styles.flex}>
              <Text style={[styles.centerName, { color: colors.text }]}>
                {info.centerName || copy.complete.assignedCenter}
              </Text>
              <Text style={[styles.centerHint, { color: colors.textSecondary }]}>
                {copy.complete.assignedCenter}
              </Text>
              {info.centerPhone ? (
                <View style={styles.phoneRow}>
                  <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.centerHint, { color: colors.textSecondary }]}>
                    {info.centerPhone}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={[styles.nextBox, styles.nextBoxTint]}>
            <View style={styles.nextHeader}>
              <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
              <Text style={[styles.nextTitle, { color: colors.text }]}>
                {copy.complete.whatsNext}
              </Text>
            </View>
            {info.verificationMessage ? (
              <Text style={[styles.nextBody, { color: colors.text }]}>
                {info.verificationMessage}
              </Text>
            ) : null}
            <NextItem
              icon="checkmark-circle"
              iconColor={colors.success}
              text={copy.complete.visitCenter}
              colors={colors}
            />
            <NextItem
              icon="document-text-outline"
              iconColor={colors.primary}
              text={copy.complete.bringCNIC}
              colors={colors}
            />
            <NextItem
              icon="shield-checkmark-outline"
              iconColor={colors.primary}
              text={copy.complete.centerAdminExam}
              colors={colors}
            />
            <NextItem
              icon="time-outline"
              iconColor={colors.primary}
              text={copy.complete.questionsTime}
              colors={colors}
            />
          </View>

          <View style={styles.statusGrid}>
            <StatusTile
              title={copy.complete.registrationLabel}
              subtitle={copy.complete.complete}
              colors={colors}
            />
            <StatusTile
              title={copy.complete.paymentLabel}
              subtitle={copy.complete.received}
              colors={colors}
            />
            <StatusTile
              title={copy.complete.examLabel}
              subtitle={copy.complete.scheduledLabel}
              colors={colors}
            />
          </View>

          <Pressable
            onPress={() => router.replace('/(app)/profile')}
            style={({ pressed }) => [
              styles.profileBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="person-outline" size={18} color={colors.text} />
            <Text style={[styles.profileBtnText, { color: colors.text }]}>
              {copy.complete.goToProfile}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ThemeColors = ReturnType<typeof useTheme>;

function DetailTile({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.detailTile,
        {
          backgroundColor: colors.primary + '0D',
          borderColor: colors.primary + '33',
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function NextItem({
  icon,
  iconColor,
  text,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  text: string;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.nextItem}>
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text style={[styles.nextItemText, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

function StatusTile({
  title,
  subtitle,
  colors,
}: {
  title: string;
  subtitle: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.statusTile,
        {
          backgroundColor: colors.success + '1A',
          borderColor: colors.success + '4D',
        },
      ]}
    >
      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
      <Text style={[styles.statusTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.statusSubtitle, { color: colors.success }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  flex: { flex: 1 },
  banner: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.title,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  notice: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.body,
    lineHeight: 18,
  },
  scheduleCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  scheduleHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleTitle: {
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
  },
  scheduleDesc: {
    fontSize: 12,
    fontFamily: Fonts.body,
    marginTop: 2,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  detailTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.two,
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: Fonts.body,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
    textAlign: 'center',
  },
  arriveBy: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    alignItems: 'center',
  },
  arriveLabel: {
    fontSize: 11,
    fontFamily: Fonts.body,
    marginBottom: 2,
  },
  arriveValue: {
    fontSize: 15,
    fontFamily: Fonts.bodySemiBold,
  },
  centerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  centerName: {
    fontSize: 15,
    fontFamily: Fonts.bodySemiBold,
  },
  centerHint: {
    fontSize: 13,
    fontFamily: Fonts.body,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  nextBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  nextBoxTint: {
    backgroundColor: '#3B82F61A',
    borderColor: '#3B82F64D',
  },
  nextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: 2,
  },
  nextTitle: {
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
  },
  nextBody: {
    fontSize: 13,
    fontFamily: Fonts.body,
    lineHeight: 19,
    marginBottom: 4,
  },
  nextItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  nextItemText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.body,
    lineHeight: 18,
  },
  statusGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statusTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.two,
    alignItems: 'center',
    gap: 2,
  },
  statusTitle: {
    fontSize: 11,
    fontFamily: Fonts.bodySemiBold,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 10,
    fontFamily: Fonts.body,
  },
  profileBtn: {
    width: '100%',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  profileBtnText: {
    fontSize: 16,
    fontFamily: Fonts.title,
  },
});
