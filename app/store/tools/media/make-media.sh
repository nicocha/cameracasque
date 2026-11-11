#!/bin/bash
# Synthetic "helmet cam" media for the demo camera (no third-party imagery). Run from anywhere; writes next to this file.
# Commands from transcript 828745be: L9966/L10087/L10102 (2026-10-25), L10620 (live frames from car-country), L19778 (2026-10-27).
set -e
cd "$(dirname "$0")"
python3 scenes.py   # -> <scene>.svg + skies.json (sky gradient per scene)
python3 -c "
import json,subprocess
for n,(a,b) in json.load(open('skies.json')).items():
    subprocess.run(['magick','-size','1280x720','gradient:%s-%s'%(a,b),'(','-background','none','-density','96',n+'.svg',')','-composite','-attenuate','0.12','+noise','Gaussian','-quality','88',n+'.jpg'],check=True)
"
mkdir -p live thumbs
for n in $(python3 -c "import json;print(' '.join(json.load(open('skies.json'))))"); do
  ffmpeg -loglevel error -y -loop 1 -i $n.jpg -vf "zoompan=z='1+0.0008*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=250:s=1280x720:fps=25,format=yuv420p" -t 10 -c:v libx264 -preset veryfast -crf 26 $n.mp4
  magick $n.jpg -resize 320x180 -quality 80 thumbs/$n.jpg
done
rm -f live/*.jpg; ffmpeg -loglevel error -y -i car-country.mp4 -vf "fps=12,scale=640:360" -q:v 5 live/f%03d.jpg   # MJPEG live view = car scene
magick horse-meadow.jpg moto-mountain.jpg bike-forest.jpg car-night.jpg kart-track.jpg -resize 400x225 +append r1.png && magick moto-coast.jpg horse-beach.jpg bike-sunset.jpg car-country.jpg ski-piste.jpg -resize 400x225 +append r2.png && magick r1.png r2.png -append contact.png
echo "media ready: $(ls *.mp4 | wc -l) videos, $(ls live | wc -l) live frames"
