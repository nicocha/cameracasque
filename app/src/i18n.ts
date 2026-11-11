// French is the source language: t('Réessayer') returns the English entry below when the app is in English.
// Text from the camera drivers (setting labels, options, errors) is translated where it's displayed, also with t():
// besides exact entries, an entry with {placeholders} matches a whole French string ("4K 30 i/s" → "4K 30 fps").
// No native import here, so `node camera.check.ts` can load it. Detection and the saved choice live in shared.tsx.

export type Lang = 'fr' | 'en';
let lang: Lang = 'fr';
const listeners = new Set<() => void>();
export const getLang = () => lang;
export const subscribe = (f: () => void) => {
  listeners.add(f);
  return () => { listeners.delete(f); };
};
export function setLang(l: Lang) {
  if (l === lang) return;
  lang = l;
  listeners.forEach((f) => f());
}
/** For dates and numbers. en-GB keeps the day before the month, which dateRange() relies on. */
export const locale = () => (lang === 'fr' ? 'fr-FR' : 'en-GB');

type Params = Record<string, string | number>;
const fill = (s: string, p: Params) => s.replace(/\{(\w+)\}/g, (m, k) => (k in p ? String(p[k]) : m));

export function t(fr: string, p: Params = {}) {
  if (lang === 'fr') return fill(fr, p);
  const en = EN[fr];
  if (en !== undefined) return fill(en, p);
  for (const { re, names, en } of templates) {
    const m = fr.match(re);
    // Numbers in the matched French text use a decimal comma: "3,60" → "3.60".
    if (m) return fill(en, Object.fromEntries(names.map((n, i) => [n, m[i + 1].replace(/(\d),(\d)/g, '$1.$2')])));
  }
  return fill(fr, p); // no translation: brand names, "Auto", "Fluorescent 1"…
}

