import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { AppFonts, Radius } from '@/constants/theme';

type Props = {
  passed: boolean;
  /** Small line under the verdict, e.g. the date or the score. */
  note?: string;
};

const PASS = '#B3121B';
const FAIL = '#5A616B';

/**
 * Frau Dr. Hofstätter's stamp.
 *
 * Deliberately not a toast or a badge: the guide asks for a physical mark, and
 * for no celebration below the pass line - so a failed verdict is stamped in
 * grey, in the same shape, rather than softened or hidden.
 */
export function Stamp({ passed, note }: Props) {
  const color = passed ? PASS : FAIL;
  const label = passed ? 'BESTANDEN' : 'NICHT BESTANDEN';

  // The stamp comes down onto the page: oversized and level, then driven to
  // size and settling into its angle. Motion carries the meaning here, so it is
  // the only place it is used on this screen.
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withSequence(
      withTiming(1, { duration: 220, easing: Easing.bezier(0.2, 0.9, 0.2, 1) }),
      withTiming(0.94, { duration: 90 }),
      withTiming(1, { duration: 120 })
    );
  }, [progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : 1,
    transform: [
      { scale: 1 + (1 - progress.value) * 0.7 },
      { rotate: `${-6 * progress.value}deg` },
    ],
  }));

  return (
    <Animated.View
      accessible
      accessibilityLabel={`Bewertung: ${label}${note ? `. ${note}` : ''}`}
      style={[styles.stamp, { borderColor: color }, animatedStyle]}>
      <Animated.View style={[styles.inner, { borderColor: color }]}>
        <ThemedText style={[styles.label, { color }]}>{label}</ThemedText>
        {note ? <ThemedText style={[styles.note, { color }]}>{note}</ThemedText> : null}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    alignSelf: 'flex-start',
    borderWidth: 3,
    borderRadius: Radius.small,
    padding: 3,
    opacity: 0.9,
  },
  inner: { borderWidth: 1, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 6, alignItems: 'center' },
  label: { fontFamily: AppFonts.bodyBold, fontSize: 18, letterSpacing: 2.2 },
  note: { fontFamily: AppFonts.bodyMedium, fontSize: 10, letterSpacing: 1.4, marginTop: 2, opacity: 0.85 },
});
