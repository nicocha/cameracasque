# Outils des captures stores

Outillage qui a produit les captures App Store et Google Play d'`app/store/` (26-27 oct. 2026). Il vivait dans un dossier temporaire aujourd'hui effacé. Il est reconstitué à partir des transcripts de session Claude Code (`828745be…jsonl`, identique à `cambox/e1b84019…jsonl` pour cette période). Pour chaque fichier, on a pris la dernière version et rejoué les modifications suivantes.

| Fichier | Rôle | Source (ligne du transcript, UTC) |
|---|---|---|
| `media/scenes.py` | 10 scènes « vue casque » en SVG : cheval, moto, vélo, voiture, karting, ski | L9966 (25/10 16:43), puis L10027, L10057, L10577, L10599, L19735, L19749, L19778 (27/10 10:31) |
| `media/make-media.sh` | SVG → JPG 1280×720 (dégradé de ciel + bruit), MP4 de 10 s (zoom lent), vignettes 320×180, images MJPEG du direct | commandes L9966, L10102, L10620, L19778 |
| `media/democam.mjs` + `menu.xml` | Fausse Cambox V3+ utilisée pour les captures : API sur 8099, direct MJPEG sur 8192, socket sur 3333, 39 fichiers | L5430 (17/10), puis L10087, L10164, L19793, L19960 (27/10 10:35) |
| `mocks/mockcam.mjs` | Premier simulateur V3+ (17/10), pas utilisé pour les captures finales | sortie de `cat` en L5417 |
| `mocks/v4/mock4.mjs` + `mediamtx.yml` | Simulateur Cambox V4 (CGI, `/data/100CAMBX`, RTSP via mediamtx), pas utilisé pour les captures | L9428 (25/10), puis les `sed` L16446 et L16560 |
| `capture/tour.py` | Code temporaire `TEMP-TOUR` qui fait défiler l'app et active l'aperçu | L20662 + L20736 (27/10 13:40-13:45), repris en L21202 |
| `frames/android.py` + `og.html` | Cadres Google Play et image de présentation (« feature graphic ») | L11625 + L11668 (26/10 10:01) ; `og.html` vient du `cat` en L11596 |
| `frames/render.sh` | Mise en cadre iOS 6.9", 6.3", iPhone Duo et Play, rendue avec Chrome headless puis `magick` | L19434, L20795, L21189, L21413 |
| `frames/duo.py` | Cadres iPhone Duo (extérieur et intérieur) | L21413 (27/10 15:16) |

Seule adaptation par rapport aux originaux : les chemins. `cambox` devient `cameracasque`, et `app/app` devient `app/src/app`.

## Prérequis

