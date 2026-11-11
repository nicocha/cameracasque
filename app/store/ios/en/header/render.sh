#!/bin/sh
# Renders the App Store creative assets (PNG, sRGB, no alpha) next to this folder:
# header.html -> product page header, search.html -> search results image.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
render() { # page size output
  w=${2%x*}; h=${2#*x}
  "$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 \
    --window-size="$w,$h" --screenshot="$PWD/tmp.png" "file://$PWD/$1" 2>/dev/null
  magick tmp.png -crop "${w}x${h}+0+0" +repage -alpha off -colorspace sRGB "../$3-$2.png"
}
for s in 5244x2950 3840x1646; do render header.html $s header; done
for s in 5244x2950 3840x2560 1920x1280; do render search.html $s search; done
rm -f tmp.png
