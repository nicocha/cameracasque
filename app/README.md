# Caméra Casque — app compatible Cambox V3+ (Expo, iOS + Android)

Pilote la caméra Cambox V3+ via son WiFi, avec le protocole HTTP Novatek
extrait de l'APK d'origine (`com.ajn.camboxv3plus` 1.0.1).

- **Live** : flux vidéo (RTSP) / photo (MJPEG), enregistrement, prise de photo
- **Gallerie** : grille façon Photos (période visible en titre), lecture, sélection multiple : enregistrer dans Photos, partager (un élément), supprimer
- **Réglages** : résolution, durée de fichier, exposition, balance des blancs, rafale,
  extinction auto, fréquence, formatage SD, reset, nom et mot de passe du WiFi
- **Aide** : manuel intégré (bouton ? dans Réglages, lien depuis « Caméra non connectée »)
- Synchronise l'horloge de la caméra à la connexion

## Lancer

Le live passe par VLC (`react-native-vlc-media-player`), donc **Expo Go ne suffit pas** :
il faut un dev build.

```sh
npm install
npx expo run:ios --device     # iPhone branché (compte Apple, même gratuit)
npx expo run:android --device # téléphone Android branché, débogage USB activé
```

Ou dans le cloud avec EAS : `npx eas-cli build:configure` puis
`npx eas-cli build -p android --profile preview` (donne un APK à installer).

## Utilisation

1. Allumer la caméra, activer son WiFi.
2. Connecter le téléphone au WiFi de la caméra (SSID `CamboxV3+…`).
3. Ouvrir l'app : le badge passe à « Connectée ».

**Android** : ce WiFi n'a pas d'internet, donc Android peut envoyer le trafic par la 4G.
Si l'app reste « Non connectée », choisissez « Rester connecté » au message d'Android
ou coupez les données mobiles.

## Protocole (pour référence)

`GET http://192.168.1.254/?custom=1&cmd=<N>[&par=<int>|&str=<texte>]`, réponse XML
`<Cmd>N</Cmd><Status>0</Status>` (0 = OK). Voir `camera.ts`.

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

- `camera.ts` — protocole (sans dépendance React Native)
- `media.ts` — téléchargement vers Photos et partage
- `help.ts` — contenu de l'aide, réécrit d'après le manuel Cambox V3+ (non redistribué)
- `shared.tsx` — état de connexion, couleurs clair/sombre, écran « contenu indisponible »
- `app/` — écrans (expo-router) : pile racine (`_layout.tsx`) avec le visualiseur `view.tsx` en plein écran au-dessus des onglets natifs `(tabs)/` : `index.tsx` Caméra, `gallery/`, `settings/` (dont `help.tsx`)

Test du parseur : `node camera.check.ts`.
Tester sans caméra : `EXPO_PUBLIC_CAM_HOST=127.0.0.1:8099` pointe l'app vers un faux serveur.

## Site web

Le site est dans `../docs/` (HTML/CSS statique), publié par GitHub Pages : Settings › Pages › *Deploy from a branch*,
branche `main`, dossier `/docs`, à l'adresse https://nicocha.github.io/cameracasque/.

- Liens GitHub et APK : construits depuis `CONFIG` en tête de `docs/site.js` (dépôt `nicocha/cameracasque`).
  Renseigner `testflight` dès que l'invitation publique existe.
- Chaque release GitHub doit contenir l'APK sous le nom `camera-casque.apk` (bouton Android →
  `releases/latest/download/camera-casque.apk`).
- Après une modification du CSS ou du JS, incrémenter le `?v=` dans les pages HTML.
- SEO : URL canonique, Open Graph, `sitemap.xml`, `robots.txt` et JSON-LD (`SoftwareApplication`, `FAQPage`).
  Si la FAQ change, garder le bloc `FAQPage` identique au texte visible.

## Nom et marque

L'app s'appelle **Caméra Casque** et s'affiche partout comme « compatible Cambox V3+ ». Cambox® est une marque de
Cambox Vision (INPI n° 4380732) : elle n'est utilisée que pour indiquer la compatibilité, jamais comme nom ni dans l'icône.
L'icône (casque intégral, objectif cerclé de jaune) est dans `assets/icon.svg`.
Le projet iOS généré s'appelle `ios/CameraCasque.xcworkspace`.