`node`, `python3`, ImageMagick 7 (`magick`), `ffmpeg`, Google Chrome. Côté appareils : simulateurs Xcode « iPhone 18 Pro Max » (6,9") et « iPhone Duo » (iOS 27.1), AVD Android `Pixel_9a`. Il faut aussi un **dev client** de l'app installé sur chacun. Sur iOS, c'était une build Debug de DerivedData (`CameraCasque-…/Debug-iphonesimulator/CameraCasque.app`) ; voir les limites plus bas.

À l'époque, l'identifiant de l'app était `com.nicocha.cameracasque`. Il est maintenant `fr.cameracasque.app` (`app.json`) : `APP` ci-dessous. Les UDID sont ceux de la machine d'origine : à remplacer.

## Procédure

```sh
T=app/store/tools; APP=fr.cameracasque.app
S=<UDID iPhone 18 Pro Max>; D=<UDID iPhone Duo>; SH=$T/out/shots   # SH : dossier des captures brutes
mkdir -p $SH/ios $SH/android $SH/duo-outer $SH/duo-inner

# 1. Médias de synthèse, puis la fausse caméra (laisser tourner)
$T/media/make-media.sh
(cd $T/media && node democam.mjs)            # « demo camera on 8099, 39 files »

# 2. Code temporaire, puis Metro branché sur la fausse caméra
python3 $T/capture/tour.py                   # Galerie à 20 s, visualiseur à 40 s, Réglages à 60 s, Aide à 80 s
(cd app && EXPO_PUBLIC_CAM_HOST=127.0.0.1:8099 npx expo start --port 8082 --dev-client --clear)
```

**3. iPhone 18 Pro Max** (L20676/L20736). La série sombre va aux stores ; la claire ne sert qu'au site (`docs/img/*-light.webp`).

```sh
xcrun simctl spawn $S defaults write $APP EXDevMenuIsOnboardingFinished -bool YES
xcrun simctl spawn $S defaults write $APP EXDevMenuShowFloatingActionButton -bool NO
xcrun simctl spawn $S defaults write $APP EXDevMenuShowsAtLaunch -bool NO
xcrun simctl status_bar $S override --time "9:41" --batteryState charged --batteryLevel 100 --wifiMode active --wifiBars 3 --cellularMode notSupported
for mode in dark light; do xcrun simctl ui $S appearance $mode; xcrun simctl terminate $S $APP 2>/dev/null; perl -e 'select(undef,undef,undef,2)'; xcrun simctl launch $S $APP --initialUrl 'http://127.0.0.1:8082' >/dev/null; t0=$(date +%s); for pair in 18:1-camera 38:2-gallery 58:3-viewer 78:4-settings 98:5-help; do t=${pair%%:*}; n=${pair##*:}; while [ $(( $(date +%s) - t0 )) -lt $t ]; do perl -e 'select(undef,undef,undef,0.3)'; done; xcrun simctl io $S screenshot $SH/ios/$n-$mode.png >/dev/null 2>&1; done; done
```

Le temps de démarrage varie d'une série à l'autre. Vérifier chaque capture et relancer la série si l'une est décalée.

**4. Émulateur Pixel 9a**, mode sombre, barre d'état de démo (L20756/L20776) :

```sh
~/Library/Android/sdk/emulator/emulator -avd Pixel_9a -no-window -no-audio -no-snapshot-save -no-boot-anim &
for p in 8082 8099 8192 3333; do adb reverse tcp:$p tcp:$p; done
adb shell cmd uimode night yes; adb shell settings put global sysui_demo_allowed 1
for c in enter "clock -e hhmm 0941" "notifications -e visible false" "battery -e level 100 -e plugged false" "network -e wifi show -e level 4 -e mobile hide -e airplane hide -e satellite hide" "status -e location hide -e alarm hide -e bluetooth hide"; do adb shell am broadcast -a com.android.systemui.demo -e command $c >/dev/null; done
adb shell am force-stop $APP; adb shell am start -a android.intent.action.VIEW -d "exp+cambox://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082" $APP
# puis captures à 18/38/58/78/98 s : adb exec-out screencap -p > $SH/android/<n>.png
```

Le 27/10, le direct n'était pas encore connecté à 18 s. L'écran Caméra a donc été refait seul, en relançant l'app et en gardant la capture prise à 16 s. Le bouton flottant du menu dev Android (« Tools button ») avait été désactivé à la main depuis ce menu le 26/10.

**5. iPhone Duo** (L21208, L21368, L21387), avec les mêmes `defaults` et `status_bar` que pour l'iPhone :
- **Écran intérieur** (`--display=3`, 2853×2007) : captures à 18/38/58/78/98 s. Le simulateur ignore le mode sombre sur cet écran, donc la Galerie, les Réglages et l'Aide sont en clair.
- **Écran extérieur** (`--display=1`, 1398×2034, mode sombre) : il n'a répondu qu'après un `xcrun simctl shutdown`/`boot`. Captures à 25/45/65/85/105 s. Elles sont tombées un écran trop tard et ont été renommées en conséquence. L'écran Caméra a été refait seul, à environ 18 s.

```sh
xcrun simctl io $D screenshot --display=3 $SH/duo-inner/<n>.png   # intérieur
xcrun simctl io $D screenshot --display=1 $SH/duo-outer/<n>.png   # extérieur
```

**6. Nettoyage** : `git checkout app/src/app/_layout.tsx "app/src/app/(tabs)/index.tsx"`, arrêter `democam.mjs` et Metro, puis `xcrun simctl status_bar $S clear` et `adb shell am broadcast -a com.android.systemui.demo -e command exit`.

**7. Mise en cadre** : le script lit `$SH` et écrit directement dans `app/store/` (travail intermédiaire dans `tools/out/`) :

```sh
$T/frames/render.sh $SH                    # tout
ONLY="android" $T/frames/render.sh $SH     # ou un sous-ensemble : ios android feature duo
```

Le rendu dans Chrome utilise une page sur fond noir avec un halo jaune `radial-gradient(… #2a2400 …)`, la police `-apple-system`, un titre blanc en gras et un sous-titre gris `#a1a1a6`. La capture est posée dans un faux contour d'appareil (`.ph`), avec une Dynamic Island dessinée (`.di`) sur iOS 6,9". Ensuite, `magick -alpha off` retire la transparence (Apple la refuse) ; pour la 6,3", `-resize 1206x2622!`.

## Textes par écran

| Écran | Titre (iOS, Android, Duo) | Sous-titre iOS et Duo | Sous-titre Android |
|---|---|---|---|
| 1-camera | Voyez ce que filme votre caméra | Aperçu en direct et enregistrement d’un seul geste. | idem |
| 2-gallery | Toutes vos vidéos, classées par date | Les fichiers de la carte SD, comme dans Photos. | Les fichiers de la carte SD, comme dans votre galerie. |
| 3-viewer | Regardez, enregistrez, partagez | Lecture directe depuis la caméra, puis copie sur l’iPhone. | Lecture directe depuis la caméra, puis copie sur le téléphone. |
| 4-settings | Tous les réglages de la caméra | Résolution, durée des fichiers, exposition, WiFi. | idem |
| 5-help | Le mode d’emploi intégré | Boutons, voyants et connexion, expliqués simplement. | idem |

**Image de présentation** (1024×500) : badge « Compatible Cambox V3+ et V4 », nom « Caméra Casque » avec l'icône, titre « Votre caméra reprend du service. », sous-titre « À cheval, à moto, à vélo, en voiture. App gratuite et open source. ». Le téléphone, légèrement incliné, affiche `1-camera-dark.png` (la capture Android) devant un anneau jaune `#ffe300`.

**Pour l'anglais**, les textes se trouvent à trois endroits :
- les lignes `mk …` et le tableau `T=(…)` de `render.sh` ;
- `caps` dans `android.py`, ainsi que les `replace` qui produisent `feature.html` ;
- `og.html`.

Il faut aussi passer les simulateurs et l'émulateur en anglais. L'app suit la langue du système. Exemple, à vérifier car cette commande ne figure pas dans les transcripts : `xcrun simctl spawn $S defaults write -g AppleLanguages '(en)'`.

## Non récupéré ou incertain

- **Builds des dev clients** installés le 27/10 : leur commande de build n'apparaît pas dans les transcripts. Le 25/10, c'étaient des builds Release avec `EXPO_PUBLIC_CAM_HOST` et la visite intégrée (`xcodebuild … -configuration Release`, visite à 16/26/36/46 s, captures à 14/24/34/44/53 s). Cette méthode a été remplacée par Metro et un dev client.
- **Image de présentation** : elle a été rendue pour la dernière fois le 26/10 à 10:01 UTC, avec la capture Android du 26/10. Le rendu du 27/10 n'a régénéré que les 5 captures. La relancer aujourd'hui prend la capture `1-camera` la plus récente.
- **Contrôle des minutages** : il a été fait à l'œil, capture par capture, et ne peut pas être automatisé tel quel.
- **Captures « claires »** du site : elles ont été exportées en webp vers `docs/img/` (`magick -resize 640x -quality 82 -define webp:method=6`). Hors du périmètre des stores.
- **`mockcam.mjs`** attend une image en argument et un `test.mp4` dans le dossier courant. Ce fichier venait de : `ffmpeg -f lavfi -i testsrc=duration=85:size=640x360:rate=10 -pix_fmt yuv420p -c:v libx264 -preset ultrafast test.mp4`.
- **`mock4.mjs`** sert `100CAMBX/VID_000{1,2,3}.MOV`, créés ainsi (L9428) : `ffmpeg -f lavfi -i "testsrc2=size=1280x720:rate=30:duration=$((4+i*2))" -f lavfi -i "sine=frequency=$((300*i)):duration=$((4+i*2))" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest 100CAMBX/VID_000$i.MOV`. Dates fixées par `touch -t 202610240905`, `202610241130` et `202610251015`. Lancement : `node mock4.mjs 8098` et `mediamtx mediamtx.yml`, avec `EXPO_PUBLIC_CAM4_HOST=127.0.0.1:8098`.
- **Hacks « TEMP » plus anciens** (17/10) : `Redirect` dans `index.tsx`, `TEMP-DEBUG` dans `shared.tsx`, galerie en sélection. Ils servaient au débogage et aux premières captures, pas aux visuels actuels. Non repris.
