import { format, getDaysInMonth, isAfter, isValid, parseISO, startOfDay } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useNestedScrollGestureHandlers } from '@/components/atoms/KeyboardScreen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MINIMUM_CANDIDATE_AGE } from '@/schemas/registrationSchemas';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

type Props = {
  value?: string;
  onSave: (date: string) => void;
  onCancel: () => void;
  minimumAgeYears?: number;
};

function parseValue(value?: string): Date | null {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

function toIso(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function DobCalendar({
  value,
  onSave,
  onCancel,
  minimumAgeYears = MINIMUM_CANDIDATE_AGE,
}: Props) {
  const colors = useTheme();
  const nestedScrollHandlers = useNestedScrollGestureHandlers();
  const maxAllowed = startOfDay(
    new Date(new Date().getFullYear() - minimumAgeYears, 11, 31),
  );
  const defaultView = new Date(new Date().getFullYear() - minimumAgeYears, 0, 1);
  const initial = parseValue(value);
  const start =
    initial && !isAfter(startOfDay(initial), maxAllowed) ? initial : defaultView;

  const [month, setMonth] = useState(start.getMonth());
  const [year, setYear] = useState(start.getFullYear());
  const [selected, setSelected] = useState<string | undefined>(
    initial && !isAfter(startOfDay(initial), maxAllowed)
      ? format(initial, 'yyyy-MM-dd')
      : undefined,
  );
  const [openDropdown, setOpenDropdown] = useState<'month' | 'year' | null>(null);

  const yearOptions = useMemo(
    () => Array.from({ length: 100 }, (_, i) => maxAllowed.getFullYear() - i),
    [maxAllowed],
  );

  const weeks = useMemo(() => {
    const daysInMonth = getDaysInMonth(new Date(year, month, 1));
    // Monday = 0 … Sunday = 6
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const cells: (number | null)[] = [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [month, year]);

  const canGoNextMonth = () => {
    const next = month === 11 ? new Date(year + 1, 0, 1) : new Date(year, month + 1, 1);
    return !isAfter(next, new Date(maxAllowed.getFullYear(), maxAllowed.getMonth(), 1));
  };

  const goPrev = () => {
    setOpenDropdown(null);
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (!canGoNextMonth()) return;
    setOpenDropdown(null);
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const selectYear = (nextYear: number) => {
    setYear(nextYear);
    if (nextYear === maxAllowed.getFullYear() && month > maxAllowed.getMonth()) {
      setMonth(maxAllowed.getMonth());
    }
    setOpenDropdown(null);
  };

  const selectMonth = (index: number) => {
    if (year === maxAllowed.getFullYear() && index > maxAllowed.getMonth()) return;
    setMonth(index);
    setOpenDropdown(null);
  };

  const pickDay = (day: number) => {
    setOpenDropdown(null);
    const iso = toIso(year, month, day);
    const date = parseISO(iso);
    if (isAfter(startOfDay(date), maxAllowed)) return;
    setSelected(iso);
  };

  const rangeLabel = (() => {
    const startDay = new Date(year, month, 1);
    const endDay = new Date(year, month + 1, 0);
    return `${format(startDay, 'MMM d')} – ${format(endDay, 'MMM d, yyyy')}`;
  })();

  const dropdownItems =
    openDropdown === 'month'
      ? MONTHS.map((label, index) => ({
          key: label,
          label,
          selected: index === month,
          disabled: year === maxAllowed.getFullYear() && index > maxAllowed.getMonth(),
          onPress: () => selectMonth(index),
        }))
      : openDropdown === 'year'
        ? yearOptions.map((y) => ({
            key: String(y),
            label: String(y),
            selected: y === year,
            disabled: false,
            onPress: () => selectYear(y),
          }))
        : [];

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.dropdownCol}>
          <Pressable
            onPress={() => setOpenDropdown((d) => (d === 'month' ? null : 'month'))}
            style={[
              styles.dropdownBtn,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: openDropdown === 'month' ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>
              {MONTHS[month]}
            </Text>
            <Ionicons
              name={openDropdown === 'month' ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.textSecondary}
            />
          </Pressable>
          {openDropdown === 'month' ? (
            <View
              {...nestedScrollHandlers}
              style={[
                styles.dropdownPanel,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                style={styles.dropdownScroll}
              >
                {dropdownItems.map((item) => (
                  <Pressable
                    key={item.key}
                    disabled={item.disabled}
                    onPress={item.onPress}
                    style={[
                      styles.listItem,
                      item.selected && { backgroundColor: colors.backgroundElement },
                      item.disabled && { opacity: 0.35 },
                    ]}
                  >
                    <Text
                      style={{
                        color: item.selected ? colors.primary : colors.text,
                        fontWeight: item.selected ? '700' : '400',
                        fontSize: 15,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        <View style={styles.dropdownCol}>
          <Pressable
            onPress={() => setOpenDropdown((d) => (d === 'year' ? null : 'year'))}
            style={[
              styles.dropdownBtn,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: openDropdown === 'year' ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>{year}</Text>
            <Ionicons
              name={openDropdown === 'year' ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.textSecondary}
            />
          </Pressable>
          {openDropdown === 'year' ? (
            <View
              {...nestedScrollHandlers}
              style={[
                styles.dropdownPanel,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                style={styles.dropdownScroll}
              >
                {dropdownItems.map((item) => (
                  <Pressable
                    key={item.key}
                    disabled={item.disabled}
                    onPress={item.onPress}
                    style={[
                      styles.listItem,
                      item.selected && { backgroundColor: colors.backgroundElement },
                      item.disabled && { opacity: 0.35 },
                    ]}
                  >
                    <Text
                      style={{
                        color: item.selected ? colors.primary : colors.text,
                        fontWeight: item.selected ? '700' : '400',
                        fontSize: 15,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.navRow}>
        <Pressable onPress={goPrev} hitSlop={8} style={styles.navArrow}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.rangeLabel, { color: colors.text }]}>{rangeLabel}</Text>
        <Pressable
          onPress={goNext}
          hitSlop={8}
          style={[styles.navArrow, !canGoNextMonth() && { opacity: 0.35 }]}
          disabled={!canGoNextMonth()}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={[styles.weekday, { color: colors.textSecondary }]}>
            {d}
          </Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            if (day == null) {
              return <View key={`e-${di}`} style={styles.dayCell} />;
            }
            const iso = toIso(year, month, day);
            const disabled = isAfter(startOfDay(parseISO(iso)), maxAllowed);
            const isSelected = selected === iso;
            return (
              <Pressable
                key={iso}
                disabled={disabled}
                onPress={() => pickDay(day)}
                style={styles.dayCell}
              >
                <View
                  style={[
                    styles.dayInner,
                    isSelected && { backgroundColor: colors.primary },
                    disabled && { opacity: 0.3 },
                  ]}
                >
                  <Text
                    style={{
                      color: isSelected ? colors.primaryForeground : colors.text,
                      fontWeight: isSelected ? '700' : '500',
                      fontSize: 14,
                    }}
                  >
                    {day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.actions}>
        <Pressable
          onPress={() => selected && onSave(selected)}
          disabled={!selected}
          style={[
            styles.okBtn,
            {
              borderColor: colors.primary,
              opacity: selected ? 1 : 0.45,
            },
          ]}
        >
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>OK</Text>
        </Pressable>
        <Pressable onPress={onCancel} style={styles.cancelBtn}>
          <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 13 }}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: 'visible',
    paddingBottom: Spacing.three,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    zIndex: 20,
  },
  dropdownCol: {
    flex: 1,
    maxWidth: 160,
    position: 'relative',
    zIndex: 21,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownPanel: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    maxHeight: 200,
    zIndex: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.two,
    zIndex: 1,
  },
  navArrow: {
    padding: 4,
  },
  rangeLabel: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 160,
    textAlign: 'center',
  },
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.two,
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.two,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 42,
  },
  dayInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  okBtn: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});
