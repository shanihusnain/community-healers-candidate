import { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}: SkeletonProps) {
  const colors = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.backgroundSelected,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

type ScreenSkeletonProps = {
  variant?: 'boot' | 'form' | 'cards' | 'docs' | 'list';
};

export function ScreenSkeleton({ variant = 'form' }: ScreenSkeletonProps) {
  const colors = useTheme();

  if (variant === 'boot') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Skeleton width={160} height={28} style={styles.centerSelf} />
        <Skeleton width="70%" height={14} style={[styles.centerSelf, { marginTop: 12 }]} />
        <Skeleton width="50%" height={14} style={[styles.centerSelf, { marginTop: 8 }]} />
      </View>
    );
  }

  if (variant === 'cards') {
    return (
      <View style={[styles.padded, { backgroundColor: colors.background, flex: 1 }]}>
        <Skeleton width="55%" height={28} />
        <Skeleton width="80%" height={14} style={{ marginTop: 10 }} />
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.card, { borderColor: colors.border, marginTop: 16 }]}>
            <Skeleton width="45%" height={18} />
            <Skeleton width="90%" height={12} style={{ marginTop: 10 }} />
            <Skeleton width="30%" height={12} style={{ marginTop: 10 }} />
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'docs') {
    return (
      <View style={[styles.padded, { backgroundColor: colors.background, flex: 1 }]}>
        <Skeleton width="40%" height={28} />
        <Skeleton width="75%" height={14} style={{ marginTop: 10 }} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.card, { borderColor: colors.border, marginTop: 16 }]}>
            <Skeleton width="35%" height={16} />
            <Skeleton width="100%" height={120} borderRadius={Radius.md} style={{ marginTop: 12 }} />
            <Skeleton width="100%" height={44} borderRadius={Radius.md} style={{ marginTop: 12 }} />
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'list') {
    return (
      <View style={{ gap: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} width="100%" height={64} borderRadius={Radius.md} />
        ))}
      </View>
    );
  }

  // form
  return (
    <View style={[styles.padded, { backgroundColor: colors.background, flex: 1 }]}>
      <Skeleton width="50%" height={28} />
      <Skeleton width="85%" height={14} style={{ marginTop: 10 }} />
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={{ marginTop: 18, gap: 8 }}>
          <Skeleton width="30%" height={12} />
          <Skeleton width="100%" height={48} borderRadius={Radius.md} />
        </View>
      ))}
      <Skeleton width="100%" height={48} borderRadius={Radius.md} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  padded: {
    padding: 24,
  },
  centerSelf: {
    alignSelf: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: 16,
  },
});
