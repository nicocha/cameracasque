import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { HELP } from '../../../help';
import { useColors } from '../../../shared';

export default function HelpScreen() {
  const c = useColors();
  return (
    <>
      <Stack.Screen options={{ title: 'Aide' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: c.bg }} contentContainerStyle={s.content}>
        {HELP.map((t) => (
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
        <Text style={[s.source, { color: c.secondary }]}>D’après le manuel d’utilisation Cambox V3+ (réf. 232023).</Text>
      </ScrollView>
    </>
  );
}

// iOS text styles: Title 3 semibold for headings, Body, Footnote.
const s = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 28 },
  topic: { gap: 8 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  title: { fontSize: 20, fontWeight: '600', flexShrink: 1 },
  body: { fontSize: 17, lineHeight: 22 },
  bullet: { flexDirection: 'row', gap: 8, paddingLeft: 4 },
  note: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 12, marginTop: 4 },
  noteText: { fontSize: 15, lineHeight: 20, flex: 1 },
  source: { fontSize: 13, textAlign: 'center' },
});
