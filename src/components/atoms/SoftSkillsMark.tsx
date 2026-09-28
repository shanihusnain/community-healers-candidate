import { StyleSheet, View } from 'react-native';

/**
 * SoftSkills header mark from community-healers LandingTest.css `.brand-symbol`
 * (rounded lime bars, dark green tile, slight counter-clockwise tilt).
 */
export function SoftSkillsMark({ size = 42 }: { size?: number }) {
  // Web: 42×45 tile. Keep aspect.
  const width = size;
  const height = Math.round(size * (45 / 42));
  const scale = size / 42;
  const pad = 11 * scale;
  const barW = 5 * scale;
  const gap = 3 * scale;
  const radius = 10 * scale;
  const barRadius = 2 * scale;
  const heights = [11, 18, 25].map((h) => h * scale);

  return (
    <View
      style={[
        styles.tile,
        {
          width,
          height,
          padding: pad,
          borderRadius: radius,
          transform: [{ rotate: '-4deg' }],
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel="SoftSkills"
    >
      <View style={[styles.bars, { gap }]}>
        {heights.map((h, i) => (
          <View
            key={i}
            style={{
              width: barW,
              height: h,
              borderRadius: barRadius,
              backgroundColor: '#dcf5aa',
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#174c3e',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    direction: 'ltr',
  },
});
