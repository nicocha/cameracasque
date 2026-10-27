import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ColorValue,
    FlatList,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { CamFile, dateRange, formatCamTime as formatDate, parseCamTime } from "../../../camera";
import { browsing, DENIED_MSG, photosAllowed, saveToPhotos, share, videoThumb } from "../../../media";
import { errMsg, NotConnected, sideBarWidth, Unavailable, useCamera, useColors } from "../../../shared";

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

// Like Photos: oldest first, opens scrolled to the newest, title = period of the visible items.
export default function GalleryScreen() {
    const { online, driver, recording } = useCamera();
    const c = useColors();
    const window = useWindowDimensions();
    const side = sideBarWidth(window.width, window.height);
    const { width, height } = { width: window.width - side, height: window.height }; // of the grid, clear of the side bar
    const columns = width > 600 ? 5 : 3;
    const [files, setFiles] = useState<CamFile[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [range, setRange] = useState<string | null>(null);
    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    // Progress or result of a batch action, shown as the title (in-UI feedback rather than alerts).
    const [status, setStatus] = useState<string | null>(null);
    const busy = status !== null && status.endsWith("…");
    const router = useRouter();

    const open = (f: CamFile) => {
        browsing.files = files ?? [];
        router.push({ pathname: "/view", params: { index: String(browsing.files.indexOf(f)) } });
    };

    // The spinner shows while it runs: on a V4 it first takes the camera out of preview mode (~7 s).
    const load = useCallback(async () => {
        setError(null);
        setRefreshing(true);
        try {
            const all = await driver.files();
            setFiles(all.sort((a, b) => a.time.localeCompare(b.time)));
        } catch (e) {
            setError(errMsg(e));
            setFiles(null); // a stale list would look up to date: show the error instead
        } finally {
            setRefreshing(false);
        }
    }, [driver]);

    useFocusEffect(
        useCallback(() => {
            setStatusBarStyle("auto");
            // Switching to playback mode would stop a recording in progress.
            if (online && !recording) load();
        }, [online, recording, load]),
    );

    const refresh = load;

    // Stable ref required by FlatList.
    const onViewable = useRef(({ viewableItems }: { viewableItems: { item: CamFile }[] }) => {
        const times = viewableItems.map((v) => parseCamTime(v.item.time)).filter((d) => !isNaN(+d));
        if (times.length) setRange(dateRange(times[0], times[times.length - 1]));
    }).current;

    const exitSelection = () => {
        setSelecting(false);
        setSelected(new Set());
    };
    const toggle = (f: CamFile) => {
        Haptics.selectionAsync();
        setSelected((prev) => {
            const next = new Set(prev);
            if (!next.delete(f.path)) next.add(f.path);
            return next;
        });
    };

    const chosen = () => (files ?? []).filter((f) => selected.has(f.path));
    const flash = (msg: string) => {
        setStatus(msg);
        setTimeout(() => setStatus(null), 2500);
    };

    // One file at a time: the camera's HTTP server copes with a single request, not bursts.
    const saveSelected = async () => {
        if (!(await photosAllowed())) return Alert.alert("Enregistrement impossible", DENIED_MSG);
        const items = chosen();
        let failed = 0;
        for (const [i, f] of items.entries()) {
            setStatus(`Enregistrement ${i + 1} sur ${items.length}…`);
            await saveToPhotos(f.name, f.url).catch(() => failed++);
        }
        exitSelection();
        if (failed) {
            setStatus(null);
            Alert.alert("Enregistrement incomplet", `${plural(failed, "élément")} n’a pas pu être enregistré.`);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            flash(`${plural(items.length, "élément")} enregistré${items.length > 1 ? "s" : ""} dans Photos`);
        }
    };

    const shareSelected = async () => {
        const [f] = chosen();
        setStatus("Préparation du partage…");
        try {
            await share(f.name, f.url);
            setStatus(null);
        } catch (e) {
            setStatus(null);
            Alert.alert("Partage impossible", errMsg(e));
        }
    };

    const removeSelected = async () => {
        const items = chosen();
        let failed = 0;
        for (const [i, f] of items.entries()) {
            setStatus(`Suppression ${i + 1} sur ${items.length}…`);
            await driver.deleteFile(f).catch(() => failed++);
        }
        setStatus(null);
        exitSelection();
        await load();
        if (failed) Alert.alert("Suppression incomplète", `${plural(failed, "élément")} n’a pas pu être supprimé.`);
        else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    // No title without a camera (no bar at all on Android, level with the Camera tab); the early states restore it (the main view sets its own).
    const header = <Stack.Screen options={{ title: online ? "Galerie" : "", headerLargeTitleEnabled: !!online, headerShown: !!online || Platform.OS === "ios" }} />;
    if (!online) return <>{header}<NotConnected /></>;
    if (recording)
        return (
            <>{header}<Unavailable
                symbol={{
                    ios: "record.circle",
                    android: "fiber_manual_record",
                }}
                title="Enregistrement en cours"
                message="Arrêtez l’enregistrement dans l’onglet Caméra pour parcourir les fichiers."
            /></>
        );
    if (error && !files)
        return (
            <>{header}<Unavailable
                symbol={{ ios: "exclamationmark.triangle", android: "warning" }}
                title="Fichiers indisponibles"
                message={error}
                action={{ label: "Réessayer", onPress: load }}
            /></>
        );
    if (!files)
        return (
            <>{header}<View style={[s.center, { backgroundColor: c.bg }]}>
                <ActivityIndicator />
            </View></>
        );

    const n = selected.size;
    const title =
        status ??
        (selecting
            ? n
                ? `${n} sélectionné${n > 1 ? "s" : ""}` // short: the toolbar leaves little room
                : "Sélectionner"
            : (range ?? "Galerie"));

    return (
        <>
            <Stack.Screen
                options={{
                    title,
                    headerLargeTitleEnabled: false,
                    // Stack.Toolbar is iOS-only: same actions as header buttons on Android.
                    ...(Platform.OS === "android" && {
                        headerLeft: selecting ? () => <HeaderIcon name="close" label="Quitter la sélection" onPress={exitSelection} color={c.label} /> : undefined,
                        headerRight: () =>
                            selecting ? (
                                <View style={s.headerIcons}>
                                    <HeaderIcon name="share" label="Partager" onPress={shareSelected} disabled={n !== 1 || busy} color={c.label} />
                                    <HeaderIcon name="download" label="Enregistrer dans la galerie" onPress={saveSelected} disabled={!n || busy} color={c.label} />
                                    <HeaderIcon
                                        name="delete"
                                        label="Supprimer"
                                        disabled={!n || busy}
                                        color={c.label}
                                        onPress={() =>
                                            Alert.alert(`Supprimer ${plural(n, "élément")} ?`, "Ils seront effacés de la carte SD.", [
                                                { text: "Annuler", style: "cancel" },
                                                { text: "Supprimer", style: "destructive", onPress: removeSelected },
                                            ])
                                        }
                                    />
                                </View>
                            ) : (
                                <Pressable onPress={() => setSelecting(true)} disabled={!files.length} hitSlop={8} style={s.headerText} accessibilityRole="button">
                                    <Text style={{ color: c.tint, fontSize: 16, fontWeight: "500" }}>Sélectionner</Text>
                                </Pressable>
                            ),
                    }),
                }}
            />
            {/* iOS only (on Android it would replace the header buttons above). Every item stays mounted and toggles
                `hidden`: the native toolbar doesn't pick up fragments or swapped children. */}
            {Platform.OS === "ios" && (
            <>
            <Stack.Toolbar placement="left">
                <Stack.Toolbar.Button icon="xmark" hidden={!selecting} disabled={busy} onPress={exitSelection} accessibilityLabel="Quitter la sélection" />
            </Stack.Toolbar>
            <Stack.Toolbar placement="right">
                <Stack.Toolbar.Button hidden={selecting} disabled={!files.length} onPress={() => setSelecting(true)}>
                    Sélectionner
                </Stack.Toolbar.Button>
                <Stack.Toolbar.Button
                    icon="square.and.arrow.up"
                    hidden={!selecting}
                    disabled={n !== 1 || busy}
                    onPress={shareSelected}
                    accessibilityLabel="Partager"
                    accessibilityHint="Un seul élément à la fois"
                />
                <Stack.Toolbar.Button
                    icon="square.and.arrow.down"
                    hidden={!selecting}
                    disabled={!n || busy}
                    onPress={saveSelected}
                    accessibilityLabel="Enregistrer dans Photos"
                />
                <Stack.Toolbar.Menu icon="trash" hidden={!selecting} disabled={!n || busy} accessibilityLabel="Supprimer">
                    <Stack.Toolbar.MenuAction icon="trash" destructive onPress={removeSelected}>
                        {`Supprimer ${plural(n, "élément")}`}
                    </Stack.Toolbar.MenuAction>
                </Stack.Toolbar.Menu>
            </Stack.Toolbar>
            </>
            )}
            <FlatList
                style={{ backgroundColor: c.bg }}
                contentInsetAdjustmentBehavior="automatic"
                data={files}
                key={columns}
                numColumns={columns}
                keyExtractor={(f) => f.path}
                extraData={selected}
                onRefresh={selecting ? undefined : refresh}
                refreshing={refreshing}
                onViewableItemsChanged={onViewable}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                // Fixed square rows, so FlatList can open directly on the last (newest) row.
                getItemLayout={(_, index) => ({ length: width / columns, offset: (width / columns) * index, index })}
                // Start near the end only when the grid overflows the screen: a FlatList started at a row
                // it can't scroll to leaves the rows above it blank (seen on Android with 2 rows).
                initialScrollIndex={startRow(files.length, columns, width, height)}
                contentContainerStyle={[{ paddingRight: side }, files.length === 0 && { flex: 1 }]}
                ListEmptyComponent={
                    <Unavailable
                        symbol={{
                            ios: "photo.on.rectangle",
                            android: "photo_library",
                        }}
                        title="Aucun fichier"
                        message="Les vidéos et photos enregistrées sur la carte SD apparaîtront ici."
                    />
                }
                renderItem={({ item }) => {
                    const isSelected = selected.has(item.path);
                    return (
                        <Pressable
                            style={({ pressed }) => [
                                { width: width / columns, padding: 1 },
                                pressed && !selecting && { opacity: 0.6 },
                            ]}
                            onPress={() => (selecting ? toggle(item) : open(item))}
                            onLongPress={() => {
                                if (selecting) return;
                                setSelecting(true);
                                toggle(item);
                            }}
                            accessibilityRole="imagebutton"
                            accessibilityState={selecting ? { selected: isSelected } : undefined}
                            accessibilityLabel={`${item.isVideo ? "Vidéo" : "Photo"}, ${formatDate(item.time)}`}
                        >
                            <Thumb file={item} background={c.fill} />
                            {item.isVideo && (
                                <View style={s.videoBadge}>
                                    <SymbolView
                                        name={{
                                            ios: "video.fill",
                                            android: "videocam",
                                        }}
                                        size={14}
                                        tintColor="#fff"
                                    />
                                </View>
                            )}
                            {isSelected && (
                                <>
                                    <View style={s.selectedTint} />
                                    <View style={s.check}>
                                        <SymbolView
                                            name={{ ios: "checkmark.circle.fill", android: "check_circle" }}
                                            size={22}
                                            tintColor={c.tint}
                                            type="palette"
                                            colors={["#fff", c.tint]}
                                        />
                                    </View>
                                </>
                            )}
                        </Pressable>
                    );
                }}
            />
        </>
    );
}

const startRow = (count: number, columns: number, width: number, height: number) => {
    const rows = Math.ceil(count / columns);
    const visible = Math.floor(height / (width / columns));
    return rows > visible ? rows - visible + 1 : undefined;
};

// The camera's HTTP server drops some of the parallel thumbnail requests: retry a failed one twice, spaced out.
// No thumbnail URL (V4 videos): a frame is extracted from the video instead.
function Thumb({ file, background }: { file: CamFile; background: ColorValue }) {
    const [attempt, setAttempt] = useState(0);
    const [uri, setUri] = useState(file.thumb);
    useEffect(() => {
        if (!file.thumb && file.isVideo) videoThumb(file.url).then(setUri, () => {});
    }, [file]);
    return (
        <Image
            key={attempt}
            source={uri ? { uri } : undefined}
            style={[s.thumb, { backgroundColor: background }]}
            onError={() => attempt < 2 && setTimeout(() => setAttempt((a) => a + 1), 700 * (attempt + 1))}
        />
    );
}

function HeaderIcon({ name, label, onPress, disabled, color }: { name: string; label: string; onPress: () => void; disabled?: boolean; color: ColorValue }) {
    return (
        <Pressable onPress={onPress} disabled={disabled} hitSlop={8} style={[s.headerIcon, disabled && { opacity: 0.38 }]} accessibilityRole="button" accessibilityLabel={label}>
            <SymbolView name={{ ios: "circle", android: name as never }} size={24} tintColor={color} />
        </Pressable>
    );
}

const s = StyleSheet.create({
    headerIcons: { flexDirection: "row" },
    headerIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
    headerText: { minHeight: 48, justifyContent: "center", paddingHorizontal: 8 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    thumb: { aspectRatio: 1, width: "100%" },
    videoBadge: { position: "absolute", left: 6, bottom: 6 },
    selectedTint: { position: "absolute", top: 1, left: 1, right: 1, bottom: 1, backgroundColor: "#ffffff33" },
    check: { position: "absolute", right: 6, bottom: 6 },
});
