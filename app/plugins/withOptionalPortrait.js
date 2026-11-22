// "orientation": "portrait" makes Google Play infer a required android.hardware.screen.portrait,
// which hides the app from tablets, desktops and XR devices. Declare it optional.
const { withAndroidManifest } = require('expo/config-plugins');

const NAME = 'android.hardware.screen.portrait';

module.exports = (config) =>
  withAndroidManifest(config, (c) => {
    const m = c.modResults.manifest;
    m['uses-feature'] = (m['uses-feature'] ?? []).filter((f) => f.$['android:name'] !== NAME);
    m['uses-feature'].push({ $: { 'android:name': NAME, 'android:required': 'false' } });
    return c;
  });
