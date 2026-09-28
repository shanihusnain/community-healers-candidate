import { useState } from 'react';
import {
  ActivityIndicator,
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { BilingualLabel } from '@/components/atoms/BilingualLabel';
import { useNestedScrollGestureHandlers } from '@/components/atoms/KeyboardScreen';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Option = { label: string; value: string };

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  labelUrdu?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  /** Leading icon (web PersonalInfoForm Landmark / MapPin). */
  leftIcon?: IconName;
  loading?: boolean;
};

function physicalTextAlign(): 'left' | 'right' {
  return I18nManager.isRTL ? 'right' : 'left';
}

export function SelectField({
  label,
  labelUrdu,
  value,
  options,
  onChange,
  error,
  disabled,
  placeholder = 'Select…',
  leftIcon,
  loading,
}: Props) {
  const colors = useTheme();
  const nestedScrollHandlers = useNestedScrollGestureHandlers();
  const [open, setOpen] = useState(false);
  const menuOpen = open && !disabled;
  const selected = options.find((o) => o.value === value);

  const handleSelect = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <View style={[styles.wrap, menuOpen && styles.wrapOpen]}>
      {labelUrdu ? (
        <BilingualLabel en={label} ur={labelUrdu} />
      ) : (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen((prev) => !prev)}
        style={[
          styles.field,
          {
            backgroundColor: colors.card,
            borderColor: menuOpen ? colors.primary : error ? colors.danger : colors.border,
            opacity: disabled ? 0.5 : 1,
            direction: 'ltr',
          },
        ]}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color={colors.textSecondary} />
        ) : null}
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: selected ? colors.text : colors.textSecondary,
            fontSize: 16,
            fontFamily: Fonts.body,
            textAlign: physicalTextAlign(),
          }}
        >
          {selected?.label ?? placeholder}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons
            name={menuOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textSecondary}
          />
        )}
      </Pressable>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      {menuOpen ? (
        <View
          {...nestedScrollHandlers}
          style={[
            styles.menu,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={styles.menuScroll}
          >
            {loading ? (
              <View style={styles.empty}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : options.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No options available
              </Text>
            ) : (
              options.map((item) => {
                const active = item.value === value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => handleSelect(item.value)}
                    style={[
                      styles.option,
                      active && { backgroundColor: colors.backgroundElement },
                    ]}
                  >
                    <Text
                      style={{
                        flex: 1,
                        color: active ? colors.primary : colors.text,
                        fontWeight: active ? '700' : '400',
                        fontSize: 16,
                        fontFamily: Fonts.body,
                        textAlign: physicalTextAlign(),
                      }}
                    >
                      {item.label}
                    </Text>
                    {active ? (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
    zIndex: 1,
  },
  wrapOpen: {
    zIndex: 40,
  },
  label: { fontSize: 14, fontFamily: Fonts.bodySemiBold, textAlign: 'left' },
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  error: { fontSize: 12, fontFamily: Fonts.body, textAlign: 'left' },
  menu: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    marginTop: 4,
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    maxHeight: 220,
    zIndex: 50,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuScroll: {
    maxHeight: 220,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  empty: {
    padding: Spacing.four,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    padding: Spacing.four,
    fontSize: 14,
    fontFamily: Fonts.body,
  },
});
