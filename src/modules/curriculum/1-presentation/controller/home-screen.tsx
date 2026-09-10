import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFocusEffect, useRouter } from 'expo-router';

import { Fahrschein } from '@/components/fahrschein';
import { StationSign } from '@/components/station-sign';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  ProgressEndpoint,
  type SkillId,
} from '@/modules/progress/1-presentation/endpoints/progress-endpoint';

import { CurriculumEndpoint, type StationOnLine } from '../endpoints/curriculum-endpoint';

import { SkillBadges } from './skill-badges';
import { skillHref } from './skill-routes';

type Today = {
  station: StationOnLine;
  completedSkills: SkillId[];
  reachedCount: number;
  total: number;
};

export function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [today, setToday] = useState<Today | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
      const journey = await ProgressEndpoint.currentJourney();
      const [stations, progress] = await Promise.all([
        CurriculumEndpoint.stationsOnLine(journey.currentStation),
        ProgressEndpoint.forStation(journey.currentStation),
      ]);
      const station = stations.find((s) => s.number === journey.currentStation);
      if (!active || !station) return;
      setToday({
        station,
        completedSkills: progress.completedSkills,
        reachedCount: journey.reachedStations.length,
        total: stations.length,
      });
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  if (today === null) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator accessibilityLabel="Wird geladen" />
      </ThemedView>
    );
  }

  const { station, completedSkills, reachedCount, total } = today;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.content}>
          <Pressable
            onPress={() => router.push(`/station/${station.number}` as never)}
            style={({ pressed }) => [styles.stationHeader, pressed && styles.pressed]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Station ${station.number}, ${station.titleDe}. Station öffnen.`}>
            <StationSign
              station={station.number}
              title={station.titleDe}
              total={total}
              isReview={station.isReview}
              isExamDay={station.isExamDay}
            />
          </Pressable>

          <View style={[styles.card, { borderColor: colors.border }]}>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Tippen Sie auf eine Linie, um zu beginnen. Die Station ist erreicht,
              wenn alle sechs Linien erledigt sind.
            </ThemedText>
            <SkillBadges
              completedSkills={completedSkills}
              onSelect={(skill) => router.push(skillHref(station.number, skill) as never)}
            />
          </View>

          <Fahrschein reached={reachedCount} total={total} currentStation={station.number} />
        </View>
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
    paddingTop: Platform.OS === 'web' ? 72 : Spacing.two,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  stationHeader: { gap: 4 },
  pressed: { opacity: 0.6 },
  card: { borderWidth: 1, borderRadius: Radius.medium, padding: 16, gap: 14, marginTop: Spacing.two },
});
