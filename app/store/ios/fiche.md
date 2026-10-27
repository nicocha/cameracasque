# Fiche App Store : Caméra Casque

Textes à copier dans App Store Connect (Apps › Caméra Casque).
Langue principale : français, `fr-FR`. Identifiant de bundle : `com.nicocha.cameracasque`. SKU : `cameracasque`.

## Informations sur l'app

**Nom** (30 caractères max.)

```
Caméra Casque
```

**Sous-titre** (30 caractères max.)

```
Compatible Cambox V3+ et V4
```

**Catégorie principale** : Photo et vidéo. **Catégorie secondaire** : Utilitaires.

**Droits de contenu** : l'app ne contient, n'affiche ni n'accède à aucun contenu de tiers. Les vidéos lues sont celles de la caméra de l'utilisateur.

**Classification par âge** : répondre « Aucun » ou « Non » à toutes les questions. Résultat attendu : 4+.

## Version 1.0

**Texte promotionnel** (170 caractères max., modifiable sans nouvelle version)

```
Votre Cambox reprend du service : aperçu en direct, enregistrement, galerie et réglages, dans une app gratuite, sans publicité et open source.
```

**Description** (4 000 caractères max.)

```
Votre caméra Cambox reprend du service.

Le fabricant a fermé et son application a disparu des stores. Caméra Casque la remplace : une application gratuite, sans publicité et open source pour piloter votre caméra casque Cambox V3+ ou Cambox V4 depuis votre iPhone.

À cheval, à moto, à vélo ou en voiture, fixez la caméra sur votre casque, connectez l'iPhone à son WiFi et retrouvez toutes ses fonctions.

APERÇU EN DIRECT
• Cadrez votre plan avant de partir : l'image de la caméra s'affiche en direct.
• Démarrez et arrêtez l'enregistrement d'un seul geste.
• Prenez une photo (Cambox V3+).

GALERIE
• Les vidéos et photos de la carte microSD, classées par date, comme dans Photos.
• Lecture directe depuis la caméra, sans rien copier.
• Enregistrez dans Photos ou supprimez plusieurs fichiers à la fois, partagez-en un vers l'app de votre choix.

RÉGLAGES
• Résolution et fréquence d'images, durée des fichiers, exposition, balance des blancs, son, date incrustée.
• Nom et mot de passe du WiFi de la caméra.
• Formatage de la carte microSD.
• L'horloge de la caméra se règle automatiquement à la connexion.

AIDE INTÉGRÉE
Boutons, voyants, fixation, connexion, recharge et résolution des problèmes : le mode d'emploi est dans l'application, même sans réseau.

RESPECT DE LA VIE PRIVÉE
L'application ne collecte aucune donnée. Elle n'a ni compte, ni publicité, ni statistiques. Elle communique uniquement avec votre caméra, sur le WiFi local de la caméra.

CAMÉRAS COMPATIBLES
• Cambox V3+
• Cambox V4, V4 Plus et V4 Pro
La détection du modèle est automatique.

OPEN SOURCE
Le code est public sur GitHub, sous licence MIT : https://github.com/nicocha/cameracasque

Caméra Casque est un projet indépendant, non affilié à Cambox Vision et non approuvé par elle. Cambox® est une marque de Cambox Vision, citée uniquement pour indiquer la compatibilité.
```

**Mots-clés** (100 caractères max., séparés par des virgules sans espace ; inutile d'y répéter le nom et le sous-titre)

```
cambox,v3+,v4,pro,moto,cheval,vélo,équitation,embarquée,action,wifi,helmet,dashcam,enduro,quad
```

**URL d'assistance** : https://github.com/nicocha/cameracasque/issues

**URL marketing** : https://cameracasque.fr/

**Copyright** : `2026 <nom du titulaire du compte développeur>`

**Notes de version** : non demandées pour la première version.

## Captures d'écran (fichiers de ce dossier)

Chaque dossier contient `1-camera.png` à `5-help.png`, à déposer dans cet ordre.

| Taille dans App Store Connect | Dossier | Format |
|---|---|---|
| Dynamic Island (large), 6,9" | `6.9/` | 1320 × 2868 PNG |
| Dynamic Island (medium), 6,3" : **obligatoire** | `6.3/` | 1206 × 2622 PNG |
| iPhone Duo, écran extérieur | `duo-outer/` | 1398 × 2034 PNG (portrait) |
| iPhone Duo, écran intérieur | `duo-inner/` | 2853 × 2007 PNG (paysage) |

Les tailles plus petites reprennent ces captures, réduites par Apple. Pas de captures iPad : l'app est réservée à l'iPhone (`supportsTablet: false`).

Les captures de l'iPhone Duo affichent sur la fiche un badge « optimisée pour iPhone Duo ». Elles deviennent obligatoires en avril 2027 pour les apps compilées avec le SDK iOS 27.1 ou plus récent.

Les captures d'origine du simulateur (iPhone 18 Pro Max et iPhone Duo, 9:41) sont encadrées et titrées comme celles de Google Play, sans transparence.

## Confidentialité de l'app

- **URL de la politique de confidentialité** : https://cameracasque.fr/confidentialite.html
- **Collecte de données** : « Non, nous ne collectons pas de données à partir de cette app ». Résultat affiché : « Aucune donnée collectée ».

## Tarification et disponibilité

- **Prix** : gratuit.
- **Disponibilité** : tous les pays, ou au minimum France, Belgique, Suisse, Luxembourg et Canada.

## Informations pour la vérification de l'app

- **Connexion requise** : non.
- **Coordonnées** : nom, téléphone et e-mail du contact pour la revue (non publics).
- **Notes** :

```
Caméra Casque est l'application compagnon d'un accessoire : elle pilote une caméra casque Cambox (V3+ ou V4) par le réseau WiFi local que crée la caméra (192.168.1.254 ou 192.168.2.1). Le fabricant a cessé son activité et son application n'est plus disponible.

Sans caméra, l'app affiche « Caméra non connectée ». L'aide intégrée (onglet Réglages › Aide) reste consultable. Aucun identifiant n'est nécessaire.

Vidéo de démonstration avec une caméra : <lien>

Caméra Casque is the companion app for an accessory: it controls a Cambox helmet camera (V3+ or V4) over the local WiFi network the camera creates. The manufacturer has closed and its app is no longer available. Without a camera the app shows "Caméra non connectée"; the built-in help (Réglages › Aide) remains available. No login is required. Demo video with a camera: <link>
```

- **Pièce jointe** : l'autorisation de Cambox Vision pour la mention de la marque, si elle est obtenue.

## Chiffrement à l'export

Aucune question : `ITSAppUsesNonExemptEncryption` est à `false` dans `app.json`.

## Mise en ligne

1. Build : `npx eas-cli build -p ios --profile production` (numéro de build géré par EAS).
2. Envoi : `npx eas-cli submit -p ios`, qui dépose la build dans App Store Connect.
3. Tester la build sur TestFlight, puis l'ajouter à la version 1.0 et la soumettre à la revue.
