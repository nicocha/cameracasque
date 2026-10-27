import { useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { Stack } from "expo-router/stack";
import { CameraProvider, palette } from "../shared";

// Without a theme, navigation uses its light one in Dark Mode too: black titles, white bars.
// `card: transparent` leaves the bars to the system (Liquid Glass + scroll edge effect) instead of an opaque fill.
// Plain values: navigation derives other colors from these strings, which iOS system colors aren't.
function useNavigationTheme() {
    const dark = useColorScheme() === "dark";
    const c = palette[dark ? "dark" : "light"];
    const base = dark ? DarkTheme : DefaultTheme;
    return { ...base, colors: { ...base.colors, card: "transparent", background: c.bg, text: c.label, primary: c.tint } };
}

// Root stack above the tabs, so the viewer covers the tab bar on Android too (a screen pushed inside a tab can't).
export default function Layout() {
    return (
        <ThemeProvider value={useNavigationTheme()}>
            <CameraProvider>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="view" options={{ presentation: "fullScreenModal", headerLargeTitleEnabled: false }} />
                </Stack>
            </CameraProvider>
        </ThemeProvider>
    );
}
