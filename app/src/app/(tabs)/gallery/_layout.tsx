import { Stack } from "expo-router/stack";

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                title: "Gallerie",
                headerLargeTitleEnabled: true,
                headerShadowVisible: false,
            }}
        />
    );
}
