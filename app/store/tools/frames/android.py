# Google Play frames + feature graphic. Usage: python3 android.py <B>  (B contains og.html, writes B/play/*.html)
# Pass 1: transcript 828745be L11625 (2026-10-26T10:01:29Z), verbatim.
import sys; B=sys.argv[1]; L=sys.argv[2] if len(sys.argv)>2 else 'fr'
caps=[('1-camera','Voyez ce que filme votre caméra','Aperçu en direct et enregistrement d’un seul geste.'),
('2-gallery','Toutes vos vidéos, classées par date','Les fichiers de la carte SD, comme dans votre galerie.'),
('3-viewer','Regardez, enregistrez, partagez','Lecture directe depuis la caméra, puis copie sur le téléphone.'),
('4-settings','Tous les réglages de la caméra','Résolution, durée des fichiers, exposition, WiFi.'),
('5-help','Le mode d’emploi intégré','Boutons, voyants et connexion, expliqués simplement.')]
if L=='en': caps=[('1-camera','See what your camera sees','Live preview and one-tap recording.'),
('2-gallery','All your videos, sorted by date','The SD card’s files, just like in your gallery.'),
('3-viewer','Watch, save, share','Play straight from the camera, then copy to your phone.'),
('4-settings','Every camera setting','Resolution, file length, exposure, WiFi.'),
('5-help','The built-in user guide','Buttons, lights and connection, simply explained.')]
css='''html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:radial-gradient(120% 60% at 50% 100%,#2a2400 0%,#000 60%);font-family:-apple-system,"SF Pro Display",sans-serif;color:#f5f5f7;text-align:center}
h1{margin:110px 60px 0;font-size:72px;line-height:1.08;letter-spacing:-.025em;font-weight:700}
p{margin:26px 90px 0;font-size:36px;line-height:1.3;color:#a1a1a6}
.ph{position:absolute;left:50%;top:560px;transform:translateX(-50%);width:640px;padding:12px;border-radius:62px;background:#1d1d1f;box-shadow:0 0 0 2px #3a3a3c,0 40px 120px rgba(255,227,0,.12)}
.ph img{width:100%;display:block;border-radius:50px}'''
for n,h,p in caps:
  open(f'{B}/play/{n}.html','w').write(f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body><h1>{h}</h1><p>{p}</p><div class="ph"><img src="{n}-dark.png"></div></body></html>')
fg=open(f'{B}/og.html').read()
fg=fg.replace('width:1200px;height:630px','width:1024px;height:500px').replace('left:80px;top:118px;width:660px','left:64px;top:70px;width:600px').replace('font-size:70px','font-size:60px').replace('font-size:27px','font-size:24px').replace('right:30px;top:85px;width:460px;height:460px','right:20px;top:40px;width:420px;height:420px').replace('right:180px;top:40px;width:250px','right:140px;top:26px;width:220px')
fg=fg.replace(' App gratuite pour iPhone et Android.',' App gratuite et open source.')
open(f'{B}/play/feature.html','w').write(fg)

# Pass 2: L11668 (2026-10-26T10:01:51Z): sed on [1-5]-*.html, then the feature.html fixes, verbatim.
import glob
for f in glob.glob(f'{B}/play/[1-5]-*.html'):
  h=open(f).read(); open(f,'w').write(h.replace('top:560px;transform:translateX(-50%);width:640px','top:500px;transform:translateX(-50%);width:580px'))
p=f'{B}/play/feature.html'; s=open(p).read()
s=s.replace('file:///Users/nicocha/Projects/personal/cameracasque/docs/img/camera-dark.webp','1-camera-dark.png')
s=s.replace('left:64px;top:70px;width:600px','left:64px;top:80px;width:520px').replace('font-size:60px','font-size:56px')
s=s.replace('Votre Cambox reprend du service.','Votre caméra reprend du service.')
s=s.replace('border-radius:44px;background:#1d1d1f','border-radius:36px;background:#1d1d1f').replace('border-radius:37px','border-radius:30px')
if L=='en':
  s=s.replace('Compatible Cambox V3+ et V4','Works with Cambox V3+ and V4').replace('Votre caméra reprend du service.','Your camera is back in action.')
  s=s.replace('À cheval, à moto, à vélo, en voiture. App gratuite et open source.','Horse riding, motorcycling, cycling, driving. Free and open-source app.').replace('lang="fr"','lang="en"')
  assert 'Your camera' in s and 'Free and open' in s
open(p,'w').write(s)
