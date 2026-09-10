import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StationSign } from '@/components/station-sign';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SKILL_IDS, SkillLines, lineTextColor, type SkillId } from '@/constants/lines';
import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { ProgressEndpoint } from '@/modules/progress/1-presentation/endpoints/progress-endpoint';

import { CurriculumEndpoint, type Station } from '../endpoints/curriculum-endpoint';

import { isSkillAvailable, skillHref } from './skill-routes';

type Props = { station: number };

export function StationScreen({ station }: Props) {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [data, setData] = useState<{ station: Station; done: SkillId[] } | null>(null);

  // Re-reads on focus so a line completed on a skill screen shows up on return.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [stations, progress] = await Promise.all([
          CurriculumEndpoint.stationsOnLine(station),
          ProgressEndpoint.forStation(station),
        ]);
        const found = stations.find((s) => s.number === station);
        if (active && found) setData({ station: found, done: progress.completedSkills });
      })();
      return () => {
        active = false;
      };
    }, [station])
  );

  if (data === null) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator accessibilityLabel="Wird geladen" />
      </ThemedView>
    );
  }

  const reached = SKILL_IDS.every((id) => data.done.includes(id));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <StationSign
            station={data.station.number}
            title={data.station.titleDe}
            total={45}
            isReview={data.station.isReview}
            isExamDay={data.station.isExamDay}
          />
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {reached
              ? 'Alle sechs Linien erledigt. Station erreicht.'
              : `${data.done.length} von ${SKILL_IDS.length} Linien erledigt.`}
          </ThemedText>

          <View style={styles.list}>
            {SKILL_IDS.map((id) => {
              const line = SkillLines[id];
              const done = data.done.includes(id);
              const outlineColor = lineTextColor(line, scheme === 'dark');
              const available = isSkillAvailable(id);

              return (
                <Pressable
                  key={id}
                  disabled={!available}
                  onPress={() => router.push(skillHref(station, id) as never)}
                  style={[styles.row, { borderColor: colors.border }, !available && styles.rowDisabled]}
                  accessible
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !available }}
                  accessibilityLabel={`${line.labelDe}, Linie ${line.line}, ${done ? 'erledigt' : 'offen'}${available ? '' : ', noch nicht verfügbar'}`}>
                  <View
                    style={[
                      styles.badge,
                      done
                        ? { backgroundColor: line.color, borderColor: line.color }
                        : { borderColor: outlineColor },
                    ]}>
                    <ThemedText type="smallBold" style={{ color: done ? line.onColor : outlineColor }}>
                      {line.line}
                    </ThemedText>
                  </View>
                  <View style={styles.rowText}>
                    <ThemedText style={styles.rowTitle}>{line.labelDe}</ThemedText>
                    <ThemedText type="small" style={{ color: colors.textSecondary }}>
                      {done ? 'Erledigt' : available ? 'Offen' : 'Noch nicht verfügbar'}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    gap: 4,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  list: { gap: 10, marginTop: Spacing.three },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: 14,
    minHeight: 64,
  },
  rowDisabled: { opacity: 0.45 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 17, fontWeight: '600' },
  badge: {
    width: 44,
    height: 44,
    borderRadius: Radius.small,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
