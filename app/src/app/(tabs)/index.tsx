import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrangementView, Host, RNHostView, VStack } from '@expo/ui/swift-ui';
import { arrangementViewStyle, splitArrangementFixedLayoutSize, splitArrangementLayoutRatio } from '@expo/ui/swift-ui/modifiers';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { VLCPlayer } from 'react-native-vlc-media-player';
import { MODE } from '../../camera';
import { NotConnected, useCamera } from '../../shared';

// The camera leaves preview mode to record (see each driver's `live`): no preview while recording.
const YELLOW = '#ffd60a'; // Camera app's selected-mode color
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));
// ArrangementView needs iOS 27.1; below it, it renders its children without a container.
const ARRANGEMENT = Platform.OS === 'ios' && parseFloat(String(Platform.Version)) >= 27.1;
const TOGGLE_HEIGHT = 52; // previewToggle: minHeight + paddingTop
// Largest frame of ratio `r` that leaves `reserve` points below it in `box`; full width until the box is measured.
const fitted = (box: { width: number; height: number } | null, r: number, reserve: number) =>
  box ? { width: Math.min(box.width, (box.height - reserve) * r), aspectRatio: r } : { width: '100%' as const, aspectRatio: r };

export default function LiveScreen() {
  const { online, driver, recording, setRecording } = useCamera();
  const [mode, setMode] = useState<number>(MODE.video); // selected in the UI, not the camera's mode
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [aspect, setAspect] = useState(4 / 3); // of the MJPEG frames, known once VLC reports videoSize
  const [preview, setPreview] = useState(false); // off at launch: the camera stays free to record right away
  const [box, setBox] = useState<{ width: number; height: number } | null>(null); // space left for the viewfinder
  const window = useWindowDimensions();
  const sideBySide = window.width > window.height;
  // Regular width (iPhone Duo inner display) vs compact (iPhone, Duo outer display); 600 pt sits between them.
  const halves = window.width >= 600;
  const [preparing, setPreparing] = useState(false); // camera switching to preview mode: no recording meanwhile

  useFocusEffect(useCallback(() => setStatusBarStyle('light'), []));

  const startPreview = () => { setPlaying(false); setFailed(false); setReady(true); };

  // On focus and whenever a recording ends (from the app or the camera's button): back to photo mode + preview.
  // Also covers coming back from Gallerie, which leaves the camera in playback mode.
  useFocusEffect(
    useCallback(() => {
      if (!online || recording || !preview) return;
      let cancelled = false;
      setPreparing(true);
      driver.prepareLive(() => cancelled)
        .then((ok) => ok && startPreview(), (e) => Alert.alert('Impossible de préparer l’aperçu', errMsg(e)))
        .finally(() => setPreparing(false));
      return () => { cancelled = true; setReady(false); };
    }, [online, driver, recording, preview]),
  );

  const retry = () => { setPlaying(false); setFailed(false); setAttempt((a) => a + 1); };

  useEffect(() => {
    if (!recording) return setElapsed(0);
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    return () => clearInterval(id);
  }, [recording]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('La caméra a refusé la commande', errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const togglePreview = (on: boolean) => {
    Haptics.selectionAsync();
    setPreview(on);
    if (!on) driver.stopLive?.().catch(() => {});
  };

  const switchMode = (m: number) => {
    if (m === mode) return;
    Haptics.selectionAsync();
    setMode(m);
  };

  const startRecording = async () => {
    setReady(false); // release the stream before the camera leaves preview mode
    try {
      await driver.startRecording();
      setRecording(true);
    } catch (e) {
      if (preview) await driver.prepareLive(() => false).then((ok) => ok && startPreview(), () => {});
      throw e;
    }
  };

  const locked = busy || preparing;
  const shutter = () => {
    if (locked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isVideo) run(recording ? async () => { await driver.stopRecording(); setRecording(false); } : startRecording);
    else run(() => driver.snapshot());
  };

  if (!online) return <NotConnected dark />;

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  const isVideo = mode === MODE.video || !driver.live.photo;

  const recPill = recording && (
    <View style={s.recPill} accessibilityLabel={`Enregistrement en cours, ${mmss}`}>
      <Text style={s.recText}>{mmss}</Text>
    </View>
  );
  // PHOTO shows the whole frame; VIDÉO crops it to the 16:9 recording frame. VLC ignores resizeMode on iOS,
  // so the player is sized to the stream's own ratio and never stretched. Fitted to the space measured in `box`.
  const viewfinder = (
    <View style={[s.viewfinder, fitted(box, isVideo ? 16 / 9 : aspect, ARRANGEMENT || sideBySide ? 0 : TOGGLE_HEIGHT)]}>
      {ready && preview && !failed && (
        <VLCPlayer
          key={attempt}
          style={{ width: '100%', aspectRatio: aspect }}
          source={{ uri: driver.live.url, initType: 2, initOptions: driver.live.vlcOptions }}
          autoplay
          resizeMode="contain"
          onPlaying={() => setPlaying(true)}
          onLoad={(e: { videoSize?: { width: number; height: number } }) => e.videoSize?.height && setAspect(e.videoSize.width / e.videoSize.height)}
          onError={() => setFailed(true)}
          onEnd={() => setFailed(true)}
        />
      )}
      {recording ? (
        <View style={s.failed}>
          <Text style={s.failedTitle}>Pas d’aperçu pendant l’enregistrement</Text>
        </View>
      ) : busy && isVideo ? (
        <View style={s.failed}>
          <ActivityIndicator color="#fff" />
          <Text style={s.failedTitle}>Démarrage de l’enregistrement…</Text>
        </View>
      ) : !preview ? (
        <View style={s.failed}>
          <Text style={s.failedTitle}>Aperçu désactivé</Text>
        </View>
      ) : failed ? (
        <View style={s.failed}>
          <Text style={s.failedTitle}>Aperçu indisponible</Text>
          <Pressable onPress={retry} hitSlop={8} style={s.retryBtn} accessibilityRole="button">
            <Text style={s.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : !playing && (
        <View style={s.failed}>
          <ActivityIndicator color="#fff" />
          <Text style={s.failedTitle}>Connexion au flux…</Text>
        </View>
      )}
    </View>
  );
  const toggle = (
    <View style={s.previewToggle}>
      <Text style={s.previewLabel}>Aperçu</Text>
      <Switch value={preview} onValueChange={togglePreview} disabled={locked || recording} trackColor={{ true: YELLOW }} accessibilityLabel="Aperçu" />
    </View>
  );
  const controls = (
    <>
      <View style={s.modes} accessibilityRole="tablist">
        {(driver.live.photo ? [MODE.video, MODE.photo] : [MODE.video]).map((m) => {
          const selected = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => switchMode(m)}
              disabled={locked || recording}
              hitSlop={8}
              style={s.modeBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected, disabled: locked || recording }}
            >
              <Text style={[s.modeText, { color: selected ? YELLOW : '#fff', opacity: recording && !selected ? 0.4 : 1 }]}>
                {m === MODE.video ? 'VIDÉO' : 'PHOTO'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={s.shutterRow}>
        <Pressable
          onPress={shutter}
          disabled={locked}
          style={({ pressed }) => [s.shutterRing, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={isVideo ? (recording ? 'Arrêter l’enregistrement' : 'Enregistrer une vidéo') : 'Prendre une photo'}
        >
          <View style={[s.shutterCore, isVideo ? s.coreVideo : s.corePhoto, recording && s.coreRecording, locked && { opacity: 0.5 }]} />
        </Pressable>
      </View>
    </>
  );

  // All four safe edges: on iPhone Duo the camera sits in a corner and the bars move to the side.
  // Wider than tall (iPhone Duo open in landscape): preview on the left, controls centered in a column on the right.
  if (sideBySide)
    return (
      <SafeAreaView style={[s.root, s.row]} edges={['top', 'bottom', 'left', 'right']}>
        <View style={s.viewfinderArea} onLayout={(e) => setBox(e.nativeEvent.layout)}>
          {viewfinder}
          <View style={s.recOverlay}>{recPill}</View>
        </View>
        <View style={s.side}>
          {toggle}
          {controls}
        </View>
      </SafeAreaView>
    );

  // Taller than wide, iOS 27.1+: a vertical split arrangement, preview above, controls below. On iPhone Duo half open
  // in portrait, the system splits it at the fold: preview on the upper half, controls on the lower one. Fully open,
  // the same halves (`halves`); on a compact display, controls at their ideal height right under the preview.
  if (ARRANGEMENT)
    return (
      <SafeAreaView style={s.root} edges={['top', 'bottom', 'left', 'right']}>
        <Host style={{ flex: 1 }}>
          <ArrangementView modifiers={[arrangementViewStyle('split', { axes: 'vertical' })]}>
            <ArrangementView.Primary>
              <RNHostView onLayout={(e) => setBox(e.nativeEvent.layout)}>
                <View style={[s.upper, halves && { justifyContent: 'center' }]}>
                  {viewfinder}
                  <View style={s.recOverlay}>{recPill}</View>
                </View>
              </RNHostView>
            </ArrangementView.Primary>
            <ArrangementView.Secondary>
              <VStack modifiers={[halves ? splitArrangementLayoutRatio(0.5) : splitArrangementFixedLayoutSize()]}>
                <RNHostView key={String(halves)} matchContents={!halves && { vertical: true }}>
                  <View style={halves && s.half}>
                    {toggle}
                    {controls}
                  </View>
                </RNHostView>
              </VStack>
            </ArrangementView.Secondary>
          </ArrangementView>
        </Host>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom', 'left', 'right']}>
      <View style={s.topBar}>{recPill}</View>
      <View style={s.viewfinderArea} onLayout={(e) => setBox(e.nativeEvent.layout)}>
        {viewfinder}
        {/* Centered under the viewfinder it controls: clear of corners (camera, side bars) whatever the display. */}
        {toggle}
      </View>
      {controls}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  topBar: { height: 44, alignItems: 'center', justifyContent: 'center' },
  recOverlay: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center' },
  upper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  row: { flexDirection: 'row' },
  half: { flex: 1, justifyContent: 'center' },
  side: { width: 240, justifyContent: 'center' }, // fits « VIDÉO PHOTO » and the toggle
  previewToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 8, minHeight: TOGGLE_HEIGHT },
  previewLabel: { color: '#fff', fontSize: 15 },
  recPill: { backgroundColor: '#ff3b30', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  recText: { color: '#fff', fontSize: 17, fontVariant: ['tabular-nums'], fontWeight: '600' },
  viewfinderArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  failed: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 4 },
  failedTitle: { color: '#ebebf599', fontSize: 15 },
  retryBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  retryText: { color: YELLOW, fontSize: 17, fontWeight: '600' },
  viewfinder: { backgroundColor: '#111', justifyContent: 'center', overflow: 'hidden' },
  modes: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 12 },
  modeBtn: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 4 },
  modeText: { fontSize: 13, fontWeight: '600', letterSpacing: 1.5 },
  shutterRow: { alignItems: 'center', paddingBottom: 32, paddingTop: 4 }, // clear of the floating tab bar
  shutterRing: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterCore: { width: 64, height: 64, borderRadius: 32 },
  corePhoto: { backgroundColor: '#fff' },
  coreVideo: { backgroundColor: '#ff3b30' },
  coreRecording: { width: 30, height: 30, borderRadius: 6 },
});
