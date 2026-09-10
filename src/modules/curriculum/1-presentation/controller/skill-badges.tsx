import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SKILL_IDS, SkillLines, lineTextColor, type SkillId } from '@/constants/lines';

import { isSkillAvailable } from './skill-routes';

type Props = {
  completedSkills: SkillId[];
  /** When given, each badge with a screen becomes tappable. */
  onSelect?: (skill: SkillId) => void;
};

/**
 * The six line badges of a station. A station is "reached" once all six are lit.
 *
 * Each badge always shows its line glyph (U1, U3, BB) next to the colour, so
 * status is never carried by colour alone - the colours of U1/U4 and U3/U6 are
 * a common confusion pair for colour vision deficiency (WCAG 1.4.1).
 */
export function SkillBadges({ completedSkills, onSelect }: Props) {
  const dark = useColorScheme() === 'dark';

  return (
    <View style={styles.row}>
      {SKILL_IDS.map((id) => {
        const line = SkillLines[id];
        const done = completedSkills.includes(id);
        // Outlined, the line colour IS the text, so it needs the readable variant.
        const outlineColor = lineTextColor(line, dark);
        const available = isSkillAvailable(id);
        const tappable = Boolean(onSelect) && available;

        return (
          <Pressable
            key={id}
            disabled={!tappable}
            onPress={tappable ? () => onSelect?.(id) : undefined}
            hitSlop={6}
            style={({ pressed }) => [
              styles.item,
              !available && onSelect ? styles.unavailable : null,
              pressed ? styles.pressed : null,
            ]}
            accessible
            accessibilityRole={tappable ? 'button' : 'text'}
            accessibilityState={{ disabled: !tappable }}
            accessibilityLabel={`${line.labelDe}, Linie ${line.line}, ${
              done ? 'erledigt' : 'offen'
            }${onSelect && !available ? ', noch nicht verfügbar' : ''}`}>
            <View
              style={[
                styles.badge,
                done
                  ? { backgroundColor: line.color, borderColor: line.color }
                  : { backgroundColor: 'transparent', borderColor: outlineColor },
              ]}>
              <ThemedText
                type="smallBold"
                style={[styles.glyph, { color: done ? line.onColor : outlineColor }]}>
                {line.line}
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.label} numberOfLines={1}>
              {line.labelDe}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { alignItems: 'center', gap: 4, minWidth: 56 },
  unavailable: { opacity: 0.4 },
  pressed: { opacity: 0.6 },
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
