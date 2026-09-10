import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinieB1 } from '@/constants/lines';
import { Colors } from '@/constants/theme';

import { ProgressEndpoint } from '@/modules/progress/1-presentation/endpoints/progress-endpoint';

import { CurriculumEndpoint, type StationOnLine } from '../endpoints/curriculum-endpoint';

const ROW_HEIGHT = 64;
const RAIL_WIDTH = 48;
const RAIL_X = RAIL_WIDTH / 2;

export function LinieMapScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [stations, setStations] = useState<StationOnLine[] | null>(null);

  useEffect(() => {
    let active = true;
    // Progress is read through the module's endpoint, never its internals.
    ProgressEndpoint.currentJourney()
      .then((journey) => CurriculumEndpoint.stationsOnLine(journey.currentStation))
      .then((result) => {
        if (active) setStations(result);
      });
    return () => {
      active = false;
    };
  }, []);

  if (stations === null) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator accessibilityLabel="Linie wird geladen" />
      </ThemedView>
    );
  }

  const reached = stations.filter((station) => station.status === 'reached').length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">{LinieB1.name}</ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            {reached} von {stations.length} Stationen erreicht
          </ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {stations.map((station, index) => (
            <StationRow
              key={station.number}
              station={station}
              isFirst={index === 0}
              isLast={index === stations.length - 1}
              textColor={colors.text}
              mutedColor={colors.textSecondary}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type RowProps = {
  station: StationOnLine;
  isFirst: boolean;
  isLast: boolean;
  textColor: string;
  mutedColor: string;
};

function StationRow({ station, isFirst, isLast, textColor, mutedColor }: RowProps) {
  const { number, titleDe, status, isReview, isExamDay } = station;
  const segmentColor = status === 'ahead' ? LinieB1.aheadColor : LinieB1.reachedColor;
  const radius = isExamDay ? 11 : isReview ? 9 : 6.5;

  return (
    <Pressable
      style={styles.row}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Station ${number}, ${titleDe}. ${statusLabel(status)}${markerLabel(station)}`}>
      <Svg width={RAIL_WIDTH} height={ROW_HEIGHT} accessibilityElementsHidden importantForAccessibility="no">
        {!isFirst && (
          <Line
            x1={RAIL_X}
            y1={0}
            x2={RAIL_X}
            y2={ROW_HEIGHT / 2}
            stroke={status === 'ahead' ? LinieB1.aheadColor : LinieB1.reachedColor}
            strokeWidth={5}
          />
        )}
        {!isLast && (
          <Line
            x1={RAIL_X}
            y1={ROW_HEIGHT / 2}
            x2={RAIL_X}
            y2={ROW_HEIGHT}
            stroke={segmentColor}
            strokeWidth={5}
          />
        )}
        {status === 'current' && (
          <Circle cx={RAIL_X} cy={ROW_HEIGHT / 2} r={radius + 6} fill={LinieB1.color} opacity={0.22} />
        )}
        <Circle
          cx={RAIL_X}
          cy={ROW_HEIGHT / 2}
          r={radius}
          fill={status === 'ahead' ? '#FFFFFF' : LinieB1.color}
          stroke={status === 'ahead' ? LinieB1.aheadColor : LinieB1.color}
          strokeWidth={3}
        />
        {isExamDay && <Circle cx={RAIL_X} cy={ROW_HEIGHT / 2} r={4} fill="#FFFFFF" />}
      </Svg>

      <View style={styles.rowText}>
        <ThemedText type="small" style={{ color: mutedColor }}>
          Station {number}
          {isExamDay ? ' · Prüfungstag' : isReview ? ' · Wiederholung' : ''}
        </ThemedText>
        <ThemedText
          style={[styles.title, { color: status === 'ahead' ? mutedColor : textColor }]}
          numberOfLines={2}>
          {titleDe}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function statusLabel(status: StationOnLine['status']): string {
  if (status === 'reached') return 'Erreicht.';
  if (status === 'current') return 'Aktuelle Station.';
  return 'Noch nicht erreicht.';
}

function markerLabel({ isExamDay, isReview }: StationOnLine): string {
  if (isExamDay) return ' Prüfungstag.';
  if (isReview) return ' Wiederholung.';
  return '';
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 4 },
  list: { paddingBottom: 96 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: ROW_HEIGHT, paddingRight: 20 },
  rowText: { flex: 1, gap: 2 },
  title: { fontSize: 17, fontWeight: '600' },
});