export const EN: Record<string, string> = {
  // Tabs and titles
  'Caméra': 'Camera',
  'Galerie': 'Gallery',
  'Réglages': 'Settings',
  'Aide': 'Help',
  'Langue': 'Language',
  'Automatique': 'Automatic',

  // Common
  'Annuler': 'Cancel',
  'Enregistrer': 'Save',
  'Supprimer': 'Delete',
  'Réessayer': 'Try Again',
  'Fermer': 'Close',
  'Partager': 'Share',
  'Enregistrer dans Photos': 'Save to Photos',
  'Enregistrement en cours': 'Recording in Progress',

  // Connection and errors
  'Caméra non connectée': 'Camera Not Connected',
  'Rejoignez le réseau WiFi de la caméra dans les Réglages du téléphone.': 'Join the camera’s Wi-Fi network in your phone’s Settings.',
  'Si la connexion échoue, désactivez les données mobiles.': 'If the connection fails, turn off mobile data.',
  'Comment connecter la caméra': 'How to connect the camera',
  'La caméra ne répond pas. Vérifiez qu’elle est allumée et que le téléphone est connecté à son WiFi.': 'The camera isn’t responding. Check that it’s on and that your phone is connected to its Wi-Fi.',
  'Accès à Photos refusé. Autorisez-le dans Réglages > Caméra Casque.': 'Access to Photos denied. Allow it in Settings > Caméra Casque.',
  'Batterie faible': 'Low battery',
  'Carte SD pleine': 'SD card full',
  'Pas de carte SD': 'No SD card',
  'Erreur carte SD': 'SD card error',
  'La caméra a refusé cette commande (n° {cmd}, code {code}).': 'The camera refused this command (no. {cmd}, code {code}).',
  'La caméra a refusé cette commande ({cmd}).': 'The camera refused this command ({cmd}).',
  'La caméra enregistre : arrêtez l’enregistrement pour accéder aux fichiers.': 'The camera is recording: stop the recording to access the files.',
  'La caméra n’a pas démarré l’enregistrement.': 'The camera didn’t start recording.',
  'La caméra n’a pas arrêté l’enregistrement.': 'The camera didn’t stop recording.',
  'La Cambox V4 ne prend pas de photos.': 'The Cambox V4 doesn’t take photos.',

  // Camera tab
  'Impossible de préparer l’aperçu': 'Can’t Prepare the Preview',
  'Pas d’aperçu pendant l’enregistrement': 'No preview while recording',
  'Démarrage de l’enregistrement…': 'Starting recording…',
  'Aperçu désactivé': 'Preview off',
  'Aperçu indisponible': 'Preview unavailable',
  'Connexion au flux…': 'Connecting to the stream…',
  'Aperçu': 'Preview',
  'VIDÉO': 'VIDEO',
  'PHOTO': 'PHOTO',
  'Arrêter l’enregistrement': 'Stop recording',
  'Enregistrer une vidéo': 'Record a video',
  'Prendre une photo': 'Take a photo',
  'Enregistrement en cours, {time}': 'Recording, {time}',
  'Arrêt de l’enregistrement impossible': 'Can’t Stop Recording',
  'Enregistrement impossible': 'Can’t Record',
  'Photo impossible': 'Can’t Take Photo',

  // Gallery
  'Arrêtez l’enregistrement dans l’onglet Caméra pour parcourir les fichiers.': 'Stop the recording in the Camera tab to browse the files.',
  'Fichiers indisponibles': 'Files Unavailable',
  'Aucun fichier': 'No Files',
  'Les vidéos et photos enregistrées sur la carte SD apparaîtront ici.': 'Videos and photos recorded on the SD card will appear here.',
  'Sélectionner': 'Select',
  '{n} sélectionné': '{n} selected',
  '{n} sélectionnés': '{n} selected',
  'Quitter la sélection': 'Exit selection',
  'Un seul élément à la fois': 'One item at a time',
  'Enregistrer dans la galerie': 'Save to gallery',
  'Enregistrement {i} sur {n}…': 'Saving {i} of {n}…',
  'Suppression {i} sur {n}…': 'Deleting {i} of {n}…',
  'Préparation du partage…': 'Preparing to share…',
  'Enregistrement incomplet': 'Some Items Weren’t Saved',
  '{n} élément n’a pas pu être enregistré.': '{n} item couldn’t be saved.',
  '{n} éléments n’ont pas pu être enregistrés.': '{n} items couldn’t be saved.',
  '{n} élément enregistré dans Photos': '{n} item saved to Photos',
  '{n} éléments enregistrés dans Photos': '{n} items saved to Photos',
  'Partage impossible': 'Can’t Share',
  'Suppression incomplète': 'Some Items Weren’t Deleted',
  '{n} élément n’a pas pu être supprimé.': '{n} item couldn’t be deleted.',
  '{n} éléments n’ont pas pu être supprimés.': '{n} items couldn’t be deleted.',
  'Supprimer {n} élément ?': 'Delete {n} item?',
  'Supprimer {n} éléments ?': 'Delete {n} items?',
  'Supprimer {n} élément': 'Delete {n} item',
  'Supprimer {n} éléments': 'Delete {n} items',
  'Ils seront effacés de la carte SD.': 'They’ll be erased from the SD card.',
  'Vidéo, {date}': 'Video, {date}',
  'Photo, {date}': 'Photo, {date}',

  // Viewer
  'Téléchargement…': 'Downloading…',
  'Télécharger': 'Download',
  'Enregistré dans Photos': 'Saved to Photos',
  'Échec du téléchargement : {error}': 'Download failed: {error}',
  'Échec du partage : {error}': 'Sharing failed: {error}',
  'Échec de la suppression : {error}': 'Delete failed: {error}',
  'Supprimer la vidéo ?': 'Delete Video?',
  'Supprimer la photo ?': 'Delete Photo?',
  'Supprimer la vidéo': 'Delete Video',
  'Supprimer la photo': 'Delete Photo',
  'Elle sera effacée de la carte SD.': 'It’ll be erased from the SD card.',
  'Durée {d}': 'Duration {d}',
  'Durée inconnue': 'Duration unknown',
  '{i} sur {n}': '{i} of {n}',
  '{n} Mo': '{n} MB',

  // Settings screen
  '1 à 25 lettres, chiffres, « _ » ou « - ».': '1 to 25 letters, digits, “_” or “-”.',
  '8 à {max} lettres ou chiffres.': '8 to {max} letters or digits.',
  '8 lettres ou chiffres exactement.': 'Exactly 8 letters or digits.',
  'Valeur non valide': 'Invalid Value',
  'Utilisez {hint}': 'Use {hint}',
  'Impossible de modifier « {label} »': 'Can’t Change “{label}”',
  'Arrêtez l’enregistrement dans l’onglet Caméra pour modifier les réglages.': 'Stop the recording in the Camera tab to change the settings.',
  'Formater la carte SD ?': 'Format the SD Card?',
  'Toutes les vidéos et photos de la carte seront effacées. Sur une V4, comptez plus de 2 minutes.': 'All videos and photos on the card will be erased. On a V4, this takes over 2 minutes.',
  'Formater': 'Format',
  'Réinitialiser les paramètres ?': 'Reset Settings?',
  'Tous les réglages de la caméra reviendront à leur valeur d’origine.': 'All camera settings will return to their original values.',
  'Réinitialiser': 'Reset',
  'Éteindre la caméra ?': 'Turn Off the Camera?',
  'Pour la rallumer, maintenez son bouton marche/arrêt 1 seconde.': 'To turn it back on, hold its power button for 1 second.',
  'Éteindre': 'Turn Off',
  'Informations': 'About',
  'Batterie': 'Battery',
  'Version du firmware': 'Firmware Version',
  'Après modification, redémarrez la caméra puis rejoignez le nouveau réseau.': 'After a change, restart the camera, then join the new network.',

  // Camera settings (camera.ts, camera4.ts)
  'Vidéo': 'Video',
  'Photo': 'Photo',
  'Image': 'Image',
  'Système': 'System',
  'WiFi': 'Wi-Fi',
  'Mode Pro': 'Pro Mode',
  'Ergonomie': 'Behavior',
  'Maintenance': 'Maintenance',
  'Désactivé': 'Off',
  'Activé': 'On',
  'Moyen': 'Medium',
  'Pleine': 'Full',
  'Bonne': 'Good',
  'Moyenne': 'Medium',
  'Faible': 'Low',
  'Vide': 'Empty',
  'En charge': 'Charging',
  'Résolution vidéo': 'Video Resolution',
  'Durée des fichiers vidéo': 'Video File Length',
  'Volume audio': 'Audio Volume',
  'Incrustation de la date': 'Date Stamp',
  'Intervalle vidéo (timelapse)': 'Time-Lapse Interval',
  'Résolution photo': 'Photo Resolution',
  'Balance des blancs': 'White Balance',
  'Rafale': 'Burst',
  'Exposition': 'Exposure',
  'Fréquence lumineuse': 'Anti-Flicker',
  'Extinction automatique': 'Auto Power Off',
  'Formater la carte SD': 'Format SD Card',
  'Réinitialiser les paramètres': 'Reset Settings',
  'Nom du WiFi': 'Wi-Fi Name',
  'Mot de passe WiFi': 'Wi-Fi Password',
  'Jour': 'Day',
  'Nuageux': 'Cloudy',
  'Tungstène': 'Tungsten',
  'Stabilisation': 'Stabilization',
  'Son': 'Sound',
  'Image retournée': 'Upside Down',
  'Effet miroir': 'Mirror',
  'Ensoleillé': 'Sunny',
  'Ombragé': 'Shade',
  'Lumière du jour': 'Daylight',
  'Soleil couchant': 'Sunset',
  'Couleurs chaleureuses': 'Warm Colors',
  'Saturation': 'Saturation',
  'Contraste': 'Contrast',
  'Netteté': 'Sharpness',
  'Grain': 'Grain',
  'Enregistrement automatique': 'Auto Record',
  'Voyants': 'Indicator Lights',
  'Nuit (atténués)': 'Night (dimmed)',
  'Restaurer les réglages d’usine': 'Restore Factory Settings',
  'Éteindre la caméra': 'Turn Off Camera',
  'La caméra complète ce nom avec son modèle et un identifiant, par exemple CAMBOX-V4Pro-853c5d. Après modification, redémarrez la caméra puis rejoignez le nouveau réseau.':
    'The camera adds its model and an ID to this name, for example CAMBOX-V4Pro-853c5d. After a change, restart the camera, then join the new network.',
  // Templates for generated labels
  '{x} i/s': '{x} fps',
  '{x} Mpx (16:9)': '{x} MP (16:9)',
  '{x} Mpx': '{x} MP',
  '{x} (par défaut)': '{x} (default)',
  '{p} % ({v} V)': '{p}% ({v} V)', // batteryV4

  // Help screen
  'D’après le manuel d’utilisation Cambox V3+ (réf. 232023).': 'Based on the Cambox V3+ user manual (ref. 232023).',
  'D’après les notices Cambox V4, V4+ et V4 Pro (2022 et 2024).': 'Based on the Cambox V4, V4+ and V4 Pro manuals (2022 and 2024).',
};

// Entries with placeholders, as anchored patterns: "{x} i/s" → /^(.+?) i\/s$/.
const templates = Object.keys(EN)
  .filter((k) => k.includes('{'))
  .map((k) => ({
    en: EN[k],
    names: [...k.matchAll(/\{(\w+)\}/g)].map((m) => m[1]),
    re: new RegExp(`^${k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{\w+\}/g, '(.+?)')}$`),
  }));
