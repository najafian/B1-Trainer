import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SkillLines } from '@/constants/lines';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { ProgressEndpoint } from '@/modules/progress/1-presentation/endpoints/progress-endpoint';

import { ContentEndpoint, type WritingTask } from '../endpoints/content-endpoint';

const LINE = SkillLines.schreiben;

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export function WritingScreen({ station }: { station: number }) {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [task, setTask] = useState<WritingTask | null | 'missing'>(null);
  const [draft, setDraft] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    ContentEndpoint.dailyContent(station).then((daily) => {
      if (active) setTask(daily.writing ?? 'missing');
    });
    return () => {
      active = false;
    };
  }, [station]);

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
          Für Station {station} gibt es noch keine Schreibaufgabe.
        </ThemedText>
      </ThemedView>
    );
  }

  const words = countWords(draft);
  const longEnough = words >= task.minWords;

  async function markDone() {
    await ProgressEndpoint.markSkillDone(station, 'schreiben');
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <View style={[styles.badge, { backgroundColor: LINE.color }]}>
              <ThemedText type="smallBold" style={{ color: LINE.onColor }}>{LINE.line}</ThemedText>
            </View>
            <ThemedText type="small" style={{ color: colors.textSecondary }}>
              Schreiben · {task.emailType} · Station {station}
            </ThemedText>
          </View>

          <View style={[styles.card, { borderColor: colors.backgroundSelected }]}>
            <ThemedText style={styles.prompt}>{task.prompt}</ThemedText>
          </View>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            editable={!submitted}
            multiline
            textAlignVertical="top"
            placeholder="Schreiben Sie Ihre E-Mail hier ..."
            placeholderTextColor={colors.textSecondary}
            accessibilityLabel="Ihre E-Mail"
            style={[
              styles.editor,
              { borderColor: colors.backgroundSelected, color: colors.text, backgroundColor: colors.backgroundElement },
            ]}
          />

          <ThemedText
            type="small"
            style={{ color: longEnough ? colors.textSecondary : LINE.color }}
            accessibilityLiveRegion="polite">
            {words} Wörter · mindestens {task.minWords}
          </ThemedText>

          {!submitted ? (
            <Pressable
              disabled={!longEnough}
              onPress={() => setSubmitted(true)}
              style={[styles.button, { backgroundColor: LINE.color }, !longEnough && styles.buttonDisabled]}
              accessibilityRole="button"
              accessibilityState={{ disabled: !longEnough }}
              accessibilityLabel="Text abgeben und Musterlösung anzeigen">
              <ThemedText type="smallBold" style={{ color: LINE.onColor }}>
                {longEnough ? 'Abgeben' : `Noch ${task.minWords - words} Wörter`}
              </ThemedText>
            </Pressable>
          ) : (
            <View style={styles.resultBlock}>
              <ThemedText type="subtitle">Musterlösung</ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Vergleichen Sie Aufbau, Anrede und Schlussformel mit Ihrem Text.
              </ThemedText>
              <View style={[styles.card, styles.model, { borderColor: LINE.color }]}>
                <ThemedText style={styles.modelText}>{task.modelAnswer}</ThemedText>
              </View>
              <Pressable
                onPress={markDone}
                style={[styles.button, { backgroundColor: LINE.color }]}
                accessibilityRole="button"
                accessibilityLabel="Schreiben als erledigt markieren">
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
  badge: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: 12, padding: 16 },
  prompt: { fontSize: 16, lineHeight: 24 },
  editor: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 220,
    fontSize: 16,
    lineHeight: 24,
  },
  model: { marginTop: 4 },
  modelText: { fontSize: 15, lineHeight: 24 },
  button: {
    marginTop: Spacing.two,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: { opacity: 0.4 },
  resultBlock: { gap: 8, marginTop: Spacing.two },
});
