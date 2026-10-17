// In-app help, condensed and rewritten from the Cambox V3+ user manual (ref. 232023, not redistributed here).
// The manufacturer is gone, so its support contacts and app-store pages are left out.

export type HelpTopic = {
  title: string;
  symbol: { ios: string; android: string };
  body: string[]; // paragraphs; lines starting with "• " render as bullets
  note?: string; // the manual's ⚠ boxes
};

export const HELP: HelpTopic[] = [
  {
    title: 'Votre Cambox',
    symbol: { ios: 'info.circle', android: 'info' },
    body: [
      '• Bouton On/Off : allumer, éteindre, démarrer ou mettre en pause l’enregistrement.',
      '• Bouton WiFi : appui court pour activer le WiFi, appui long pour changer de résolution.',
      '• Reset : trou à presser avec la broche métallique fournie.',
      '• Emplacement de la carte microSD, sous la languette caoutchouc.',
      '• Prise USB-C : recharge et transfert de fichiers.',
      'Le voyant indique la résolution : vert 2K, bleu 1080p, blanc 720p. Orange : WiFi activé ou connecté.',
    ],
    note: 'La languette n’est pas amovible : ne l’enlevez pas.',
  },
  {
    title: 'Allumer et enregistrer',
    symbol: { ios: 'power', android: 'power_settings_new' },
    body: [
      'Allumer : maintenez le bouton On/Off 3 secondes. La caméra vibre, le voyant s’allume fixe : elle est en pause.',
      'Enregistrer : depuis la pause, appuyez une fois sur On/Off. La caméra vibre et le voyant clignote chaque seconde.',
      'Pause : appuyez une fois sur On/Off pendant l’enregistrement. La caméra vibre et le voyant redevient fixe.',
      'Vous pouvez aussi enregistrer depuis l’onglet Caméra de cette app.',
    ],
    note: 'Si la caméra s’éteint quelques secondes après l’allumage, la batterie est trop faible ou la carte mémoire est absente. Si le voyant reste fixe au démarrage d’un enregistrement, la carte est pleine.',
  },
  {
    title: 'Connecter votre téléphone',
    symbol: { ios: 'wifi', android: 'wifi' },
    body: [
      '1. Allumez la caméra et laissez-la en pause.',
      '2. Appuyez brièvement sur le bouton WiFi : le voyant orange clignote vite, le réseau est visible.',
      '3. Dans les Réglages WiFi du téléphone, rejoignez le réseau « CAMBOXV3PLUS » (mot de passe par défaut : 12345678).',
      '4. Le voyant orange devient fixe : ouvrez l’app.',
      'Le nom et le mot de passe du réseau se changent dans Réglages > WiFi.',
    ],
    note: 'Si le téléphone signale que ce réseau n’a pas accès à Internet, choisissez de rester connecté, sinon l’app ne trouvera pas la caméra. Sur Android, coupez les données mobiles en cas d’échec.',
  },
  {
    title: 'Fixer la Cambox',
    symbol: { ios: 'link', android: 'link' },
    body: [
      'Présentez d’abord la fixation sous la visière pour repérer son emplacement.',
      'Retirez la protection du velcro sans toucher la partie adhésive, posez-le sous la visière et appuyez fortement sur toute la surface.',
      'Présentez la Cambox horizontalement face au velcro et appuyez sur ses 3 parties.',
      'Pour l’enlever : tirez la dragonne d’une aile vers le haut avec un mouvement circulaire vers le centre, puis décrochez la partie centrale et l’autre aile.',
    ],
    note: 'Collez dans un endroit tempéré et sec (environ 15 °C) et attendez au moins 4 h avant usage. Les ailes ne s’articulent que de haut en bas : ne les pliez pas d’avant en arrière.',
  },
  {
    title: 'Régler l’angle de vue',
    symbol: { ios: 'camera.aperture', android: 'camera' },
    body: [
      'La partie centrale bascule sur 35° (de −5° à 30°) avec des crans.',
      'Ouvrez l’onglet Caméra pour vérifier le cadrage en direct pendant le réglage.',
    ],
    note: 'Ne posez pas les doigts sur la vitre de l’objectif. Nettoyez-la avec la lingette fournie avant usage.',
  },
  {
    title: 'Récupérer vos vidéos',
    symbol: { ios: 'photo.on.rectangle', android: 'photo_library' },
    body: [
      'Par WiFi : onglet Gallerie, touchez une vidéo puis Enregistrer pour la copier dans Photos.',
      'Par USB : caméra éteinte, branchez-la à l’ordinateur. Elle apparaît comme un disque.',
      'Par la carte : appuyez sur la carte microSD pour l’éjecter, puis lisez-la avec un lecteur microSD ou l’adaptateur SD fourni.',
    ],
    note: 'Si une vidéo n’a que le son sur ordinateur, lisez-la avec VLC (gratuit).',
  },
  {
    title: 'Recharger la batterie',
    symbol: { ios: 'battery.100.bolt', android: 'battery_charging_full' },
    body: [
      'Retirez la carte SD avant de brancher : sinon la caméra démarre un enregistrement.',
      'Branchez le câble USB : le voyant est rouge fixe pendant la charge et s’éteint une fois chargé. Laissez encore 30 min à 1 h.',
      'Comptez environ 1 h 30 sur un chargeur secteur (5 V, 1 A max), plus sur un ordinateur ou en voiture.',
      'Le voyant clignote vite quand la batterie est faible.',
    ],
    note: 'Ne chargez pas plus de 12 h. Faites une charge complète environ tous les 3 mois pour préserver la batterie.',
  },
  {
    title: 'Résoudre un problème',
    symbol: { ios: 'wrench.and.screwdriver', android: 'build' },
    body: [
      'La caméra s’éteint peu après l’allumage : carte pleine ou absente, ou batterie faible.',
      'La caméra ne répond plus : appuyez sur Reset avec la broche.',
      'Impossible d’activer le WiFi : batterie faible, ou appui trop long sur le bouton WiFi (l’appui long change la résolution).',
      'Impossible de se connecter : rejoignez le WiFi de la caméra avant d’ouvrir l’app, actualisez la liste des réseaux et vérifiez que le voyant orange reste fixe.',
      'La caméra s’éteint au hasard : température hors de −5 °C à 55 °C, bouton appuyé par erreur, ou un autre téléphone connecté. Vérifiez aussi Réglages > Extinction auto.',
      'Le voyant reste fixe à l’enregistrement : carte pleine. Supprimez des fichiers dans Gallerie ou formatez la carte.',
    ],
  },
  {
    title: 'Précautions',
    symbol: { ios: 'exclamationmark.shield', android: 'shield' },
    body: [
      'Respectez les lois locales, notamment sur la vie privée. Restez attentif à votre environnement pendant vos activités.',
      'Ne percez pas et ne modifiez pas votre casque : utilisez uniquement les fixations Cambox.',
      'N’essayez pas de retirer la batterie. Ne jetez pas le produit avec les ordures ménagères.',
      'La caméra n’est pas un outil de stockage professionnel : copiez vos fichiers importants.',
    ],
  },
  {
    title: 'Caractéristiques',
    symbol: { ios: 'list.bullet.rectangle', android: 'list' },
    body: [
      '• Vidéo : 2K 30 i/s, 1080p 30 i/s, 720p 60 i/s, MP4 16:9',
      '• Audio : AAC stéréo',
      '• Stockage : microSD classe 10, 16 à 128 Go',
      '• Batterie : lithium-polymère 3,7 V, environ 70 min',
      '• Température : −5 °C à 55 °C en marche',
      '• Dimensions : 163 × 16,5 × 25,5 mm, 47 g',
      '• Connecteur : USB-C',
    ],
  },
];
