// English version of help.ts: same topics, same order, same symbols.
import type { HelpTopic } from './help';

export const HELP_V3_EN: HelpTopic[] = [
    {
        title: "Your Cambox",
        symbol: { ios: "info.circle", android: "info" },
        body: [
            "• On/Off button: turn on, turn off, start or pause recording.",
            "• WiFi button: short press to turn on Wi-Fi, long press to change the resolution.",
            "• Reset: a hole to press with the supplied metal pin.",
            "• microSD card slot, under the rubber flap.",
            "• USB-C port: charging and file transfer.",
            "The light shows the resolution: green 2K, blue 1080p, white 720p. Orange: Wi-Fi on or connected.",
        ],
        note: "The flap can’t be removed: don’t pull it off.",
    },
    {
        title: "Turning On and Recording",
        symbol: { ios: "power", android: "power_settings_new" },
        body: [
            "Turn on: hold the On/Off button for 3 seconds. The camera vibrates and the light stays on: it’s paused.",
            "Record: while paused, press On/Off once. The camera vibrates and the light blinks every second.",
            "Pause: press On/Off once while recording. The camera vibrates and the light stays on again.",
            "You can also record from this app’s Camera tab.",
        ],
        note: "If the camera turns off a few seconds after turning on, the battery is too low or there’s no memory card. If the light stays on when you start recording, the card is full.",
    },
    {
        title: "Connecting Your Phone",
        symbol: { ios: "wifi", android: "wifi" },
        body: [
            "1. Turn on the camera and leave it paused.",
            "2. Briefly press the WiFi button: the orange light blinks fast and the network is visible.",
            "3. In your phone’s Wi-Fi settings, join the “CAMBOXV3PLUS” network (default password: 12345678).",
            "4. The orange light stays on: open the app.",
            "You can change the network name and password in Settings > Wi-Fi.",
        ],
        note: "If your phone says this network has no internet access, choose to stay connected, or the app won’t find the camera. On Android, turn off mobile data if it fails.",
    },
    {
        title: "Mounting the Cambox",
        symbol: { ios: "link", android: "link" },
        body: [
            "First hold the mount under the visor to find where it goes.",
            "Peel the backing off the Velcro without touching the adhesive, place it under the visor and press firmly over the whole surface.",
            "Hold the Cambox level against the Velcro and press on its 3 parts.",
            "To remove it: pull one wing’s strap upward with a circular motion toward the center, then unhook the center part and the other wing.",
        ],
        note: "Stick it in a mild, dry place (around 15 °C / 59 °F) and wait at least 4 hours before use. The wings only bend up and down: don’t fold them forward or back.",
    },
    {
        title: "Adjusting the Angle",
        symbol: { ios: "camera.aperture", android: "camera" },
        body: [
            "The center part tilts through 35° (from −5° to 30°) in notches.",
            "Open the Camera tab to check the framing live while you adjust it.",
        ],
        note: "Don’t touch the lens glass. Clean it with the supplied wipe before use.",
    },
    {
        title: "Getting Your Videos",
        symbol: { ios: "photo.on.rectangle", android: "photo_library" },
        body: [
            "Over Wi-Fi: in the Gallery tab, tap a video, then Save to copy it to Photos.",
            "Over USB: with the camera off, plug it into the computer. It shows up as a drive.",
            "From the card: press the microSD card to eject it, then read it with a microSD reader or the supplied SD adapter.",
        ],
        note: "If a video only plays sound on a computer, play it with VLC (free).",
    },
    {
        title: "Charging the Battery",
        symbol: { ios: "battery.100.bolt", android: "battery_charging_full" },
        body: [
            "Remove the SD card before plugging in: otherwise the camera starts recording.",
            "Plug in the USB cable: the light stays red while charging and turns off once charged. Leave it another 30 min to 1 hour.",
            "It takes about 1 h 30 on a wall charger (5 V, 1 A max), longer on a computer or in a car.",
            "The light blinks fast when the battery is low.",
        ],
        note: "Don’t charge for more than 12 hours. Fully charge it about every 3 months to keep the battery healthy.",
    },
    {
        title: "Troubleshooting",
        symbol: { ios: "wrench.and.screwdriver", android: "build" },
        body: [
            "The camera turns off soon after turning on: card full or missing, or battery low.",
            "The camera stops responding: press Reset with the pin.",
            "Can’t turn on Wi-Fi: battery low, or the WiFi button was held too long (a long press changes the resolution).",
            "Can’t connect: join the camera’s Wi-Fi before opening the app, refresh the network list and check that the orange light stays on.",
            "The camera turns off at random: temperature outside −5 °C to 55 °C (23 °F to 131 °F), button pressed by mistake, or another phone connected. Also check Settings > Auto Power Off.",
            "The light stays on when recording: card full. Delete files in Gallery or format the card.",
        ],
    },
    {
        title: "Safety",
        symbol: { ios: "exclamationmark.shield", android: "shield" },
        body: [
            "Follow local laws, especially on privacy. Stay aware of your surroundings during your activities.",
            "Don’t drill or modify your helmet: only use Cambox mounts.",
            "Don’t try to remove the battery. Don’t throw the product away with household waste.",
            "The camera isn’t a professional storage device: copy your important files.",
        ],
    },
    {
        title: "Specifications",
        symbol: { ios: "list.bullet.rectangle", android: "list" },
        body: [
            "• Video: 2K 30 fps, 1080p 30 fps, 720p 60 fps, MP4 16:9",
            "• Audio: AAC stereo",
            "• Storage: microSD class 10, 16 to 128 GB",
            "• Battery: 3.7 V lithium polymer, about 70 min",
            "• Temperature: −5 °C to 55 °C (23 °F to 131 °F) in use",
            "• Size: 163 × 16.5 × 25.5 mm, 47 g",
            "• Connector: USB-C",
        ],
    },
];

