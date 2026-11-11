# Fiche App Store en anglais : Caméra Casque

Textes à copier dans App Store Connect, dans la langue ajoutée **Anglais (États-Unis)** (`en-US`) : menu des langues en haut à droite de la page de l'app, puis « Ajouter une langue ».
Les champs non traduits ici (catégories, prix, confidentialité des données, informations de vérification) sont communs à toutes les langues : voir `fiche.md`.

Pour le Royaume-Uni, l'Australie ou le Canada, on peut ajouter aussi **Anglais (Royaume-Uni)**, **Anglais (Australie)** ou **Anglais (Canada)** et y recopier les mêmes textes.

## Informations sur l'app (par langue)

**Nom** (30 caractères max.) : on garde la marque, identique au nom affiché sous l'icône.

```
Caméra Casque
```

**Sous-titre** (30 caractères max.)

```
Cambox V3+ & V4 helmet camera
```

**URL de la politique de confidentialité**

```
https://cameracasque.fr/en/privacy.html
```

## Version 1.0

**Texte promotionnel** (170 caractères max.)

```
Bring your Cambox back to life: live preview, recording, gallery and settings, in a free, ad-free, open-source app.
```

**Description** (4 000 caractères max.)

```
Bring your Cambox camera back to life.

The manufacturer has closed and its app is gone from the stores. Caméra Casque replaces it: a free, ad-free, open-source app to control your Cambox V3+ or Cambox V4 helmet camera from your iPhone.

Horse riding, motorcycling, cycling or driving: mount the camera on your helmet, join its WiFi from your iPhone and get all its features back.

LIVE PREVIEW
• Frame your shot before you set off: the camera's image shows live.
• Start and stop recording in one tap.
• Take a photo (Cambox V3+).

GALLERY
• The videos and photos on the microSD card, sorted by date, just like in Photos.
• Play them straight from the camera, nothing to copy.
• Save to Photos or delete several files at once, share one to the app of your choice.

SETTINGS
• Resolution and frame rate, file length, exposure, white balance, sound, date stamp.
• Name and password of the camera's WiFi.
• microSD card formatting.
• The camera's clock is set automatically when you connect.

BUILT-IN HELP
Buttons, lights, mounting, connecting, charging and troubleshooting: the user guide is in the app, even offline.

PRIVACY
The app collects no data. No account, no ads, no analytics. It only talks to your camera, over the camera's own local WiFi.

COMPATIBLE CAMERAS
• Cambox V3+
• Cambox V4, V4 Plus and V4 Pro
The model is detected automatically.

OPEN SOURCE
The code is public on GitHub, under the MIT license: https://github.com/nicocha/cameracasque

Caméra Casque is an independent project, not affiliated with or endorsed by Cambox Vision. Cambox® is a trademark of Cambox Vision, mentioned only to indicate compatibility.
```

**Mots-clés** (100 caractères max., virgules sans espace ; le nom et le sous-titre comptent déjà, inutile d'y répéter « cambox », « helmet » ou « camera »)

```
pro,motorcycle,horse,riding,equestrian,bike,mtb,cycling,action,cam,wifi,ski,dashcam,enduro,karting
```

**URL d'assistance**

```
https://github.com/nicocha/cameracasque/issues
```

**URL marketing**

```
https://cameracasque.fr/en/
```

## Captures d'écran

Mêmes tailles et même ordre que la fiche française, dans `en/` :

| Taille dans App Store Connect | Dossier |
|---|---|
| Dynamic Island (large), 6,9" | `en/6.9/` |
| Dynamic Island (medium), 6,3" | `en/6.3/` |
| iPhone Duo, écran extérieur | `en/duo-outer/` |
| iPhone Duo, écran intérieur | pas de version anglaise : App Store Connect reprend les captures françaises |

**En-tête de la page produit** : `en/header-5244x2950.png` et `en/header-3840x1646.png`. **Image des résultats de recherche** : `en/search-5244x2950.png`, `en/search-3840x2560.png` et `en/search-1920x1280.png`. Sans texte, mais avec les écrans en anglais.

Légendes des captures :

| Capture | Titre | Sous-titre |
|---|---|---|
| 1-camera | See what your camera sees | Live preview and one-tap recording. |
| 2-gallery | All your videos, sorted by date | The SD card’s files, just like in Photos. |
| 3-viewer | Watch, save, share | Play straight from the camera, then copy to your iPhone. |
| 4-settings | Every camera setting | Resolution, file length, exposure, WiFi. |
| 5-help | The built-in user guide | Buttons, lights and connection, simply explained. |

Pour les régénérer : `app/store/tools/README.md`, avec `STORE_LANG=en`.
