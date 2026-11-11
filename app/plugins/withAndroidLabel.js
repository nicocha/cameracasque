// expo.name stays ASCII: eas-cli derives the iOS target from it with an older
// sanitizer than prebuild ("Caméra" -> "Camra" vs "Camera"), which breaks the build.
// The accented name is restored here for Android and via CFBundleDisplayName for iOS.
const { withStringsXml, AndroidConfig } = require('expo/config-plugins');

module.exports = (config, label) =>
  withStringsXml(config, (c) => {
    c.modResults = AndroidConfig.Strings.setStringItem(
      [AndroidConfig.Resources.buildResourceItem({ name: 'app_name', value: label })],
      c.modResults,
    );
    return c;
  });
