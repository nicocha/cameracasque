import { useCallback, useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text as RNText, TextInput, View } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import SettingsForm from '../../../components/SettingsForm';
import { batteryLabel, cmd, cam, dedupe, Section, Setting, settingsFor, validPassword, validSsid } from '../../../camera';
import { NotConnected, Unavailable, useCamera, useColors } from '../../../shared';

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

// Shown in every state, so help is reachable while the camera is off.
function HelpButton() {
  const router = useRouter();
  const open = () => router.push('/settings/help');
  if (Platform.OS === 'ios')
    return (
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="questionmark.circle" onPress={open} accessibilityLabel="Aide" />
      </Stack.Toolbar>
    );
  return <Stack.Screen options={{ headerRight: () => <Pressable onPress={open} hitSlop={12}><RNText style={{ fontSize: 16 }}>Aide</RNText></Pressable> }} />;
}

// Hide pickers the firmware doesn't report in cmd 3014 (once it has answered).
const visible = (sections: Section[], values: Record<string, number>) =>
  Object.keys(values).length === 0 ? sections
    : sections.map((sec) => ({
        ...sec,
        items: sec.items
          .filter((it) => !('options' in it) || values[it.cmd] !== undefined)
          .map((it) => ('options' in it ? { ...it, options: dedupe(it.options, values[it.cmd]) } : it)),
      }));

type TextSetting = Extract<Setting, { action: string }>;

export default function SettingsScreen() {
  const { online, recording, model, battery, menu } = useCamera();
  const c = useColors();
  const [values, setValues] = useState<Record<string, number>>({});
  const [wifi, setWifi] = useState<{ ssid?: string; password?: string }>({});
  const [editing, setEditing] = useState<TextSetting | null>(null); // Android text entry
  const [text, setText] = useState('');

  const refresh = useCallback(() => {
    cam.wifi().then(setWifi, () => {});
    return cam.settings().then(setValues, () => {});
  }, []);
  useFocusEffect(useCallback(() => {
    setStatusBarStyle('auto');
    if (online) refresh();
  }, [online, refresh]));

  if (!online) return <><HelpButton /><NotConnected /></>;
  if (recording)
    return <><HelpButton /><Unavailable symbol={{ ios: 'record.circle', android: 'fiber_manual_record' }} title="Enregistrement en cours" message="Arrêtez l’enregistrement dans l’onglet Caméra pour modifier les réglages." /></>;

  const apply = async (it: Setting, opts: { par?: number; str?: string }) => {
    if (opts.par !== undefined) setValues((v) => ({ ...v, [it.cmd]: opts.par! })); // optimistic
    try {
      await cmd(it.cmd, opts);
    } catch (e) {
      Alert.alert(`Impossible de modifier « ${it.label} »`, errMsg(e));
    }
    refresh();
  };

  const submitText = (it: TextSetting, value: string) => {
    const ok = it.action === 'ssid' ? validSsid(value) : validPassword(value);
    if (!ok) return Alert.alert('Valeur non valide', it.action === 'ssid' ? 'Utilisez 1 à 25 lettres, chiffres, « _ » ou « - ».' : 'Utilisez exactement 8 lettres ou chiffres.');
    setEditing(null);
    apply(it, { str: value });
  };

  const onAction = (it: TextSetting) => {
    if (it.action === 'confirm') {
      const format = it.cmd === 3010;
      return Alert.alert(
        format ? 'Formater la carte SD ?' : 'Réinitialiser les paramètres ?',
        format ? 'Toutes les vidéos et photos de la carte seront effacées.' : 'Tous les réglages de la caméra reviendront à leur valeur d’origine.',
        [{ text: 'Annuler', style: 'cancel' }, { text: format ? 'Formater' : 'Réinitialiser', style: 'destructive', onPress: () => apply(it, { par: 1 }) }],
      );
    }
    if (Platform.OS === 'ios')
      return Alert.prompt(it.label, it.action === 'ssid' ? '1 à 25 lettres, chiffres, « _ » ou « - ».' : 'Exactement 8 lettres ou chiffres.',
        [{ text: 'Annuler', style: 'cancel' }, { text: 'Enregistrer', onPress: (v?: string) => submitText(it, v ?? '') }],
        it.action === 'password' ? 'secure-text' : 'plain-text');
    setText('');
    setEditing(it);
  };

  return (
    <View style={{ flex: 1 }}>
      <HelpButton />
      <SettingsForm
        sections={visible(settingsFor(model[0]?.includes('675') ?? false, menu), values)}
        values={values}
        firmware={model[3] ?? model[0] ?? '—'}
        battery={batteryLabel(battery)}
        actionValues={{ 3003: wifi.ssid, 3004: wifi.password && '••••••••' }}
        onSelect={(it, par) => apply(it, { par })}
        onAction={onAction}
      />

      {/* Android has no Alert.prompt */}
      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={s.backdrop}>
          <View style={[s.dialog, { backgroundColor: c.bg }]}>
            <RNText style={[s.dialogTitle, { color: c.label }]}>{editing?.label}</RNText>
            <TextInput
              style={[s.input, { color: c.label, backgroundColor: c.fill }]}
              value={text}
              onChangeText={setText}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              secureTextEntry={editing?.action === 'password'}
              maxLength={editing?.action === 'password' ? 8 : 25}
            />
            <View style={s.dialogButtons}>
              <Pressable onPress={() => setEditing(null)} style={s.dialogBtn}><RNText style={{ color: c.tint, fontSize: 16 }}>Annuler</RNText></Pressable>
              <Pressable onPress={() => editing && submitText(editing, text)} style={s.dialogBtn}><RNText style={{ color: c.tint, fontSize: 16, fontWeight: '600' }}>Enregistrer</RNText></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 32 },
  dialog: { borderRadius: 28, padding: 24, gap: 16 },
  dialogTitle: { fontSize: 22 },
  input: { borderRadius: 8, padding: 12, fontSize: 16 },
  dialogButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  dialogBtn: { minHeight: 48, minWidth: 64, alignItems: 'center', justifyContent: 'center' },
});
