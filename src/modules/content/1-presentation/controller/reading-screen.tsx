import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Stamp } from '@/components/stamp';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SkillLines } from '@/constants/lines';
import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { ProgressEndpoint } from '@/modules/progress/1-presentation/endpoints/progress-endpoint';

import { ContentEndpoint, type ReadingTask } from '../endpoints/content-endpoint';

const LINE = SkillLines.lesen;

export function ReadingScreen({ station }: { station: number }) {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [task, setTask] = useState<ReadingTask | null | 'missing'>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    ContentEndpoint.dailyContent(station).then((daily) => {
      if (active) setTask(daily.reading ?? 'missing');
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
          Für Station {station} gibt es noch keinen Lesetext.
        </ThemedText>
      </ThemedView>
    );
  }

  const allAnswered = task.questions.every((_, i) => answers[i] !== undefined);
  const correctCount = task.questions.filter((q, i) => answers[i] === q.correctIndex).length;

  async function markDone() {
    await ProgressEndpoint.markSkillDone(station, 'lesen');
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
              Lesen · Station {station}
            </ThemedText>
          </View>

          <ThemedText type="subtitle">{task.title}</ThemedText>
          <View style={[styles.textCard, { borderColor: colors.border }]}>
            <ThemedText style={styles.readingText}>{task.text}</ThemedText>
          </View>

          {task.questions.map((question, qi) => (
            <View key={qi} style={styles.question}>
              <ThemedText style={styles.questionPrompt}>
                {qi + 1}. {question.prompt}
              </ThemedText>
              {question.options.map((option, oi) => {
                const chosen = answers[qi] === oi;
                const isCorrect = oi === question.correctIndex;
                // The key is never revealed before submission.
                const showKey = submitted && (chosen || isCorrect);
                return (
                  <Pressable
                    key={oi}
                    disabled={submitted}
                    onPress={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    style={[
                      styles.option,
                      { borderColor: chosen ? LINE.color : colors.backgroundSelected },
                      showKey && isCorrect && styles.optionCorrect,
                      showKey && chosen && !isCorrect && styles.optionWrong,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: chosen, disabled: submitted }}
                    accessibilityLabel={option}>
                    <ThemedText type="small">{option}</ThemedText>
                  </Pressable>
                );
              })}
              {submitted && question.explanation ? (
                <ThemedText type="small" style={[styles.explanation, { color: colors.textSecondary }]}>
                  {question.explanation}
                </ThemedText>
              ) : null}
            </View>
          ))}

          {!submitted ? (
            <Pressable
              disabled={!allAnswered}
              onPress={() => setSubmitted(true)}
              style={[styles.button, { backgroundColor: LINE.color }, !allAnswered && styles.buttonDisabled]}
              accessibilityRole="button"
              accessibilityState={{ disabled: !allAnswered }}
              accessibilityLabel="Antworten abgeben">
              <ThemedText type="smallBold" style={{ color: LINE.onColor }}>
                {allAnswered ? 'Antworten abgeben' : 'Bitte alle Fragen beantworten'}
              </ThemedText>
            </Pressable>
          ) : (
            <View style={styles.resultBlock}>
              {/* Multiple choice is objectively scorable offline, so the stamp
                  here is earned. 60% is the ÖIF pass threshold. */}
              <Stamp
                passed={correctCount / task.questions.length >= 0.6}
                note={`${correctCount} VON ${task.questions.length} RICHTIG`}
              />
              <Pressable
                onPress={markDone}
                style={[styles.button, { backgroundColor: LINE.color }]}
                accessibilityRole="button"
                accessibilityLabel="Lesen als erledigt markieren">
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
  textCard: { borderWidth: 1, borderRadius: Radius.medium, padding: 16 },
  readingText: { fontSize: 16, lineHeight: 26 },
  question: { gap: 8, marginTop: Spacing.two },
  questionPrompt: { fontSize: 16, fontWeight: '600' },
  option: { borderWidth: 1.5, borderRadius: Radius.small, padding: 12, minHeight: 44, justifyContent: 'center' },
  optionCorrect: { borderColor: '#009A49', backgroundColor: 'rgba(0,154,73,0.10)' },
  optionWrong: { borderColor: '#C62828', backgroundColor: 'rgba(198,40,40,0.10)' },
  explanation: { marginTop: 2, fontStyle: 'italic' },
  button: {
    marginTop: Spacing.three,
    borderRadius: Radius.medium,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: { opacity: 0.4 },
  resultBlock: { gap: 4, marginTop: Spacing.three },
});
