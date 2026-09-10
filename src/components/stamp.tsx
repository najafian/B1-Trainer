import { StyleSheet, View } from 'react-native';

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

  return (
    <View
      accessible
      accessibilityLabel={`Bewertung: ${label}${note ? `. ${note}` : ''}`}
      style={[styles.stamp, { borderColor: color }]}>
      <View style={[styles.inner, { borderColor: color }]}>
        <ThemedText style={[styles.label, { color }]}>{label}</ThemedText>
        {note ? <ThemedText style={[styles.note, { color }]}>{note}</ThemedText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    alignSelf: 'flex-start',
    borderWidth: 3,
    borderRadius: Radius.small,
    padding: 3,
    transform: [{ rotate: '-6deg' }],
    opacity: 0.9,
  },
  inner: { borderWidth: 1, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 6, alignItems: 'center' },
  label: { fontFamily: AppFonts.bodyBold, fontSize: 18, letterSpacing: 2.2 },
  note: { fontFamily: AppFonts.bodyMedium, fontSize: 10, letterSpacing: 1.4, marginTop: 2, opacity: 0.85 },
});
