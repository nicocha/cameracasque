import { Stack } from "expo-router/stack";
import { t } from "../../../i18n";
import { useLang } from "../../../shared";

export default function Layout() {
    useLang();
    return (
        <Stack
            screenOptions={{
                title: t("Galerie"),
                headerLargeTitleEnabled: true,
                headerShadowVisible: false,
            }}
        />
    );
}
