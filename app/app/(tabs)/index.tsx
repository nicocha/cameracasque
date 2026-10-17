import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { VLCPlayer } from 'react-native-vlc-media-player';
import { cam, LIVE_PHOTO_URL, MODE } from '../../camera';
import { NotConnected, useCamera } from '../../shared';

// The preview is always the photo-mode MJPEG stream (HTTP), in VIDÉO too. The video-mode RTSP stream
// sends its frames over UDP, which iOS doesn't deliver without Apple's multicast entitlement (logs:
// "Buffering 1%", no frames), and port 8192 refuses connections in video mode. So the camera stays in
// photo mode while idle and only switches to video mode to record: no preview while recording.
const VLC_OPTIONS: string[] = [];
// The camera needs a moment after a mode change before its stream server answers (the original app waits 1 s).
const MODE_SETTLE_MS = 1200;
const RECORDING_GRACE_MS = 3000;
const settle = () => new Promise((r) => setTimeout(r, MODE_SETTLE_MS));

const YELLOW = '#ffd60a'; // Camera app's selected-mode color
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

export default function LiveScreen() {
  const { online, recording, setRecording } = useCamera();
  const [mode, setMode] = useState<number>(MODE.video); // selected in the UI, not the camera's mode
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [aspect, setAspect] = useState(4 / 3); // of the MJPEG frames, known once VLC reports videoSize

  useFocusEffect(useCallback(() => setStatusBarStyle('light'), []));

  const startPreview = () => { setPlaying(false); setFailed(false); setReady(true); };
  const toPreviewMode = async () => {
    if ((await cam.getMode()) !== MODE.photo) {
      await cam.setMode(MODE.photo);
      await settle();
    }
  };

  // On focus and whenever a recording ends (from the app or the camera's button): back to photo mode + preview.
  // Also covers coming back from Gallerie, which leaves the camera in playback mode.
  useFocusEffect(
    useCallback(() => {
      if (!online || recording) return;
      let cancelled = false;
      (async () => {
        if ((await cam.getMode()) === MODE.video) {
          // Maybe recording, started from the camera's button: give the notification socket time to say so
          // (this effect then re-runs and cancels) instead of switching mode under a running recording.
          await new Promise((r) => setTimeout(r, RECORDING_GRACE_MS));
          if (cancelled) return;
        }
        await toPreviewMode();
        if (!cancelled) startPreview();
      })()
        .catch((e) => Alert.alert('Impossible de préparer l’aperçu', errMsg(e)));
      return () => { cancelled = true; setReady(false); };
    }, [online, recording]),
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

  const switchMode = (m: number) => {
    if (m === mode) return;
    Haptics.selectionAsync();
    setMode(m);
  };

  const startRecording = async () => {
    setReady(false); // release the MJPEG stream before the camera leaves photo mode
    try {
      await cam.setMode(MODE.video);
      await settle();
      await cam.record(true);
      setRecording(true);
    } catch (e) {
      await toPreviewMode().then(startPreview, () => {});
      throw e;
    }
  };

  const shutter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (mode === MODE.video) run(recording ? async () => { await cam.record(false); setRecording(false); } : startRecording);
    else run(() => cam.snapshot());
  };

  if (!online) return <NotConnected dark />;

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  const isVideo = mode === MODE.video;

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <View style={s.topBar}>
        {recording && (
          <View style={s.recPill} accessibilityLabel={`Enregistrement en cours, ${mmss}`}>
            <Text style={s.recText}>{mmss}</Text>
          </View>
        )}
      </View>

      <View style={s.viewfinderArea}>
        {/* PHOTO shows the whole frame; VIDÉO crops it to the 16:9 recording frame. VLC ignores resizeMode on iOS,
            so the player is sized to the stream's own ratio and never stretched. */}
        <View style={[s.viewfinder, { aspectRatio: isVideo ? 16 / 9 : aspect }]}>
          {ready && !failed && (
            <VLCPlayer
              key={attempt}
              style={{ width: '100%', aspectRatio: aspect }}
              source={{ uri: LIVE_PHOTO_URL, initType: 2, initOptions: VLC_OPTIONS }}
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
      </View>

      <View style={s.modes} accessibilityRole="tablist">
        {[MODE.video, MODE.photo].map((m) => {
          const selected = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => switchMode(m)}
              disabled={busy || recording}
              hitSlop={8}
              style={s.modeBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected, disabled: busy || recording }}
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
          disabled={busy}
          style={({ pressed }) => [s.shutterRing, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={isVideo ? (recording ? 'Arrêter l’enregistrement' : 'Enregistrer une vidéo') : 'Prendre une photo'}
        >
          <View style={[s.shutterCore, isVideo ? s.coreVideo : s.corePhoto, recording && s.coreRecording, busy && { opacity: 0.5 }]} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  topBar: { height: 44, alignItems: 'center', justifyContent: 'center' },
  recPill: { backgroundColor: '#ff3b30', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  recText: { color: '#fff', fontSize: 17, fontVariant: ['tabular-nums'], fontWeight: '600' },
  viewfinderArea: { flex: 1, justifyContent: 'center' },
  failed: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 4 },
  failedTitle: { color: '#ebebf599', fontSize: 15 },
  retryBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  retryText: { color: YELLOW, fontSize: 17, fontWeight: '600' },
  viewfinder: { width: '100%', backgroundColor: '#111', justifyContent: 'center', overflow: 'hidden' },
  modes: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 12 },
  modeBtn: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 4 },
  modeText: { fontSize: 13, fontWeight: '600', letterSpacing: 1.5 },
  shutterRow: { alignItems: 'center', paddingBottom: 16, paddingTop: 4 },
  shutterRing: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterCore: { width: 64, height: 64, borderRadius: 32 },
  corePhoto: { backgroundColor: '#fff' },
  coreVideo: { backgroundColor: '#ff3b30' },
  coreRecording: { width: 30, height: 30, borderRadius: 6 },
});
