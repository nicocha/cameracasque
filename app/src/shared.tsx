import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform, PlatformColor, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import TcpSocket from 'react-native-tcp-socket';
import { batteryLabel, Driver, EVENT, Option, NOTIFY, parseStatus, STATUS, v3 } from './camera';
import { v4 } from './camera4';

const HEARTBEAT_MS = 10000;

type CameraState = {
  online: boolean | null;
  driver: Driver; // the model that answered; V3+ until one does
  model: string[];
  recording: boolean;
  battery: string;
  menu: Record<string, Option[]>;
  setRecording: (r: boolean) => void;
};

const Ctx = createContext<CameraState>({ online: null, driver: v3, model: [], recording: false, battery: '—', menu: {}, setRecording: () => {} });
export const useCamera = () => useContext(Ctx);

// The phone is on one camera's WiFi: ask both models, keep the one that answers.
const detect = async () => {
  const [a, b] = await Promise.all([v3.heartbeat(), v4.heartbeat()]);
  return a ? v3 : b ? v4 : null;
};

export function CameraProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState<boolean | null>(null);
  const [driver, setDriver] = useState<Driver>(v3);
  const [model, setModel] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [battery, setBattery] = useState('—');
  const [menu, setMenu] = useState<Record<string, Option[]>>({});

  // V3+, like the original app: HTTP heartbeat + a TCP notification socket the camera expects to stay open
  // (without it the camera drops the WiFi client after a while). V4: heartbeat + recording state polled.
  // On each (re)connection: model, clock, battery, menu.
  useEffect(() => {
    let current: Driver | null = null;
    let sock: ReturnType<typeof TcpSocket.createConnection> | null = null;

    const openSocket = () => {
      sock = TcpSocket.createConnection(NOTIFY, () => {});
      sock.on('data', (data) => {
        const ev = parseStatus(String(data));
        if (ev[EVENT.status] === STATUS.recStarted || ev[EVENT.recTime] !== undefined) setRecording(true);
        if (ev[EVENT.status] === STATUS.recStopped) setRecording(false);
        if (ev[EVENT.battery] !== undefined && ev[EVENT.battery] !== -1) setBattery(batteryLabel(ev[EVENT.battery]));
      });
      sock.on('error', () => {});
      sock.on('close', () => { sock = null; });
    };

    const tick = async () => {
      const d = current && (await current.heartbeat()) ? current : await detect();
      setOnline(!!d);
      if (d && d !== current) {
        setDriver(d);
        d.connect().then((info) => { setModel(info.model); setBattery(info.battery); setMenu(info.menu); }, () => {});
      }
      if (d === v3 && !sock) openSocket();
      if (d?.isRecording) d.isRecording().then(setRecording, () => {});
      if (d !== v3) {
        sock?.destroy();
        sock = null;
      }
      if (!d) setRecording(false);
      current = d;
    };
    tick();
    const id = setInterval(tick, HEARTBEAT_MS);
    return () => { clearInterval(id); sock?.destroy(); };
  }, []);

  return <Ctx.Provider value={{ online, driver, model, recording, battery, menu, setRecording }}>{children}</Ctx.Provider>;
}

// Values of the iOS semantic colors, light and dark: Android's palette, and screens that are always dark.
export const palette = {
  light: { bg: '#ffffff', label: '#000000', secondary: '#3c3c4399', fill: '#7676801f', tint: '#007aff', red: '#ff3b30' },
  dark: { bg: '#000000', label: '#ffffff', secondary: '#ebebf599', fill: '#7676803d', tint: '#0a84ff', red: '#ff453a' },
};
// iOS: the system colors themselves, which also follow Increase Contrast.
const system = Platform.OS === 'ios' && {
  bg: PlatformColor('systemBackground'), label: PlatformColor('label'), secondary: PlatformColor('secondaryLabel'),
  fill: PlatformColor('tertiarySystemFill'), tint: PlatformColor('link'), red: PlatformColor('systemRed'),
};
export const useColors = () => {
  const scheme = useColorScheme();
  return system || palette[scheme === 'dark' ? 'dark' : 'light'];
};

/** A camera error in plain words: a request that times out or can't reach the camera means it isn't answering. */
export const errMsg = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  return /abort|network request failed|timed? ?out/i.test(m)
    ? 'La caméra ne répond pas. Vérifiez qu’elle est allumée et que le téléphone est connecté à son WiFi.'
    : m;
};

/** Equivalent of UIContentUnavailableConfiguration: symbol, title, explanation. */
export function Unavailable({ symbol, title, message, dark, action }: {
  symbol: SymbolViewProps['name']; title: string; message: string; dark?: boolean; action?: { label: string; onPress: () => void };
}) {
  const system = useColors();
  const c = dark ? palette.dark : system;
  return (
    <View style={[s.center, { backgroundColor: c.bg }]}>
      {/* Read as one element; the action stays a separate button for VoiceOver. */}
      <View style={s.group} accessible accessibilityLabel={`${title}. ${message}`}>
        <SymbolView name={symbol} size={48} tintColor={c.secondary} />
        <Text style={[s.title, { color: c.label }]}>{title}</Text>
        <Text style={[s.message, { color: c.secondary }]}>{message}</Text>
      </View>
      {action && (
        <Pressable onPress={action.onPress} hitSlop={8} style={s.action} accessibilityRole="button">
          <Text style={[s.message, { color: c.tint }]}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function NotConnected({ dark }: { dark?: boolean }) {
  return (
    <Unavailable
      dark={dark}
      symbol={{ ios: 'wifi.slash', android: 'wifi_off' }}
      title="Caméra non connectée"
      message={`Rejoignez le réseau WiFi de la caméra dans les Réglages du téléphone.${Platform.OS === 'android' ? '\n\nSi la connexion échoue, désactivez les données mobiles.' : ''}`}
      action={{ label: 'Comment connecter la caméra', onPress: () => router.push('/settings/help') }}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  group: { alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  message: { fontSize: 17, textAlign: 'center' },
  action: { minHeight: 44, justifyContent: 'center', marginTop: 8 },
});
