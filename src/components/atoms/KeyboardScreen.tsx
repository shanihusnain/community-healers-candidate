import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTheme } from "@/hooks/use-theme";
import {
  Platform,
  StyleProp,
  StyleSheet,
  ViewProps,
  ViewStyle,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

type Edge = "top" | "bottom" | "left" | "right";

type Props = {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  /** Extra space above the keyboard when focusing a field. */
  extraScrollHeight?: number;
  /**
   * Safe-area edges.
   * Under a Stack header use `['bottom','left','right']` so top isn’t double-padded.
   */
  edges?: Edge[];
};

const ScreenScrollLockContext = createContext<
  ((locked: boolean) => void) | null
>(null);

/** Disable the parent KeyboardScreen scroll while a nested list is being touched. */
export function useScreenScrollLock() {
  return useContext(ScreenScrollLockContext);
}

type NestedScrollHandlers = Pick<
  ViewProps,
  "onTouchStart" | "onTouchEnd" | "onTouchCancel"
>;

/**
 * Attach to a dropdown panel so the screen stays scrollable while the menu is
 * open, but parent scroll is locked only while the finger is on the menu.
 */
export function useNestedScrollGestureHandlers(): NestedScrollHandlers {
  const setScrollLock = useScreenScrollLock();

  const lock = useCallback(() => setScrollLock?.(true), [setScrollLock]);
  const unlock = useCallback(() => setScrollLock?.(false), [setScrollLock]);

  useEffect(() => () => setScrollLock?.(false), [setScrollLock]);

  return useMemo(
    () => ({
      onTouchStart: lock,
      onTouchEnd: unlock,
      onTouchCancel: unlock,
    }),
    [lock, unlock],
  );
}

/**
 * Scroll screen that stays clear of the keyboard and the system navigation bar.
 *
 * Android’s 3-button / translucent nav often overlays the window with
 * `insets.bottom === 0`. A real spacer at the end of the scroll content is
 * more reliable than paddingBottom alone.
 */
export function KeyboardScreen({
  children,
  contentContainerStyle,
  style,
  extraScrollHeight,
  edges = ["top", "bottom", "left", "right"],
}: Props) {
  const colors = useTheme();
  const [scrollLocked, setScrollLocked] = useState(false);

  const setScrollLock = useCallback((locked: boolean) => {
    setScrollLocked(locked);
  }, []);

  const lockApi = useMemo(() => setScrollLock, [setScrollLock]);

  // Top/left/right via SafeAreaView; bottom handled by scroll content / nav spacer.
  const safeEdges = edges.filter(
    (e): e is Exclude<Edge, "bottom"> => e !== "bottom",
  );

  return (
    <ScreenScrollLockContext.Provider value={lockApi}>
      <SafeAreaView
        style={[{ flex: 1, backgroundColor: colors.background }, style]}
        edges={safeEdges}
      >
        <KeyboardAwareScrollView
          style={styles.scroll}
          contentContainerStyle={contentContainerStyle}
          scrollEnabled={!scrollLocked}
          enableOnAndroid
          enableAutomaticScroll={!scrollLocked}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          enableResetScrollToCoords={false}
          keyboardOpeningTime={0}
          extraScrollHeight={
            extraScrollHeight ?? (Platform.OS === "ios" ? 24 : 80)
          }
          contentInsetAdjustmentBehavior="never"
        >
          {children}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ScreenScrollLockContext.Provider>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
});
