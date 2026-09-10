import { StyleSheet, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LinieB1 } from '@/constants/lines';
import { AppFonts, Colors, Spacing } from '@/constants/theme';

type Props = {
  station: number;
  title: string;
  total: number;
  isReview?: boolean;
  isExamDay?: boolean;
};

/**
 * A platform nameplate, in the shape transit signage actually uses: the line's
 * colour as a bar above the name, the name large in the display face, and the
 * position on the line set small underneath.
 */
export function StationSign({ station, title, total, isReview, isExamDay }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const marker = isExamDay ? 'PRÜFUNGSTAG' : isReview ? 'UMSTEIGEN · WIEDERHOLUNG' : null;

  return (
    <View style={styles.sign}>
      <View style={[styles.bar, { backgroundColor: LinieB1.color }]} />
      <View style={styles.plate}>
        <View style={styles.metaRow}>
          <ThemedText type="smallBold" style={[styles.meta, { color: LinieB1.color }]}>
            STATION {station}
          </ThemedText>
          <ThemedText type="smallBold" style={[styles.meta, { color: colors.textSecondary }]}>
            VON {total}
          </ThemedText>
          {marker ? (
            <ThemedText type="smallBold" style={[styles.marker, { color: colors.textSecondary }]}>
              {marker}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText style={[styles.name, { color: colors.text }]}>{title}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sign: { gap: 0 },
  bar: { height: 6, borderRadius: 3, width: 64 },
  plate: { paddingTop: Spacing.two, gap: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  meta: { fontSize: 11, letterSpacing: 1.4 },
  marker: { fontSize: 11, letterSpacing: 1.4 },
  name: { fontFamily: AppFonts.display, fontSize: 38, lineHeight: 44, letterSpacing: -0.4 },
});
