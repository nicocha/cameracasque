# Vidéo de démonstration pour la revue App Store

L'examinateur d'Apple n'a pas de Cambox : sans cette vidéo, il ne voit que « Caméra non connectée » et risque de
refuser l'app (règle 2.1, « App Completeness »). La vidéo doit prouver que l'app fonctionne avec une vraie caméra et
montrer chaque fonction et chaque demande d'autorisation.

## Préparation

- **Matériel** : l'iPhone avec la build TestFlight (pas une build de développement), une Cambox V3+ ou V4 chargée avec
  une carte microSD contenant quelques vidéos et photos, un second téléphone pour filmer, un trépied si possible.
- **Plan** : filmer l'iPhone et la caméra **dans le même cadre**, sans coupure. Une capture d'écran seule ne prouve pas
  qu'une vraie caméra est connectée.
- **Réinitialiser les autorisations** avant de filmer, pour que les demandes apparaissent : supprimer l'app puis la
  réinstaller depuis TestFlight.
- **iPhone** : mode Ne pas déranger, batterie chargée, luminosité au maximum, langue française.
- **Durée visée** : 3 à 4 minutes, en une seule prise.
- **Sous-titres en anglais** incrustés (les examinateurs ne parlent pas forcément français), ou voix off en anglais.
  Les textes de sous-titres sont proposés pour chaque scène.

## Script

| # | Durée | À l'écran | Action | Sous-titre (EN) |
|---|---|---|---|---|
| 1 | 0:00–0:15 | La caméra et l'iPhone posés côte à côte | Montrer la caméra (étiquette du modèle visible), allumer la caméra | *This is a Cambox helmet camera. Its maker has closed and its app is gone. Caméra Casque replaces it.* |
| 2 | 0:15–0:25 | L'app ouverte, iPhone sur un autre WiFi | Ouvrir l'app : « Caméra non connectée » s'affiche | *Without the camera, the app shows "Caméra non connectée" (camera not connected).* |
| 3 | 0:25–0:45 | Réglages iOS › WiFi | Rejoindre le réseau WiFi de la caméra (montrer son nom), revenir dans l'app | *The camera creates its own WiFi network. Join it from iOS Settings, then return to the app.* |
| 4 | 0:45–0:55 | Demande « Réseau local » | Accepter la demande d'accès au réseau local | *iOS asks for local network access: it is only used to reach the camera.* |
| 5 | 0:55–1:20 | Onglet Caméra, aperçu en direct | Bouger la caméra devant l'objectif (main, objet) pour prouver le direct | *Live preview from the camera.* |
| 6 | 1:20–1:45 | Onglet Caméra | Appuyer sur le bouton rouge, montrer le chrono et le voyant de la caméra, filmer ~10 s, arrêter | *Start and stop recording. The timer runs and the camera's own light confirms it.* |
| 7 | 1:45–1:55 | Onglet Caméra (V3+ uniquement) | Passer sur PHOTO, prendre une photo | *Take a photo (Cambox V3+).* |
| 8 | 1:55–2:15 | Onglet Galerie | Ouvrir la galerie, faire défiler ; la vidéo qui vient d'être tournée apparaît en dernier | *The gallery lists the files on the camera's microSD card, including the clip just recorded.* |
| 9 | 2:15–2:35 | Lecteur | Ouvrir la nouvelle vidéo, la lire quelques secondes, balayer vers la suivante | *Play videos straight from the camera, without copying them.* |
| 10 | 2:35–2:55 | Lecteur, puis app Photos | Bouton Enregistrer : accepter la demande « Ajouter à Photos », attendre « Enregistré dans Photos », ouvrir Photos pour montrer la vidéo | *Save to the iPhone's Photos library. iOS asks for add-only access.* |
| 11 | 2:55–3:05 | Lecteur | Bouton Partager : ouvrir la feuille de partage puis la fermer | *Share a file with any app.* |
| 12 | 3:05–3:15 | Lecteur | Bouton Supprimer : montrer la confirmation, supprimer la photo (V3+) ou la vidéo de test | *Delete a file from the microSD card, after confirmation.* |
| 13 | 3:15–3:40 | Onglet Réglages | Faire défiler : informations (modèle, batterie, firmware), changer « Résolution vidéo » | *Camera settings: information, video resolution and more. Changes apply to the camera.* |
| 14 | 3:40–3:50 | Réglages › Aide | Ouvrir l'aide, faire défiler | *Built-in help, available even without a camera.* |
| 15 | 3:50–4:00 | Caméra et iPhone | Éteindre la caméra : l'app repasse à « Caméra non connectée » | *When the camera is off, the app shows it is not connected.* |

Ne pas montrer « Formater la carte SD » ni « Réinitialiser les paramètres » : la confirmation suffit à prouver
qu'elles sont protégées, inutile de les exécuter.

## Après le tournage

1. Vérifier que le nom du réseau WiFi de la caméra, la demande « Réseau local » et la demande Photos sont lisibles.
2. Incruster les sous-titres (iMovie : Titres › Tiers inférieur, ou CapCut).
3. Exporter en 1080p et mettre en ligne en **non répertorié** (YouTube, ou un lien iCloud/Google Drive accessible
   sans connexion).
4. Remplacer `<lien>` et `<link>` dans les notes de `fiche.md` par l'URL, puis tester le lien en navigation privée.
