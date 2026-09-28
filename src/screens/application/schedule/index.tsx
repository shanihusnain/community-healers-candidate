import { addDays, format } from 'date-fns';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/atoms/Button';
import { KeyboardScreen } from '@/components/atoms/KeyboardScreen';
import { ScreenSkeleton, Skeleton } from '@/components/atoms/Skeleton';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useExamSchedule } from '@/hooks/queries/useAuthQueries';
import {
  useEligibleCities,
  useScheduleExam,
} from '@/hooks/queries/useCandidateQueries';
import { getApiErrorMessage } from '@/lib/errors';
import { useLanguage } from '@/provider/LanguageProvider';

function buildDateOptions(count = 14) {
  const start = addDays(new Date(), 1);
  return Array.from({ length: count }, (_, i) => {
    const d = addDays(start, i);
    return {
      value: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE, MMM d'),
    };
  });
}

export default function ScheduleScreen() {
  const colors = useTheme();
  const { copy } = useLanguage();
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const [examDate, setExamDate] = useState<string | undefined>();
  const [cityId, setCityId] = useState<string | undefined>();

  const scheduleInfo = useExamSchedule({ enabled: true });
  const citiesQuery = useEligibleCities(examDate);
  const scheduleMutation = useScheduleExam();

  const alreadyScheduled = !!scheduleInfo.data?.examScheduled;
  const cities = citiesQuery.data?.cities ?? [];

  useEffect(() => {
    if (alreadyScheduled) {
      router.replace('/(app)/complete');
    }
  }, [alreadyScheduled]);

  const handleSchedule = async () => {
    if (!examDate || !cityId) return;
    try {
      const result = await scheduleMutation.mutateAsync({ examDate, cityId });
      Toast.show({
        type: 'success',
        text1: 'Training scheduled',
        text2: result.message || result.data?.centerName,
      });
      router.replace('/(app)/complete');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Scheduling failed',
        text2: getApiErrorMessage(error),
      });
    }
  };

  if (scheduleInfo.isLoading || alreadyScheduled) {
    return <ScreenSkeleton variant="form" />;
  }

  return (
    <KeyboardScreen edges={['bottom', 'left', 'right']} contentContainerStyle={styles.content}>
      <Text
        style={{
          color: colors.textSecondary,
          marginBottom: Spacing.two,
          fontFamily: Fonts.body,
        }}
      >
        {copy.scheduling.description}
      </Text>

      <Text style={[styles.section, { color: colors.text }]}>
        {copy.scheduling.selectDate}
      </Text>
      <View style={styles.chips}>
        {dateOptions.map((d) => {
          const active = d.value === examDate;
          return (
            <Pressable
              key={d.value}
              onPress={() => {
                setExamDate(d.value);
                setCityId(undefined);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.backgroundElement,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? colors.primaryForeground : colors.text,
                  fontWeight: active ? '700' : '400',
                }}
              >
                {d.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {examDate ? (
        <>
          <Text style={[styles.section, { color: colors.text }]}>
            {copy.scheduling.selectCity}
          </Text>
          {citiesQuery.isFetching ? (
            <View style={styles.list}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width="100%" height={64} borderRadius={Radius.md} />
              ))}
            </View>
          ) : cities.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>
              No cities with available slots for this date.
            </Text>
          ) : (
            <View style={styles.list}>
              {cities.map((city) => {
                const active = city.cityId === cityId;
                return (
                  <Pressable
                    key={city.cityId}
                    onPress={() => setCityId(city.cityId)}
                    style={[
                      styles.cityCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: colors.text, fontWeight: '700' }}>
                      {city.cityName}
                    </Text>
                    <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                      {city.availableSlots} slots
                      {city.distanceKm != null ? ` · ${city.distanceKm.toFixed(1)} km` : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </>
      ) : null}

      <Button
        title={copy.scheduling.scheduleExam}
        onPress={() => void handleSchedule()}
        disabled={!examDate || !cityId}
        loading={scheduleMutation.isPending}
      />
      <Button title={copy.scheduling.back} variant="ghost" onPress={() => router.back()} />
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  section: { fontSize: 16, fontFamily: Fonts.title },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
  },
  list: { gap: Spacing.two },
  cityCard: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
});
