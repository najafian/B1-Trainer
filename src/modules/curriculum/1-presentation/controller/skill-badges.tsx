import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SKILL_IDS, SkillLines, type SkillId } from '@/constants/lines';

type Props = {
  completedSkills: SkillId[];
};

/**
 * The six line badges of a station. A station is "reached" once all six are lit.
 *
 * Each badge always shows its line glyph (U1, U3, BB) next to the colour, so
 * status is never carried by colour alone - the colours of U1/U4 and U3/U6 are
 * a common confusion pair for colour vision deficiency (WCAG 1.4.1).
 */
export function SkillBadges({ completedSkills }: Props) {
  return (
    <View style={styles.row}>
      {SKILL_IDS.map((id) => {
        const line = SkillLines[id];
        const done = completedSkills.includes(id);
        return (
          <View
            key={id}
            style={styles.item}
            accessible
            accessibilityLabel={`${line.labelDe}, Linie ${line.line}, ${done ? 'erledigt' : 'offen'}`}>
            <View
              style={[
                styles.badge,
                done
                  ? { backgroundColor: line.color, borderColor: line.color }
                  : { backgroundColor: 'transparent', borderColor: line.color },
              ]}>
              <ThemedText
                type="smallBold"
                style={[styles.glyph, { color: done ? line.onColor : line.color }]}>
                {line.line}
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.label} numberOfLines={1}>
              {line.labelDe}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { alignItems: 'center', gap: 4, minWidth: 56 },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontSize: 15 },
  label: { fontSize: 11 },
});