export const HELP_V4_EN: HelpTopic[] = [
    {
        title: "Your Cambox",
        symbol: { ios: "info.circle", android: "info" },
        body: [
            "• Power button: turn on, turn off, pause or resume recording.",
            "• WiFi button: short press to turn on Wi-Fi.",
            "• Three lights: battery, camera and Wi-Fi.",
            "• Under the cap: USB-C port (charging and transfer) and microSD card.",
            "• On the Velcro side: reset hole, to press with the supplied pin.",
            "Camera light: solid white when starting, blinking green while recording, solid red when paused, blinking blue in preview, blinking purple if the card is full or missing, solid yellow if overheating.",
            "Battery light: blinking red when low, solid red while charging, solid green once charged.",
            "Wi-Fi light: blinking orange while waiting, solid orange once connected.",
        ],
    },
    {
        title: "Turning On and Recording",
        symbol: { ios: "power", android: "power_settings_new" },
        body: [
            "Turn on: hold the power button for 1 second. The camera light turns white.",
            "By default, recording starts on its own: two vibrations and a blinking green light. You can turn this off in Settings > Auto Record.",
            "Pause: short press (½ second). One short vibration and the light turns solid red.",
            "Resume: another short press. Two vibrations and the light blinks green again.",
            "Turn off: hold the button for 5 seconds. One long vibration and the light fades out.",
            "From the app, record with the red button in the Camera tab.",
        ],
    },
    {
        title: "Connecting Your Phone",
        symbol: { ios: "wifi", android: "wifi" },
        body: [
            "1. Turn on the camera and pause it (solid red light).",
            "2. Briefly press the WiFi button: the Wi-Fi light blinks orange.",
            "3. In your phone’s Wi-Fi settings, join the camera’s network (“Cambox-V4…” or “CAMBOX”) with the default password 12345678.",
            "4. The Wi-Fi light turns solid orange: open the app.",
            "You can change the name and password (8 to 12 characters) in Settings > Wi-Fi.",
        ],
        note: "If your phone says this network has no internet access, choose to stay connected, or the app won’t find the camera. When the battery is low, the camera’s Wi-Fi turns off.",
    },
    {
        title: "The Preview",
        symbol: { ios: "eye", android: "visibility" },
        body: [
            "The Camera tab shows the live picture so you can adjust the angle and check your settings. The camera light then blinks blue.",
            "The camera can’t record during the preview. The app turns it off by itself to record or open the Gallery: allow about 6 seconds. The preview comes back in about ten seconds.",
            "The preview is off at launch. Tap the eye at the top right of the picture to turn it on, and turn it off to record without waiting and save battery.",
            "A changed setting takes 3 to 5 seconds to show in the preview.",
        ],
    },
    {
        title: "The microSD Card",
        symbol: { ios: "sdcard", android: "sd_card" },
        body: [
            "Use a microSD, SDHC or SDXC card from 16 to 256 GB, formatted as exFAT (the default for cards of 64 GB and up).",
            "Push it in until it clicks. Press it to eject it.",
            "The camera’s settings are stored on the card: without a readable card, the app can’t show them.",
        ],
        note: "A card formatted as FAT32 can freeze the camera (solid red light, no response). Reformat it as exFAT on a computer, or from Settings > Format SD Card.",
    },
    {
        title: "Mounting the Cambox",
        symbol: { ios: "link", android: "link" },
        body: [
            "First hold the mount under the visor to find where it goes.",
            "Peel the backing off the Velcro without touching the adhesive, place it under the visor and press firmly over the whole surface.",
            "Hold the Cambox level against the Velcro and press on its three parts.",
            "To remove it: pull one wing’s strap upward with a circular motion toward the center, then unhook the center part and the other wing.",
        ],
        note: "Stick it in a mild, dry place (around 15 °C / 59 °F) and wait 24 hours before attaching the camera. The wings only bend up and down: don’t fold them forward or back.",
    },
    {
        title: "Adjusting the Angle",
        symbol: { ios: "camera.aperture", android: "camera" },
        body: [
            "The center part tilts through 20° with three notches: −5°, +5° and +10°.",
            "Open the Camera tab to check the framing live while you adjust it.",
        ],
        note: "Don’t force it past the notches and don’t touch the lens glass. Clean it with the supplied wipe.",
    },
    {
        title: "Getting Your Videos",
        symbol: { ios: "photo.on.rectangle", android: "photo_library" },
        body: [
            "Over Wi-Fi: in the Gallery tab, tap a video to play it, then Save to copy it to your phone.",
            "Over USB: pause the camera (solid red light), then plug it into the computer. It shows up as a drive.",
            "From the card: eject the microSD and read it with a card reader or the supplied SD adapter.",
        ],
        note: "Videos are in H.265. If a computer only plays the sound, play them with VLC (free).",
    },
    {
        title: "Charging the Battery",
        symbol: { ios: "battery.100.bolt", android: "battery_charging_full" },
        body: [
            "Turn off the camera, remove the cap and plug in the USB-C cable.",
            "The battery light stays red while charging (about 4 hours), then turns green.",
            "Use a 5 V, 1 A max charger. On a computer, a power bank or in a car, charging takes longer.",
            "Charge between 10 °C and 45 °C (50 °F and 113 °F). If the camera is hot, leave it off for 15 minutes first.",
            "Critical battery: recording and Wi-Fi stop. The level is shown in Settings.",
        ],
        note: "The battery can’t be removed. Fully charge it about every 3 months to keep it healthy.",
    },
    {
        title: "Settings",
        symbol: { ios: "slider.horizontal.3", android: "tune" },
        body: [
            "• Video: resolution and frame rate (4K on V4+ and V4 Pro), stabilization, sound, upside down, mirror.",
            "• Image: white balance (11 choices) and exposure (0 to 18, 10 by default).",
            "• Pro Mode, V4 Pro only: ISO, saturation (0 = black and white), contrast, sharpness and grain.",
            "• Behavior: auto record at power on, indicator lights in day or night mode (dimmed).",
            "• Maintenance: format the card, restore factory settings (except Wi-Fi), turn off the camera.",
        ],
        note: "4K and 1080p at 60 fps make the camera run hotter and drain the battery faster.",
    },
    {
        title: "Troubleshooting",
        symbol: { ios: "wrench.and.screwdriver", android: "build" },
        body: [
            "The camera is frozen with a solid red light: the card is probably FAT32. Reset it, then reformat the card as exFAT.",
            "Blinking purple light: card missing, full or unsupported (16 to 256 GB, exFAT).",
            "Solid yellow light: overheating (outside −5 °C to 55 °C, 23 °F to 131 °F). Let it cool down, then reset it.",
            "Can’t turn on Wi-Fi: battery low, or the WiFi button was held too long.",
            "The camera won’t start: charge it with a suitable charger (5 V, 1 A max).",
            "The camera gets hot: turn it off while charging, and prefer 1080p at 30 fps.",
            "The camera stops responding: reset it.",
        ],
    },
    {
        title: "Resetting the Camera",
        symbol: { ios: "arrow.counterclockwise", android: "restart_alt" },
        body: [
            "1. Turn the camera over to the Velcro side and find the reset hole.",
            "2. Insert the supplied metal pin.",
            "3. Press gently until it clicks.",
            "4. Turn the camera back on.",
        ],
        note: "Don’t use a needle, paper clip or toothpick: they can damage the camera.",
    },
    {
        title: "Safety",
        symbol: { ios: "exclamationmark.shield", android: "shield" },
        body: [
            "Follow local laws, especially on privacy. Stay aware of your surroundings during your activities.",
            "Don’t drill or modify your helmet: only use Cambox mounts.",
            "Don’t try to remove the battery. Don’t throw the product away with household waste.",
            "The camera isn’t a professional storage device: copy your important files.",
        ],
    },
    {
        title: "Specifications (V4 Pro)",
        symbol: { ios: "list.bullet.rectangle", android: "list" },
        body: [
            "• Video: 4K 30 fps, 1080p and 720p at 30 or 60 fps, H.265",
            "• Lens: 12 MP Sony sensor, 150° wide angle, stabilization",
            "• Audio: two stereo mics with noise reduction",
            "• Storage: microSD 16 to 256 GB, exFAT",
            "• Battery: 1,100 mAh, up to 80 min at 1080p 30 fps",
            "• Temperature: −5 °C to 55 °C (23 °F to 131 °F) in use",
            "• Weight: 70 g · Connector: USB-C",
            "The V4 has no 4K; only the V4 Pro has Pro Mode.",
        ],
    },
];
