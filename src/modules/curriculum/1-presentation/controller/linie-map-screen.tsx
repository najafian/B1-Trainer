import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinieB1 } from '@/constants/lines';
import { AppFonts, BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';

import { ProgressEndpoint } from '@/modules/progress/1-presentation/endpoints/progress-endpoint';

import { CurriculumEndpoint, type StationOnLine } from '../endpoints/curriculum-endpoint';

const ROW_HEIGHT = 64;
const RAIL_WIDTH = 48;
const RAIL_X = RAIL_WIDTH / 2;

export function LinieMapScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
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
          <View style={[styles.lineBar, { backgroundColor: LinieB1.color }]} />
          <ThemedText type="title">{LinieB1.name}</ThemedText>
          <ThemedText type="small" style={[styles.meta, { color: colors.textSecondary }]}>
            {reached} VON {stations.length} STATIONEN ERREICHT
          </ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {stations.map((station, index) => (
            <StationRow
              key={station.number}
              station={station}
              onPress={() => router.push(`/station/${station.number}` as never)}
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
  onPress: () => void;
  isFirst: boolean;
  isLast: boolean;
  textColor: string;
  mutedColor: string;
};

function StationRow({ station, isFirst, isLast, textColor, mutedColor, onPress }: RowProps) {
  const { number, titleDe, status, isReview, isExamDay } = station;
  const segmentColor = status === 'ahead' ? LinieB1.aheadColor : LinieB1.reachedColor;
  const markColor = status === 'ahead' ? LinieB1.aheadColor : LinieB1.color;
  const isTerminus = isFirst || isLast;
  // Transit-map conventions: interchanges are big ringed circles, ordinary
  // stops are small ticks, and a terminus gets a bar across the line.
  const radius = isExamDay ? 11 : isReview ? 9.5 : 5.5;

  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      hitSlop={8}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Station ${number}, ${titleDe}. ${statusLabel(status)}${markerLabel(station)}`}>
      <Svg width={RAIL_WIDTH} height={ROW_HEIGHT}>
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
          <Circle cx={RAIL_X} cy={ROW_HEIGHT / 2} r={radius + 7} fill={LinieB1.color} opacity={0.2} />
        )}
        {isTerminus && (
          <Rect
            x={RAIL_X - 13}
            y={ROW_HEIGHT / 2 - 2.5}
            width={26}
            height={5}
            rx={2.5}
            fill={markColor}
          />
        )}
        <Circle
          cx={RAIL_X}
          cy={ROW_HEIGHT / 2}
          r={radius}
          fill={status === 'ahead' || isReview || isExamDay ? '#FFFFFF' : markColor}
          stroke={markColor}
          strokeWidth={isReview || isExamDay ? 4 : 3}
        />
        {isExamDay && <Circle cx={RAIL_X} cy={ROW_HEIGHT / 2} r={3.5} fill={markColor} />}
      </Svg>

      <View style={styles.rowText}>
        <ThemedText type="small" style={[styles.meta, { color: mutedColor }]}>
          {isFirst
            ? 'ENDSTATION · START'
            : isLast
              ? 'ENDSTATION · PRÜFUNG'
              : isExamDay
                ? `STATION ${number} · PRÜFUNGSTAG`
                : isReview
                  ? `STATION ${number} · UMSTEIGEN`
                  : `STATION ${number}`}
        </ThemedText>
        <ThemedText
          style={[
            styles.title,
            isTerminus || isExamDay ? styles.titleStrong : null,
            { color: status === 'ahead' ? mutedColor : textColor },
          ]}
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
  header: {
    paddingHorizontal: 20,
    // The web tab bar floats above the top of the page; native tabs sit at the bottom.
    paddingTop: Platform.OS === 'web' ? 72 : Spacing.two,
    paddingBottom: 16,
    gap: 4,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  lineBar: { height: 6, borderRadius: 3, width: 64, marginBottom: Spacing.two },
  list: { paddingBottom: BottomTabInset + 32, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: ROW_HEIGHT, paddingRight: 20 },
  rowText: { flex: 1, gap: 2 },
  meta: { fontSize: 10.5, letterSpacing: 1.2 },
  title: { fontFamily: AppFonts.bodySemiBold, fontSize: 17, lineHeight: 23 },
  titleStrong: { fontFamily: AppFonts.display, fontSize: 20, lineHeight: 26 },
});
