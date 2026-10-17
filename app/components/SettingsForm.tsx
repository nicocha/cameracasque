import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Section, Setting } from '../camera';
import { useColors } from '../shared';

export type SettingsFormProps = {
  sections: Section[];
  values: Record<string, number>;
  firmware: string;
  battery: string;
  /** current value shown on action rows (WiFi name, masked password), by cmd */
  actionValues: Record<string, string | undefined>;
  onSelect: (it: Setting, value: number) => void;
  onAction: (it: Extract<Setting, { action: string }>) => void;
};

type Choice = Extract<Setting, { options: unknown }>;

// Android: Material settings pattern (a list preference). Title with the current value as summary;
// a tap opens a radio-button dialog. @expo/ui's ListItem squeezed its label to one letter per line
// as soon as a dropdown sat in the trailing slot. iOS uses SettingsForm.ios.tsx.
export default function SettingsForm({ sections, values, firmware, battery, actionValues, onSelect, onAction }: SettingsFormProps) {
  const c = useColors();
  const [open, setOpen] = useState<Choice | null>(null);

  const Row = ({ title, summary, color, onPress }: { title: string; summary?: string; color?: string; onPress?: () => void }) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      android_ripple={{ color: c.fill }}
      style={s.row}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={summary ? `${title}, ${summary}` : title}
    >
      <Text style={[s.title, { color: color ?? c.label }]}>{title}</Text>
      {summary !== undefined && <Text style={[s.summary, { color: c.secondary }]}>{summary}</Text>}
    </Pressable>
  );

  return (
    <>
      <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={s.content}>
        {sections.map((sec) => (
          <View key={sec.title} style={s.section}>
            <Text style={[s.header, { color: c.tint }]} accessibilityRole="header">{sec.title}</Text>
            {sec.items.map((it) =>
              'options' in it ? (
                <Row
                  key={it.cmd}
                  title={it.label}
                  summary={it.options.find((o) => o.value === values[it.cmd])?.label ?? '—'}
                  onPress={() => setOpen(it)}
                />
              ) : (
                <Row
                  key={it.cmd}
                  title={it.label}
                  summary={actionValues[it.cmd]}
                  color={it.action === 'confirm' ? c.red : undefined}
                  onPress={() => onAction(it)}
                />
              ),
            )}
            {sec.title === 'WiFi' && (
              <Text style={[s.footer, { color: c.secondary }]}>Après modification, redémarrez la caméra puis rejoignez le nouveau réseau.</Text>
            )}
          </View>
        ))}
        <View style={s.section}>
          <Text style={[s.header, { color: c.tint }]} accessibilityRole="header">Informations</Text>
          <Row title="Caméra compatible" summary="Cambox V3+" />
          <Row title="Batterie" summary={battery} />
          <Row title="Version du firmware" summary={firmware} />
        </View>
      </ScrollView>

      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(null)} accessibilityLabel="Fermer">
          <Pressable style={[s.dialog, { backgroundColor: c.bg }]} onPress={() => {}}>
            <Text style={[s.dialogTitle, { color: c.label }]}>{open?.label}</Text>
            <ScrollView style={{ flexGrow: 0 }}>
              {open?.options.map((o) => {
                const selected = values[open.cmd] === o.value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => {
                      setOpen(null);
                      if (!selected) onSelect(open, o.value);
                    }}
                    android_ripple={{ color: c.fill }}
                    style={s.option}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                  >
                    <View style={[s.radio, { borderColor: selected ? c.tint : c.secondary }]}>
                      {selected && <View style={[s.radioDot, { backgroundColor: c.tint }]} />}
                    </View>
                    <Text style={[s.optionText, { color: c.label }]}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable onPress={() => setOpen(null)} style={s.cancel} accessibilityRole="button">
              <Text style={{ color: c.tint, fontSize: 14, fontWeight: '600' }}>Annuler</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// Material 3 metrics: 16 dp gutters, 56 dp+ two-line rows, 28 dp dialog corners.
const s = StyleSheet.create({
  content: { paddingBottom: 32 },
  section: { paddingTop: 16 },
  header: { fontSize: 14, fontWeight: '600', paddingHorizontal: 16, paddingBottom: 4 },
  row: { minHeight: 64, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  title: { fontSize: 16 },
  summary: { fontSize: 14, marginTop: 2 },
  footer: { fontSize: 13, paddingHorizontal: 16, paddingTop: 4 },
  backdrop: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 24 },
  dialog: { borderRadius: 28, paddingTop: 24, paddingBottom: 8, maxHeight: '80%' },
  dialogTitle: { fontSize: 22, paddingHorizontal: 24, paddingBottom: 16 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 48, paddingHorizontal: 24 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  optionText: { fontSize: 16 },
  cancel: { alignSelf: 'flex-end', minHeight: 48, justifyContent: 'center', paddingHorizontal: 24 },
});
