import { format, isValid, parseISO } from 'date-fns';
import { useState } from 'react';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DobCalendar } from '@/components/molecules/DobCalendar';
import { BilingualLabel } from '@/components/atoms/BilingualLabel';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MINIMUM_CANDIDATE_AGE } from '@/schemas/registrationSchemas';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  labelUrdu?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  minimumAgeYears?: number;
  /** Leading icon (web uses Calendar on the left). */
  leftIcon?: IconName;
};

function displayValue(value: string): string {
  if (!value) return '';
  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;
  return format(parsed, 'dd/MM/yyyy');
}

function physicalTextAlign(): 'left' | 'right' {
  return I18nManager.isRTL ? 'right' : 'left';
}

export function DateField({
  label,
  labelUrdu,
  value,
  onChange,
  error,
  placeholder = 'Select date of birth',
  minimumAgeYears = MINIMUM_CANDIDATE_AGE,
  leftIcon = 'calendar-outline',
}: Props) {
  const colors = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      {labelUrdu ? (
        <BilingualLabel en={label} ur={labelUrdu} />
      ) : (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={[
          styles.field,
          {
            backgroundColor: colors.card,
            borderColor: open ? colors.primary : error ? colors.danger : colors.border,
            direction: 'ltr',
          },
        ]}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color={colors.textSecondary} />
        ) : null}
        <Text
          style={{
            flex: 1,
            color: value ? colors.text : colors.textSecondary,
            fontSize: 16,
            fontFamily: Fonts.body,
            textAlign: physicalTextAlign(),
          }}
        >
          {value ? displayValue(value) : placeholder}
        </Text>
      </Pressable>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      {open ? (
        <View style={styles.calendarWrap}>
          <DobCalendar
            value={value}
            minimumAgeYears={minimumAgeYears}
            onSave={(date) => {
              onChange(date);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    textAlign: 'left',
  },
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  error: {
    fontSize: 12,
    fontFamily: Fonts.body,
    textAlign: 'left',
  },
  calendarWrap: {
    marginTop: Spacing.two,
    zIndex: 10,
    overflow: 'visible',
  },
});
