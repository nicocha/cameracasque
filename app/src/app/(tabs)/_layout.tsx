import { NativeTabs } from "expo-router/native-tabs";

export default function TabsLayout() {
    return (
        <NativeTabs>
            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Icon
                    sf={{ default: "camera", selected: "camera.fill" }}
                    md="photo_camera"
                />
                <NativeTabs.Trigger.Label>Caméra</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="gallery">
                <NativeTabs.Trigger.Icon
                    sf={{
                        default: "photo.on.rectangle",
                        selected: "photo.fill.on.rectangle.fill",
                    }}
                    md="photo_library"
                />
                <NativeTabs.Trigger.Label>
                    Galerie
                </NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="settings">
                <NativeTabs.Trigger.Icon
                    sf={{
                        default: "gearshape",
                        selected: "gearshape.fill",
                    }}
                    md="settings"
                />
                <NativeTabs.Trigger.Label>
                    Réglages
                </NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
