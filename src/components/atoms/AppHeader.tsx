import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function AppHeader({ title, showBack = true, onBack, right }: Props) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top,
          backgroundColor: colors.primary,
          borderBottomColor: colors.primary,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.side}>
          {showBack ? (
            <Pressable
              onPress={handleBack}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backBtn}
            >
              <Ionicons
                name={I18nManager.isRTL ? 'chevron-forward' : 'chevron-back'}
                size={24}
                color={colors.primaryForeground}
              />
            </Pressable>
          ) : null}
        </View>
        <Text style={[styles.title, { color: colors.primaryForeground }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.side, styles.sideEnd]}>{right}</View>
      </View>
    </View>
  );
}

/** Stack `header` options that match Community Healers branding. */
export function getThemedStackHeaderOptions(title?: string) {
  return {
    headerShown: true as const,
    ...(title ? { title } : {}),
    headerStyle: {
      backgroundColor: Colors.light.primary,
    },
    headerTintColor: Colors.light.primaryForeground,
    headerTitleStyle: {
      fontFamily: Fonts.display,
      fontSize: 18,
      color: Colors.light.primaryForeground,
    },
    headerShadowVisible: false,
    headerBackTitle: '',
  };
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  side: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideEnd: {
    alignItems: 'flex-end',
  },
  backBtn: {
    padding: 6,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.display,
    fontSize: 18,
  },
});
