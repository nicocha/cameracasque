# Caméra Casque — app compatible Cambox V3+ et V4 (Expo, iOS + Android)

Pilote les caméras Cambox via leur WiFi : V3+ avec le protocole HTTP Novatek extrait de l'APK d'origine
(`com.ajn.camboxv3plus` 1.0.1), V4 / V4 Plus / V4 Pro avec le protocole CGI de l'app Cambox 1.5.
Le modèle est détecté automatiquement.

- **Caméra** : aperçu en direct (désactivé au lancement pour pouvoir enregistrer tout de suite ; bouton œil
  dans le coin de l'image), enregistrement, prise de photo (V3+)
- **Galerie** : grille façon Photos (période visible en titre), rafraîchie à chaque visite, sélection multiple :
  enregistrer dans Photos, partager (un élément), supprimer ; « Réessayer » si la caméra ne répond pas
- **Visionneuse** : lecture native (expo-video), balayage entre les éléments, toujours sombre
- **Réglages** : résolution, durée de fichier, exposition, balance des blancs, rafale,
  extinction auto, fréquence, formatage SD, reset, nom et mot de passe du WiFi, extinction
- **Aide** : manuels V3+ et V4 intégrés (bouton ? dans Réglages, lien depuis « Caméra non connectée »),
  version de l'app et lien vers le site
- Synchronise l'horloge de la caméra à la connexion
- Accessibilité et plateformes : couleurs système iOS (Augmenter le contraste), VoiceOver, grandes tailles de texte,
  iPhone Duo (barres latérales, écran intérieur et extérieur, pliage pendant la lecture d'une vidéo)

## Lancer

Le live passe par VLC (`react-native-vlc-media-player`), donc **Expo Go ne suffit pas** :
il faut un dev build.

```sh
npm install
npx expo run:ios --device     # iPhone branché (compte Apple, même gratuit)
npx expo run:android --device # téléphone Android branché, débogage USB activé
```

Ou dans le cloud avec EAS : `npx eas-cli build -p android --profile preview` (donne un APK à installer).

## Utilisation

1. Allumer la caméra, activer son WiFi.
2. Connecter le téléphone au WiFi de la caméra (SSID `CAMBOX…`).
3. Ouvrir l'app : « Caméra non connectée » disparaît dès que la caméra répond.

**Android** : ce WiFi n'a pas d'internet, donc Android peut envoyer le trafic par la 4G.
Si l'app reste « Non connectée », choisissez « Rester connecté » au message d'Android
ou coupez les données mobiles.

## Protocole V3+ (pour référence)

`GET http://192.168.1.254/?custom=1&cmd=<N>[&par=<int>|&str=<texte>]`, réponse XML
`<Cmd>N</Cmd><Status>0</Status>` (0 = OK). Voir `src/camera.ts`.

| cmd | rôle |
|---|---|
| 3001 par=0/1/2 | mode photo / vidéo / lecture |
| 2001 par=1/0 | démarrer / arrêter l'enregistrement |
| 1001 | photo |
| 3014 | lire tous les réglages |
| 3015 | liste des fichiers (XML) ; `<url>?custom=1&cmd=4001` = miniature |
| 4003 str=A:\… | supprimer un fichier |
| 3005 / 3006 | date / heure |
| 3016 | mode courant (sert aussi de heartbeat) |
| 3003 / 3004 | nom / mot de passe WiFi |
| 3010 / 3011 | formater SD / réinitialiser |

Live : `http://192.168.1.254:8192` (MJPEG, mode photo uniquement). Le RTSP du mode vidéo (`rtsp://192.168.1.254/xxx.mov`) envoie l'image en UDP, qu'iOS ne laisse pas passer : l'aperçu utilise donc toujours le flux photo, et la caméra ne passe en mode vidéo que pour enregistrer.

## Code

Tout le code est dans `src/` ; `patches/` corrige `react-native-vlc-media-player` (MobileVLCKit 3.7.3, build Android), appliqué par `npm install`.

- `camera.ts` — protocole (sans dépendance React Native)
- `camera4.ts` — protocole Cambox V4 / V4 Plus / V4 Pro (CGI sur 192.168.2.1, vérifié sur une V4 Pro, firmware 1.2.7). Le modèle est détecté automatiquement (`shared.tsx`)
- `media.ts` — téléchargement vers Photos, partage, miniatures des vidéos V4 (extraites de la vidéo, file d'attente avec délai)
- `help.ts` — contenu de l'aide, réécrit d'après les manuels Cambox V3+, V4 et V4 Pro (non redistribués, `docs/` est ignoré par git)
- `shared.tsx` — état de connexion, couleurs (système sur iOS), messages d'erreur lisibles, marge de la barre latérale
  de l'iPhone Duo (`sideBarWidth`), écran « contenu indisponible »
- `components/` — formulaire des réglages (SwiftUI sur iOS, React Native ailleurs)
- `app/` — écrans (expo-router) : pile racine (`_layout.tsx`) avec le visualiseur `view.tsx` en plein écran au-dessus des onglets natifs `(tabs)/` : `index.tsx` Caméra, `gallery/`, `settings/` (dont `help.tsx`)

VLC ne sert qu'à l'aperçu en direct (MJPEG, RTSP). La visionneuse utilise expo-video : la vue OpenGL de VLC
bloquait l'affichage quand l'iPhone Duo change d'écran. Au pliage, `view.tsx` recrée la vue du lecteur et reprend
la lecture (pause ou erreur causée par le passage en arrière-plan).

Test du parseur : `node src/camera.check.ts`.
Tester sans caméra : `EXPO_PUBLIC_CAM_HOST=127.0.0.1:8099` (V3+) ou `EXPO_PUBLIC_CAM4_HOST=…` (V4) pointe l'app
vers un faux serveur.

## Publication

- Builds avec EAS (`eas.json`, projet `@nicocha/cameracasque`, numéros de build gérés par EAS) :
  `npx eas-cli build -p android --profile production` (AAB) et `-p ios`. Ne pas laisser
  `EXPO_PUBLIC_CAM_HOST` / `EXPO_PUBLIC_CAM4_HOST` dans l'environnement d'un build de production.
- Google Play : test fermé « Alpha », testeurs = membres du groupe `testeurs-cameracasque@googlegroups.com`.
  Il faut 12 testeurs inscrits pendant 14 jours avant de demander l'accès à la production.
- App Store : en attente de l'activation du compte développeur personnel.
- Fiches et captures dans `store/` : `android/fiche.md`, `ios/fiche.md`, captures iOS par taille
  (`6.9/`, `6.3/` obligatoire, `duo-outer/`, `duo-inner/`).

## Site web

Le site est dans `../docs/` (HTML/CSS statique), publié par GitHub Pages : Settings › Pages › *Deploy from a branch*,
branche `main`, dossier `/docs`, à l'adresse https://cameracasque.fr/.

- Liens : construits depuis `CONFIG` en tête de `docs/site.js` (dépôt GitHub, test fermé Google Play et groupe
  des testeurs). Renseigner `testflight` dès que l'invitation publique existe, et remplacer les liens du test
  par la fiche Google Play une fois l'app en production.
- Le site existe en français (`docs/`) et en anglais (`docs/en/`) : modifier les deux.
- Après une modification du CSS ou du JS, incrémenter le `?v=` dans les pages HTML.
- SEO : URL canonique, Open Graph, `sitemap.xml`, `robots.txt` et JSON-LD (`SoftwareApplication`, `FAQPage`).
  Si la FAQ change, garder le bloc `FAQPage` identique au texte visible.

## Nom et marque

L'app s'appelle **Caméra Casque** et s'affiche partout comme « compatible Cambox V3+ et V4 ». Cambox® est une marque de
Cambox Vision (INPI n° 4380732) : elle n'est utilisée que pour indiquer la compatibilité, jamais comme nom ni dans l'icône.
L'icône (casque intégral, objectif cerclé de jaune) est dans `assets/icon.svg`.
Le projet iOS généré s'appelle `ios/CameraCasque.xcworkspace`.
