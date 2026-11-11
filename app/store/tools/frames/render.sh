#!/bin/bash
# Frames the simulator/emulator captures and renders the store PNGs into app/store/.
# Reassembled from transcript 828745be (cambox e1b84019): L11625/L11668 (Play, 2026-10-26),
# L19434 (iOS 6.9, 2026-10-27T08:59), L20795 (final render, 13:52), L21189 (6.3 + alpha off, 15:07),
# L21413 (iPhone Duo, 15:16). Commands and CSS are the originals; only paths are parameterised.
#
# Usage: render.sh <SHOTS>   with SHOTS/ios/<n>-dark.png (1320x2868), SHOTS/android/<n>.png (1080x2424),
#        SHOTS/duo-outer/<n>.png (1398x2034), SHOTS/duo-inner/<n>.png (2853x2007),
#        n = 1-camera 2-gallery 3-viewer 4-settings 5-help.
# Optional: ONLY="ios android feature duo" to render a subset; STORE_LANG=en for the English set
# (written to app/store/ios/en/ and app/store/android/en/).
set -e
SHOTS=$(cd "$1" && pwd)
HERE=$(cd "$(dirname "$0")" && pwd)
ST=$(cd "$HERE/../.." && pwd)            # app/store
L=${STORE_LANG:-fr}; SUB=""; [ "$L" = fr ] || SUB="/$L"   # store/<platform>$SUB
B=${B:-$HERE/../out}; mkdir -p "$B/play" "$B/ios-shots" "$B/duo-outer" "$B/duo-inner"; B=$(cd "$B" && pwd)
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ONLY=${ONLY:-"ios android feature duo"}
NAMES="1-camera 2-gallery 3-viewer 4-settings 5-help"
has() { case " $ONLY " in *" $1 "*) return 0;; esac; return 1; }
# App Store captions (iOS and iPhone Duo): name|title|subtitle. Google Play's are in android.py.
if [ "$L" = en ]; then
  T=("1-camera|See what your camera sees|Live preview and one-tap recording." "2-gallery|All your videos, sorted by date|The SD card’s files, just like in Photos." "3-viewer|Watch, save, share|Play straight from the camera, then copy to your iPhone." "4-settings|Every camera setting|Resolution, file length, exposure, WiFi." "5-help|The built-in user guide|Buttons, lights and connection, simply explained.")
else
  T=("1-camera|Voyez ce que filme votre caméra|Aperçu en direct et enregistrement d’un seul geste." "2-gallery|Toutes vos vidéos, classées par date|Les fichiers de la carte SD, comme dans Photos." "3-viewer|Regardez, enregistrez, partagez|Lecture directe depuis la caméra, puis copie sur l’iPhone." "4-settings|Tous les réglages de la caméra|Résolution, durée des fichiers, exposition, WiFi." "5-help|Le mode d’emploi intégré|Boutons, voyants et connexion, expliqués simplement.")
fi

# ---- Google Play: 5 screenshots 1080x1920 + feature graphic 1024x500 (frames/android.py) ----
mkdir -p "$ST/android$SUB"
if has android || has feature; then
  cp "$HERE/og.html" "$B/og.html"
  python3 "$HERE/android.py" "$B" "$L"
  for n in $NAMES; do [ -f "$SHOTS/android/$n.png" ] && cp "$SHOTS/android/$n.png" "$B/play/$n-dark.png"; done
fi
if has android; then
  for n in $NAMES; do
    "$C" --headless --hide-scrollbars --window-size=1080,1920 --screenshot="$ST/android$SUB/$n.png" "file://$B/play/$n.html" 2>/dev/null
  done
fi
if has feature; then  # last rendered 2026-10-26T10:01:51Z with play/1-camera-dark.png = Android camera capture
  "$C" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1024,500 --allow-file-access-from-files --screenshot="$ST/android$SUB/feature-graphic.png" "file://$B/play/feature.html" 2>/dev/null
  magick "$ST/android$SUB/feature-graphic.png" -alpha off "$ST/android$SUB/feature-graphic.png"
fi

# ---- App Store 6.9" (1320x2868) and 6.3" (1206x2622) — L19434 verbatim CSS and captions ----
if has ios; then
  cd "$B/ios-shots"
  for n in $NAMES; do cp "$SHOTS/ios/$n-dark.png" "$n-dark.png"; done
  CSS='html,body{margin:0;width:1320px;height:2868px;overflow:hidden;background:radial-gradient(120% 60% at 50% 100%,#2a2400 0%,#000 60%);font-family:-apple-system,"SF Pro Display",sans-serif;color:#f5f5f7;text-align:center}
h1{margin:170px 80px 0;font-size:96px;line-height:1.08;letter-spacing:-.025em;font-weight:700}
p{margin:36px 110px 0;font-size:46px;line-height:1.3;color:#a1a1a6}
.ph{position:absolute;left:50%;top:640px;transform:translateX(-50%);width:880px;padding:18px;border-radius:118px;background:#1d1d1f;box-shadow:0 0 0 3px #3a3a3c,0 50px 150px rgba(255,227,0,.12)}
.ph img{width:100%;display:block;border-radius:100px}
.di{position:absolute;left:50%;top:42px;transform:translateX(-50%);width:252px;height:74px;border-radius:37px;background:#000}'
  mk(){ echo "<!doctype html><html><head><meta charset=utf-8><style>$CSS</style></head><body><h1>$2</h1><p>$3</p><div class=ph><img src=$1-dark.png><div class=di></div></div></body></html>" > $1.html
  "$C" --headless --hide-scrollbars --window-size=1320,2868 --screenshot=$B/ios-shots/out-$1.png file://$B/ios-shots/$1.html 2>/dev/null; }
  for t in "${T[@]}"; do IFS='|' read n ti su <<< "$t"; mk $n "$ti" "$su"; done
  mkdir -p "$ST/ios$SUB/6.9" "$ST/ios$SUB/6.3"
  for n in $NAMES; do  # L21189: Apple refuses alpha; 6.3 is the 6.9 render squeezed to 1206x2622
    magick out-$n.png -alpha off "$ST/ios$SUB/6.9/$n.png"
    magick out-$n.png -alpha off -resize 1206x2622! "$ST/ios$SUB/6.3/$n.png"
  done
  cd - >/dev/null
fi

# ---- iPhone Duo: outer 1398x2034 portrait, inner 2853x2007 landscape — L21413 ----
if has duo; then
  mkdir -p "$ST/ios$SUB/duo-outer" "$ST/ios$SUB/duo-inner"
  for kind in outer inner; do for t in "${T[@]}"; do IFS='|' read n ti su <<< "$t"; [ -f "$SHOTS/duo-$kind/$n.png" ] || continue; cp "$SHOTS/duo-$kind/$n.png" "$B/duo-$kind/$n.png"; size=$(python3 "$HERE/duo.py" $kind $B/duo-$kind/$n.png $B/duo-$kind/$n.html "$ti" "$su"); "$C" --headless --hide-scrollbars --window-size=${size% *},${size#* } --screenshot=$B/duo-$kind/f-$n.png file://$B/duo-$kind/$n.html 2>/dev/null; magick $B/duo-$kind/f-$n.png -alpha off "$ST/ios$SUB/duo-$kind/$n.png"; done; done
fi
magick identify -format '%d/%f %wx%h\n' "$ST"/android/*.png "$ST"/ios/*/[1-5]-*.png 2>/dev/null
