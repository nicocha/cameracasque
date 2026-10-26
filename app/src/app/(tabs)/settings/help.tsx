import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import Constants from 'expo-constants';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { HELP_V3, HELP_V4 } from '../../../../help';
import { v4 } from '../../../../camera4';
import { useCamera, useColors } from '../../../../shared';

const SITE = 'https://www.cameracasque.fr';

// One manual per family; the connected camera picks the first one shown.
const MODELS = [
  { key: 'v3', label: 'Cambox V3+', topics: HELP_V3, source: 'D’après le manuel d’utilisation Cambox V3+ (réf. 232023).' },
  { key: 'v4', label: 'Cambox V4', topics: HELP_V4, source: 'D’après les notices Cambox V4, V4+ et V4 Pro (2022 et 2024).' },
] as const;

export default function HelpScreen() {
  const c = useColors();
  const { driver } = useCamera();
  const [model, setModel] = useState(driver === v4 ? 1 : 0);
  const { topics, source } = MODELS[model];
  return (
    <>
      <Stack.Screen options={{ title: 'Aide' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: c.bg }} contentContainerStyle={s.content}>
        <View style={[s.segments, { backgroundColor: c.fill }]} accessibilityRole="tablist">
          {MODELS.map((m, i) => (
            <Pressable
              key={m.key}
              onPress={() => setModel(i)}
              style={[s.segment, i === model && { backgroundColor: c.bg }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: i === model }}
            >
              <Text style={[s.segmentText, { color: c.label }, i === model && { fontWeight: '600' }]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
        {topics.map((t) => (
          <View key={t.title} style={s.topic}>
            <View style={s.heading} accessibilityRole="header">
              <SymbolView name={t.symbol as SymbolViewProps['name']} size={22} tintColor={c.tint} />
              <Text style={[s.title, { color: c.label }]}>{t.title}</Text>
            </View>
            {t.body.map((p) =>
              p.startsWith('• ') ? (
                <View key={p} style={s.bullet}>
                  <Text style={[s.body, { color: c.label }]}>•</Text>
                  <Text style={[s.body, { color: c.label, flex: 1 }]}>{p.slice(2)}</Text>
                </View>
              ) : (
                <Text key={p} style={[s.body, { color: c.label }]}>{p}</Text>
              ),
            )}
            {t.note && (
              <View style={[s.note, { backgroundColor: c.fill }]}>
                <SymbolView name={{ ios: 'exclamationmark.triangle.fill', android: 'warning' }} size={17} tintColor="#ff9f0a" />
                <Text style={[s.noteText, { color: c.label }]}>{t.note}</Text>
              </View>
            )}
          </View>
        ))}
        <Text style={[s.source, { color: c.secondary }]}>{source}</Text>
        <View style={s.about}>
          <Text style={[s.source, { color: c.secondary }]}>Caméra Casque {Constants.expoConfig?.version}</Text>
          <Pressable onPress={() => Linking.openURL(SITE)} hitSlop={12} accessibilityRole="link">
            <Text style={[s.link, { color: c.tint }]}>cameracasque.fr</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

// iOS text styles: Title 3 semibold for headings, Body, Footnote.
const s = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 28 },
  // Segmented control look: a filled track with the selected segment raised.
  segments: { flexDirection: 'row', borderRadius: 9, padding: 2 },
  segment: { flex: 1, minHeight: 32, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 13 },
  topic: { gap: 8 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  title: { fontSize: 20, fontWeight: '600', flexShrink: 1 },
  body: { fontSize: 17, lineHeight: 22 },
  bullet: { flexDirection: 'row', gap: 8, paddingLeft: 4 },
  note: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 12, marginTop: 4 },
  noteText: { fontSize: 15, lineHeight: 20, flex: 1 },
  source: { fontSize: 13, textAlign: 'center' },
  about: { alignItems: 'center', gap: 6 },
  link: { fontSize: 15 },
});
