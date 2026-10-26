import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { CamFile, formatCamTime } from '../camera';
import { browsing, cachedThumb, DENIED_MSG, photosAllowed, saveToPhotos, share } from '../media';
import { useCamera } from '../shared';

// Always dark, like Photos' full-screen viewer and the Camera app: video letterboxing is black, so a light
// background around it left white bands above and below.
const V = { bg: '#000', label: '#fff', secondary: 'rgba(235, 235, 245, 0.6)' };
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));
// iPhone Duo puts the toolbar on the right side. It floats over the content without changing the safe area,
// so the video's own controls and the info bar ran under it. Only Duo's displays are this wide for their
// height (a regular iPhone is about 0.46, and this app is portrait-only there).
const SIDE_BAR = 80;
const sideBarWidth = (w: number, h: number) => (Platform.OS === 'ios' && Math.min(w, h) / Math.max(w, h) > 0.6 ? SIDE_BAR : 0);
const mmss = (ms: number) => {
  const t = Math.round(ms / 1000);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};
const mo = (bytes: number) => `${(bytes / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`;

// Native player (AVPlayer / ExoPlayer), with its own controls. Not VLC: its OpenGL ES view stopped the whole app
// drawing when iPhone Duo moved the window to its other display. VLC stays for the live preview (RTSP, MJPEG).
function Video({ url, onDuration }: { url: string; onDuration: (ms: number) => void }) {
  const player = useVideoPlayer(url, (p) => p.play());
  useEventListener(player, 'sourceLoad', (e) => e.duration > 0 && onDuration(e.duration * 1000));
  return <VideoView player={player} style={{ flex: 1 }} contentFit="contain" nativeControls allowsPictureInPicture={false} />;
}

