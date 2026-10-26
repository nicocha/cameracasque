# Fiche Google Play : Caméra Casque

Textes à copier dans la Play Console (Développer la présence sur le Play Store › Fiche principale).
Langue par défaut : français (France), `fr-FR`.

## Détails de l'application

**Nom de l'application** (30 caractères max.)

```
Caméra Casque
```

**Description courte** (80 caractères max.)

```
Pilotez votre Cambox V3+ ou V4 : aperçu en direct, vidéos et réglages.
```

**Description complète** (4 000 caractères max.)

```
Votre caméra Cambox reprend du service.

Le fabricant a fermé et son application a disparu des stores. Caméra Casque la remplace : une application gratuite, sans publicité et open source pour piloter votre caméra casque Cambox V3+ ou Cambox V4 depuis votre téléphone.

À cheval, à moto, à vélo ou en voiture, fixez la caméra sur votre casque, connectez le téléphone à son WiFi et retrouvez toutes ses fonctions.

APERÇU EN DIRECT
• Cadrez votre plan avant de partir : l'image de la caméra s'affiche en direct.
• Démarrez et arrêtez l'enregistrement d'un seul geste.
• Prenez une photo (Cambox V3+).

GALERIE
• Les vidéos et photos de la carte microSD, classées par date, comme dans votre galerie.
• Lecture directe depuis la caméra, sans rien copier.
• Enregistrez dans la galerie du téléphone ou supprimez plusieurs fichiers à la fois, partagez-en un vers l'app de votre choix.

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

## Éléments graphiques (fichiers de ce dossier)

| Champ | Fichier | Format |
|---|---|---|
| Icône de l'application | `icon-512.png` | 512 × 512 PNG |
| Image de présentation | `feature-graphic.png` | 1024 × 500 PNG |
| Captures d'écran (téléphone) | `1-camera.png` … `5-help.png`, dans cet ordre | 1080 × 1920 PNG |

Vidéo YouTube : facultative. Celle de la démonstration pour la revue peut servir.

## Catégorie et coordonnées (Paramètres de la fiche)

- **Type** : Application
- **Catégorie** : Vidéo et montage (ou Photographie)
- **Tags** : Caméra, Vidéo
- **Adresse e-mail** : *obligatoire et publique, à choisir* (une adresse dédiée est conseillée)
- **Site web** : https://cameracasque.fr/
- **Règles de confidentialité** : https://cameracasque.fr/confidentialite.html

## Contenu de l'application (Règles et programmes › Contenu de l'application)

- **Règles de confidentialité** : URL ci-dessus.
- **Annonces** : Non, l'application ne contient pas d'annonces.
- **Accès à l'application** : « Tout ou partie des fonctionnalités sont restreintes ». Instructions pour la revue :

```
L'application pilote une caméra casque Cambox (V3+ ou V4) par son réseau WiFi local. Sans caméra, elle affiche « Caméra non connectée » et l'aide intégrée (onglet Réglages › Aide) reste consultable. Aucun identifiant n'est nécessaire. Vidéo de démonstration avec une caméra : <lien>

The app controls a Cambox helmet camera (V3+ or V4) over the camera's local WiFi network. Without a camera it shows "Caméra non connectée"; the built-in help (Réglages › Aide) remains available. No login is required. Demo video with a camera: <link>
```

- **Classification du contenu** (questionnaire IARC) : catégorie « Toutes les autres applications » ; répondre Non à toutes les questions (pas de violence, de contenu sexuel, de jeux d'argent, d'interactions entre utilisateurs, de partage de position, d'achats). Résultat attendu : PEGI 3 / Tout public.
- **Public cible** : 18 ans et plus. L'application n'est pas conçue pour les enfants, ce qui évite les exigences du programme Famille.
- **Sécurité des données** :
  - Collecte ou partage de données des types requis : **Non**.
  - Le formulaire s'arrête là. Le partage d'un fichier vers une autre app, lancé par l'utilisateur, n'est pas un « partage » au sens de Google.
- **Application gouvernementale** : Non. **Fonctionnalités financières** : Aucune. **Santé** : Aucune.
- **Autorisations** : la build ne demande que l'accès réseau et l'écriture dans la galerie (Android 9 et moins). Aucune déclaration « photos et vidéos » n'est nécessaire.

## Notes de version 1.0.0

```
Première version : aperçu en direct, enregistrement, galerie, réglages et aide pour Cambox V3+ et V4.
```

## Mise en ligne

1. Build : `npx eas-cli build -p android --profile production` (AAB, numéro de version géré par EAS).
2. **Premier envoi à la main** : Play Console › Tests › Tests internes › Créer une release, puis déposer l'AAB. Google n'accepte l'envoi automatique (`npx eas-cli submit -p android`) qu'après ce premier dépôt, avec une clé de compte de service.
3. Accepter la signature d'application par Google Play.
4. Compte personnel récent : **test fermé avec au moins 12 testeurs pendant 14 jours** avant de pouvoir demander l'accès à la production.
5. Pays : France, Belgique, Suisse, Luxembourg, Canada, ou tous les pays.
