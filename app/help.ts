// In-app help, condensed and rewritten from the Cambox user manuals (not redistributed here):
// V3+ (ref. 232023), V4 / V4+ / V4 Pro (April 2022) and V4 Pro (July 2024).
// The manufacturer is gone, so its support contacts and app-store pages are left out.

export type HelpTopic = {
  title: string;
  symbol: { ios: string; android: string };
  body: string[]; // paragraphs; lines starting with "• " render as bullets
  note?: string; // the manual's ⚠ boxes
};

export const HELP_V3: HelpTopic[] = [
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

export const HELP_V4: HelpTopic[] = [
  {
    title: 'Votre Cambox',
    symbol: { ios: 'info.circle', android: 'info' },
    body: [
      '• Bouton marche/arrêt : allumer, éteindre, mettre en pause ou reprendre l’enregistrement.',
      '• Bouton WiFi : appui bref pour activer le WiFi.',
      '• Trois voyants : batterie, caméra et WiFi.',
      '• Sous le capuchon : prise USB-C (recharge et transfert) et carte microSD.',
      '• Côté velcro : orifice de reset, à presser avec la broche fournie.',
      'Voyant caméra : blanc fixe au démarrage, vert clignotant pendant l’enregistrement, rouge fixe en pause, bleu clignotant en aperçu, violet clignotant si la carte est pleine ou absente, jaune fixe en cas de surchauffe.',
      'Voyant batterie : rouge clignotant si elle est faible, rouge fixe en charge, vert fixe une fois chargée.',
      'Voyant WiFi : orange clignotant en attente, orange fixe une fois connecté.',
    ],
  },
  {
    title: 'Allumer et enregistrer',
    symbol: { ios: 'power', android: 'power_settings_new' },
    body: [
      'Allumer : maintenez le bouton marche/arrêt 1 seconde. Le voyant caméra devient blanc.',
      'Par défaut, l’enregistrement démarre tout seul : deux vibrations et voyant vert clignotant. Vous pouvez le désactiver dans Réglages > Enregistrement automatique.',
      'Pause : appui bref (½ seconde). Une vibration courte et le voyant passe au rouge fixe.',
      'Reprendre : nouvel appui bref. Deux vibrations et le voyant redevient vert clignotant.',
      'Éteindre : maintenez le bouton 5 secondes. Une longue vibration et le voyant s’éteint progressivement.',
      'Depuis l’app, enregistrez avec le bouton rouge de l’onglet Caméra.',
    ],
  },
  {
    title: 'Connecter votre téléphone',
    symbol: { ios: 'wifi', android: 'wifi' },
    body: [
      '1. Allumez la caméra et mettez-la en pause (voyant rouge fixe).',
      '2. Appuyez brièvement sur le bouton WiFi : le voyant WiFi clignote en orange.',
      '3. Dans les Réglages WiFi du téléphone, rejoignez le réseau de la caméra (« Cambox-V4… » ou « CAMBOX ») avec le mot de passe par défaut 12345678.',
      '4. Le voyant WiFi devient orange fixe : ouvrez l’app.',
      'Le nom et le mot de passe (8 à 12 caractères) se changent dans Réglages > WiFi.',
    ],
    note: 'Si le téléphone signale que ce réseau n’a pas accès à Internet, choisissez de rester connecté, sinon l’app ne trouvera pas la caméra. En batterie faible, le WiFi de la caméra se coupe.',
  },
  {
    title: 'L’aperçu',
    symbol: { ios: 'eye', android: 'visibility' },
    body: [
      'L’onglet Caméra affiche l’image en direct pour régler l’angle et vérifier vos réglages. Le voyant caméra clignote alors en bleu.',
      'La caméra ne peut pas enregistrer pendant l’aperçu. L’app le coupe d’elle-même pour enregistrer ou ouvrir la Gallerie : comptez environ 6 secondes. L’aperçu reprend en une dizaine de secondes.',
      'Désactivez l’interrupteur Aperçu pour enregistrer sans attente et économiser la batterie.',
      'Un réglage modifié met 3 à 5 secondes à apparaître dans l’aperçu.',
    ],
  },
  {
    title: 'La carte microSD',
    symbol: { ios: 'sdcard', android: 'sd_card' },
    body: [
      'Utilisez une carte microSD, SDHC ou SDXC de 16 à 256 Go, formatée en exFAT (le format par défaut des cartes de 64 Go et plus).',
      'Insérez-la jusqu’au clic. Appuyez dessus pour l’éjecter.',
      'Les réglages de la caméra sont enregistrés sur la carte : sans carte lisible, l’app ne peut pas les afficher.',
    ],
    note: 'Une carte formatée en FAT32 peut bloquer la caméra (voyant rouge fixe, plus de réponse). Reformatez-la en exFAT sur un ordinateur, ou depuis Réglages > Formater la carte SD.',
  },
  {
    title: 'Fixer la Cambox',
    symbol: { ios: 'link', android: 'link' },
    body: [
      'Présentez d’abord la fixation sous la visière pour repérer son emplacement.',
      'Retirez la protection du velcro sans toucher la partie adhésive, posez-le sous la visière et appuyez fortement sur toute la surface.',
      'Présentez la Cambox horizontalement face au velcro et appuyez sur ses trois parties.',
      'Pour l’enlever : tirez la dragonne d’une aile vers le haut avec un mouvement circulaire vers le centre, puis décrochez la partie centrale et l’autre aile.',
    ],
    note: 'Collez dans un endroit tempéré et sec (environ 15 °C) et attendez 24 h avant d’y fixer la caméra. Les ailes ne s’articulent que de haut en bas : ne les pliez pas d’avant en arrière.',
  },
  {
    title: 'Régler l’angle de vue',
    symbol: { ios: 'camera.aperture', android: 'camera' },
    body: [
      'La partie centrale bascule sur 20° avec trois crans : −5°, +5° et +10°.',
      'Ouvrez l’onglet Caméra pour vérifier le cadrage en direct pendant le réglage.',
    ],
    note: 'Ne forcez pas au-delà des crans et ne posez pas les doigts sur la vitre de l’objectif. Nettoyez-la avec la lingette fournie.',
  },
  {
    title: 'Récupérer vos vidéos',
    symbol: { ios: 'photo.on.rectangle', android: 'photo_library' },
    body: [
      'Par WiFi : onglet Gallerie, touchez une vidéo pour la lire, puis Enregistrer pour la copier sur le téléphone.',
      'Par USB : mettez la caméra en pause (voyant rouge fixe), puis branchez-la à l’ordinateur. Elle apparaît comme un disque.',
      'Par la carte : éjectez la microSD et lisez-la avec un lecteur ou l’adaptateur SD fourni.',
    ],
    note: 'Les vidéos sont en H.265. Si un ordinateur n’affiche que le son, lisez-les avec VLC (gratuit).',
  },
  {
    title: 'Recharger la batterie',
    symbol: { ios: 'battery.100.bolt', android: 'battery_charging_full' },
    body: [
      'Éteignez la caméra, retirez le capuchon et branchez le câble USB-C.',
      'Le voyant batterie reste rouge pendant la charge (environ 4 h) puis passe au vert.',
      'Utilisez un chargeur de 5 V et 1 A maximum. Sur un ordinateur, une batterie externe ou en voiture, la charge est plus longue.',
      'Chargez entre 10 °C et 45 °C. Si la caméra est chaude, laissez-la éteinte 15 minutes avant.',
      'Batterie critique : l’enregistrement et le WiFi s’arrêtent. Le niveau s’affiche dans Réglages.',
    ],
    note: 'La batterie n’est pas amovible. Faites une charge complète environ tous les 3 mois pour la préserver.',
  },
  {
    title: 'Les réglages',
    symbol: { ios: 'slider.horizontal.3', android: 'tune' },
    body: [
      '• Vidéo : résolution et images par seconde (4K sur V4+ et V4 Pro), stabilisation, son, image retournée, effet miroir.',
      '• Image : balance des blancs (11 choix) et exposition (0 à 18, 10 par défaut).',
      '• Mode Pro, V4 Pro seulement : ISO, saturation (0 = noir et blanc), contraste, netteté et grain.',
      '• Ergonomie : enregistrement automatique à l’allumage, voyants en mode jour ou nuit (atténués).',
      '• Maintenance : formater la carte, restaurer les réglages d’usine (sauf le WiFi), éteindre la caméra.',
    ],
    note: 'Les modes 4K et 1080p à 60 i/s font davantage chauffer la caméra et vident plus vite la batterie.',
  },
  {
    title: 'Résoudre un problème',
    symbol: { ios: 'wrench.and.screwdriver', android: 'build' },
    body: [
      'La caméra est bloquée, voyant rouge fixe : la carte est sans doute en FAT32. Faites un reset, puis reformatez-la en exFAT.',
      'Voyant violet clignotant : carte absente, pleine ou non conforme (16 à 256 Go, exFAT).',
      'Voyant jaune fixe : surchauffe (en dehors de −5 °C à 55 °C). Laissez refroidir, puis faites un reset.',
      'Impossible d’activer le WiFi : batterie faible, ou appui trop long sur le bouton WiFi.',
      'La caméra ne démarre plus : rechargez-la avec un chargeur adapté (5 V, 1 A max).',
      'La caméra chauffe : éteignez-la pendant la charge, et préférez 1080p à 30 i/s.',
      'La caméra ne répond plus : faites un reset.',
    ],
  },
  {
    title: 'Faire un reset',
    symbol: { ios: 'arrow.counterclockwise', android: 'restart_alt' },
    body: [
      '1. Retournez la caméra côté velcro et repérez l’orifice de reset.',
      '2. Introduisez la broche métallique fournie.',
      '3. Pressez délicatement jusqu’au clic.',
      '4. Rallumez la caméra.',
    ],
    note: 'N’utilisez ni aiguille, ni trombone, ni cure-dent : ils peuvent abîmer la caméra.',
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
    title: 'Caractéristiques (V4 Pro)',
    symbol: { ios: 'list.bullet.rectangle', android: 'list' },
    body: [
      '• Vidéo : 4K 30 i/s, 1080p et 720p à 30 ou 60 i/s, H.265',
      '• Objectif : capteur Sony 12 Mpx, grand angle 150°, stabilisation',
      '• Audio : deux micros stéréo avec réduction du bruit',
      '• Stockage : microSD 16 à 256 Go, exFAT',
      '• Batterie : 1 100 mAh, jusqu’à 80 min en 1080p 30 i/s',
      '• Température : −5 °C à 55 °C en marche',
      '• Poids : 70 g · Connecteur : USB-C',
      'La V4 n’a pas la 4K ; seule la V4 Pro a le mode Pro.',
    ],
  },
];
