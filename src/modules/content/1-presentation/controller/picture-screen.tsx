import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SkillLines } from '@/constants/lines';
import { AppFonts, Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { ProgressEndpoint } from '@/modules/progress/1-presentation/endpoints/progress-endpoint';

import { ContentEndpoint, type PictureTask } from '../endpoints/content-endpoint';

const LINE = SkillLines.sprechen;
/** The exam gives roughly a minute for a picture description. */
const TARGET_SECONDS = 60;

export function PictureScreen({ station }: { station: number }) {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [task, setTask] = useState<PictureTask | null | 'missing'>(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const reduceMotion = useReducedMotion();
  const fill = useSharedValue(0);

  useEffect(() => {
    let active = true;
    ContentEndpoint.dailyContent(station).then((daily) => {
      if (active) setTask(daily.picture ?? 'missing');
    });
    return () => {
      active = false;
    };
  }, [station]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    // The bar fills only while you are actually speaking - motion with meaning.
    const ratio = Math.min(seconds / TARGET_SECONDS, 1);
    fill.value = reduceMotion ? ratio : withTiming(ratio, { duration: 900 });
  }, [seconds, fill, reduceMotion]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  if (task === null) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator accessibilityLabel="Wird geladen" />
      </ThemedView>
    );
  }

  if (task === 'missing') {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" style={{ color: colors.textSecondary }}>
          Für Station {station} gibt es noch keine Bildbeschreibung.
        </ThemedText>
      </ThemedView>
    );
  }

  const enough = seconds >= TARGET_SECONDS;

  async function markDone() {
    await ProgressEndpoint.markSkillDone(station, 'sprechen');
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <View style={[styles.badge, { backgroundColor: LINE.color }]}>
              <ThemedText type="smallBold" style={{ color: LINE.onColor }}>{LINE.line}</ThemedText>
            </View>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Sprechen · Bildbeschreibung · Station {station}
            </ThemedText>
          </View>

          {/* Image above description, always - the guide is explicit. */}
          <View style={[styles.imageFrame, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}>
            <ThemedText type="smallBold" style={[styles.imageRef, { color: colors.textSecondary }]}>
              {task.imageRef}
            </ThemedText>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Bild noch nicht hinterlegt
            </ThemedText>
          </View>

          <ThemedText type="small" style={{ color: colors.textSecondary }}>
            Beschreiben Sie das Bild etwa eine Minute lang laut. Erst danach die
            Musterbeschreibung aufdecken.
          </ThemedText>

          <View style={[styles.timerTrack, { backgroundColor: colors.backgroundElement }]}>
            <Animated.View style={[styles.timerFill, { backgroundColor: LINE.color }, fillStyle]} />
          </View>
          <ThemedText style={[styles.clock, { color: enough ? colors.textSecondary : LINE.textOnLight }]}>
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:
            {String(seconds % 60).padStart(2, '0')} / 01:00
          </ThemedText>

          <Pressable
            onPress={() => setRunning((r) => !r)}
            style={[styles.button, { backgroundColor: running ? colors.backgroundSelected : LINE.color }]}
            accessibilityRole="button"
            accessibilityLabel={running ? 'Zeit anhalten' : 'Zeit starten'}>
            <ThemedText type="smallBold" style={{ color: running ? colors.text : LINE.onColor }}>
              {running ? 'Pause' : seconds > 0 ? 'Weiter' : 'Sprechen beginnen'}
            </ThemedText>
          </Pressable>

          {!revealed ? (
            <Pressable
              disabled={!enough}
              onPress={() => {
                setRunning(false);
                setRevealed(true);
              }}
              style={[styles.buttonOutline, { borderColor: LINE.color }, !enough && styles.disabled]}
              accessibilityRole="button"
              accessibilityState={{ disabled: !enough }}
              accessibilityLabel="Musterbeschreibung aufdecken">
              <ThemedText type="smallBold" style={{ color: LINE.textOnLight }}>
                {enough
                  ? 'Musterbeschreibung aufdecken'
                  : `Noch ${TARGET_SECONDS - seconds} Sekunden`}
              </ThemedText>
            </Pressable>
          ) : (
            <View style={styles.resultBlock}>
              <ThemedText type="subtitle">Musterbeschreibung</ThemedText>
              <View style={[styles.card, { borderColor: LINE.color, backgroundColor: colors.paper }]}>
                <ThemedText style={[styles.modelText, { color: colors.paperText }]}>
                  {task.description}
                </ThemedText>
              </View>
              <Pressable
                onPress={markDone}
                style={[styles.button, { backgroundColor: LINE.color }]}
                accessibilityRole="button"
                accessibilityLabel="Sprechen als erledigt markieren">
                <ThemedText type="smallBold" style={{ color: LINE.onColor }}>
                  Als erledigt markieren
                </ThemedText>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { width: 36, height: 36, borderRadius: Radius.small, alignItems: 'center', justifyContent: 'center' },
  imageFrame: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.medium,
    aspectRatio: 4 / 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imageRef: { fontSize: 12, letterSpacing: 1.2 },
  timerTrack: { height: 10, borderRadius: Radius.pill, overflow: 'hidden', marginTop: Spacing.two },
  timerFill: { height: '100%', borderRadius: Radius.pill },
  clock: { fontFamily: AppFonts.bodyMedium, fontSize: 13, letterSpacing: 1.4 },
  card: { borderWidth: 1, borderRadius: Radius.medium, padding: 16 },
  modelText: { fontSize: 15, lineHeight: 25 },
  button: {
    marginTop: Spacing.two,
    borderRadius: Radius.medium,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonOutline: {
    marginTop: Spacing.one,
    borderWidth: 1.5,
    borderRadius: Radius.medium,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disabled: { opacity: 0.4 },
  resultBlock: { gap: 8, marginTop: Spacing.two },
});
