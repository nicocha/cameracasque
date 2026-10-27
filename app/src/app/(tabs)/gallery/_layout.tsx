import { Stack } from "expo-router/stack";

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                title: "Galerie",
                headerLargeTitleEnabled: true,
                headerShadowVisible: false,
            }}
        />
    );
}