// Swipe left/right through the Gallerie's list, like Photos. Only the visible page plays a video
// (the camera serves one stream well); neighbours show their thumbnail.
export default function ViewerScreen() {
  const params = useLocalSearchParams<{ index: string }>();
  const router = useRouter();
  const { driver } = useCamera();
  const window = useWindowDimensions();
  const side = sideBarWidth(window.width, window.height);
  const width = window.width - side; // of a page
  const [files, setFiles] = useState<CamFile[]>(() => browsing.files);
  const [index, setIndex] = useState(() => Math.min(Number(params.index) || 0, Math.max(0, browsing.files.length - 1)));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  // The camera's file list has no duration: VLC reports it once a video loads; kept per file.
  const [durations, setDurations] = useState<Record<string, number>>({});
  const list = useRef<FlatList<CamFile>>(null);
  // The window resizes (iPhone Duo opened or closed, rotation): pages get the new width, but the scroll offset
  // keeps the old one and lands between two pages, so snap back to the current page.
  useEffect(() => {
    list.current?.scrollToOffset({ offset: width * index, animated: false });
  }, [width]); // eslint-disable-line react-hooks/exhaustive-deps -- only on resize; swiping already moves the offset
  const f = files[index];
  if (!f) return null;
  const what = f.isVideo ? 'la vidéo' : 'la photo';

  const keepDuration = (path: string) => (e: { duration?: number }) => {
    if (e.duration && e.duration > 0 && durations[path] !== e.duration) setDurations((d) => ({ ...d, [path]: e.duration! }));
  };

  const show = (i: number) => {
    if (i === index) return;
    setIndex(i);
    setStatus(null);
  };

  const save = async () => {
    if (!(await photosAllowed())) return setStatus(DENIED_MSG);
    setSaving(true);
    setStatus('Téléchargement…');
    try {
      await saveToPhotos(f.name, f.url);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStatus('Enregistré dans Photos');
    } catch (e) {
      setStatus(`Échec du téléchargement : ${errMsg(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const shareFile = async () => {
    setSaving(true);
    setStatus('Téléchargement…');
    try {
      await share(f.name, f.url);
      setStatus(null);
    } catch (e) {
      setStatus(`Échec du partage : ${errMsg(e)}`);
    } finally {
      setSaving(false);
    }
  };

  // Stay in the viewer on the next item (the previous one if it was the last), like Photos.
  const remove = () =>
    driver.deleteFile(f).then(
      () => {
        const rest = files.filter((x) => x !== f);
        browsing.files = rest;
        if (!rest.length) return router.back();
        setFiles(rest);
        setIndex(Math.min(index, rest.length - 1));
        setStatus(null);
      },
      (e) => setStatus(`Échec de la suppression : ${errMsg(e)}`),
    );

  const confirmRemove = () =>
    Alert.alert(`Supprimer ${what} ?`, 'Elle sera effacée de la carte SD.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: remove },
    ]);

  return (
    <>
      <Stack.Screen
        options={{
          title: formatCamTime(f.time),
          headerTintColor: V.label,
          headerShadowVisible: false,
          headerTitleStyle: { color: V.label },
          headerStyle: { backgroundColor: V.bg }, // opaque black: the bar's glass edge showed as a light band
          contentStyle: { backgroundColor: V.bg },
          statusBarStyle: 'light',
          // Stack.Toolbar is iOS-only: Android gets its Close button here.
          headerLeft: Platform.OS === 'android'
            ? () => (
                <Pressable onPress={() => router.back()} hitSlop={8} style={s.androidBtn} accessibilityRole="button" accessibilityLabel="Fermer">
                  <SymbolView name={{ ios: 'xmark', android: 'close' }} size={24} tintColor={V.label} />
                </Pressable>
              )
            : undefined,
        }}
      />
      {Platform.OS === 'ios' && (
      <>
      <Stack.Toolbar placement="left" tintColor={V.label}>
        {/* Standard Close button for a modal view (HIG › Toolbars: "Use the standard Back and Close buttons") */}
        <Stack.Toolbar.Button icon="xmark" onPress={() => router.back()} accessibilityLabel="Fermer" />
      </Stack.Toolbar>
      {/* iOS: native bottom toolbar. Delete confirms through a native menu, like Photos. */}
      <Stack.Toolbar placement="bottom" tintColor={V.label}>
        <Stack.Toolbar.Button icon="square.and.arrow.up" onPress={shareFile} disabled={saving} accessibilityLabel="Partager" />
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.Button icon="square.and.arrow.down" onPress={save} disabled={saving} accessibilityLabel="Enregistrer dans Photos" />
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.Menu icon="trash" accessibilityLabel="Supprimer">
          <Stack.Toolbar.MenuAction icon="trash" destructive onPress={remove}>{`Supprimer ${what}`}</Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      </>
      )}

      <SafeAreaView style={{ flex: 1, backgroundColor: V.bg, paddingRight: side }} edges={Platform.OS === 'ios' ? [] : ['bottom']}>
        <FlatList
          ref={list}
          style={{ flex: 1 }}
          data={files}
          keyExtractor={(x) => x.path}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={index}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          windowSize={3}
          extraData={index}
          onMomentumScrollEnd={(e) => show(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item, index: i }) => (
            <View style={{ width, flex: 1 }}>
              {item.isVideo && i === index ? (
                <Video url={item.url} onDuration={(ms) => keepDuration(item.path)({ duration: ms })} />
              ) : (
                <Image
                  source={{ uri: item.isVideo ? cachedThumb(item) : item.url }}
                  style={{ flex: 1 }}
                  resizeMode="contain"
                  accessibilityLabel={`${item.isVideo ? 'Vidéo' : 'Photo'}, ${formatCamTime(item.time)}`}
                />
              )}
            </View>
          )}
        />
        {/* Info bar, like Photos: file name, then grey metadata with symbols; progress replaces the metadata. */}
        <View style={[s.info, side ? { paddingBottom: 20 } : null]}>
          <Text style={[s.name, { color: V.label }]} numberOfLines={1}>{f.name}</Text>
          {status ? (
            <View style={s.meta} accessibilityLiveRegion="polite">
              {saving && <ActivityIndicator size="small" color={V.label} />}
              <Text style={[s.metaText, { color: V.secondary }]}>{status}</Text>
            </View>
          ) : (
            <View style={s.meta}>
              {f.isVideo && (
                <View style={s.metaItem} accessibilityLabel={`Durée ${durations[f.path] ? mmss(durations[f.path]) : 'inconnue'}`}>
                  <SymbolView name={{ ios: 'clock', android: 'schedule' }} size={13} tintColor={V.secondary} />
                  <Text style={[s.metaText, s.tabular, { color: V.secondary }]}>{durations[f.path] ? mmss(durations[f.path]) : '–:––'}</Text>
                </View>
              )}
              <View style={s.metaItem}>
                <SymbolView name={{ ios: 'internaldrive', android: 'sd_card' }} size={13} tintColor={V.secondary} />
                <Text style={[s.metaText, { color: V.secondary }]}>{mo(f.size)}</Text>
              </View>
              <Text style={[s.metaText, s.tabular, s.position, { color: V.secondary }]}>{`${index + 1} sur ${files.length}`}</Text>
            </View>
          )}
        </View>
        {Platform.OS === 'android' && (
          <View style={s.androidBar}>
            <Pressable onPress={shareFile} disabled={saving} style={s.androidBtn} accessibilityRole="button" accessibilityLabel="Partager">
              <SymbolView name={{ ios: 'square.and.arrow.up', android: 'share' }} size={24} tintColor={V.label} />
            </Pressable>
            <Pressable onPress={save} disabled={saving} style={s.androidBtn} accessibilityRole="button" accessibilityLabel="Télécharger">
              <SymbolView name={{ ios: 'square.and.arrow.down', android: 'download' }} size={24} tintColor={V.label} />
            </Pressable>
            <Pressable onPress={confirmRemove} style={s.androidBtn} accessibilityRole="button" accessibilityLabel="Supprimer">
              <SymbolView name={{ ios: 'trash', android: 'delete' }} size={24} tintColor={V.label} />
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const s = StyleSheet.create({
  // Leaves room above the iOS bottom toolbar, which floats over the content (on the side on iPhone Duo).
  info: { gap: 4, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 96 : 12, paddingHorizontal: 20 },
  name: { fontSize: 15, fontWeight: '600' }, // Subheadline, emphasized
  meta: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 18 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13 }, // Footnote
  tabular: { fontVariant: ['tabular-nums'] },
  position: { marginLeft: 'auto' },
  androidBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 4 },
  androidBtn: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
