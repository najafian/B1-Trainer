import { StyleSheet, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LinieB1 } from '@/constants/lines';
import { AppFonts, Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  reached: number;
  total: number;
  currentStation: number;
};

const NOTCH_COUNT = 9;

/**
 * The Fahrschein - a real ticket rather than a progress bar.
 *
 * The guide asks for physical metaphors over generic UI: a punched ticket, a
 * stamp, a plaque. So this is drawn as a torn-off transit ticket with a
 * perforated stub, a serial number and a validation mark, not a card with a
 * percentage in it.
 */
export function Fahrschein({ reached, total, currentStation }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const serial = `B1-${String(currentStation).padStart(3, '0')}-${String(total).padStart(3, '0')}`;

  return (
    <View
      accessible
      accessibilityLabel={`Fahrschein: ${reached} von ${total} Stationen erreicht. Nächste Station ${currentStation}.`}
      style={[styles.ticket, { backgroundColor: colors.paper, borderColor: LinieB1.color }]}>
      <View style={styles.body}>
        <ThemedText type="smallBold" style={[styles.eyebrow, { color: LinieB1.color }]}>
          LINIE B1 · FAHRSCHEIN
        </ThemedText>
        <ThemedText style={[styles.count, { color: colors.paperText }]}>
          {reached}
          <ThemedText style={[styles.countTotal, { color: colors.paperText }]}> / {total}</ThemedText>
        </ThemedText>
        <ThemedText type="small" style={[styles.caption, { color: colors.paperText }]}>
          Stationen erreicht
        </ThemedText>
        <ThemedText style={[styles.serial, { color: colors.paperText }]}>{serial}</ThemedText>
      </View>

      {/* Perforation: the notches are punched out of the ticket, so they take
          the colour of whatever the ticket sits on. */}
      <View style={styles.perforation}>
        {Array.from({ length: NOTCH_COUNT }).map((_, i) => (
          <View key={i} style={[styles.notch, { backgroundColor: colors.background }]} />
        ))}
      </View>

      <View style={styles.stub}>
        <ThemedText type="smallBold" style={[styles.stubLabel, { color: colors.paperText }]}>
          NÄCHSTE
        </ThemedText>
        <ThemedText style={[styles.stubNumber, { color: LinieB1.color }]}>
          {currentStation}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: Radius.medium,
    overflow: 'hidden',
    minHeight: 132,
  },
  body: { flex: 1, padding: Spacing.three, gap: 2, justifyContent: 'center' },
  eyebrow: { fontSize: 11, letterSpacing: 1.4 },
  count: { fontFamily: AppFonts.display, fontSize: 40, lineHeight: 46 },
  countTotal: { fontFamily: AppFonts.displayMedium, fontSize: 22, lineHeight: 46, opacity: 0.6 },
  caption: { opacity: 0.75 },
  serial: { fontFamily: AppFonts.bodyMedium, fontSize: 11, letterSpacing: 1.6, opacity: 0.55, marginTop: 6 },
  perforation: { width: 1, justifyContent: 'space-evenly', alignItems: 'center' },
  notch: { width: 9, height: 9, borderRadius: 5 },
  stub: { width: 86, alignItems: 'center', justifyContent: 'center', gap: 2 },
  stubLabel: { fontSize: 10, letterSpacing: 1.2, opacity: 0.7 },
  stubNumber: { fontFamily: AppFonts.display, fontSize: 34, lineHeight: 40 },
});
