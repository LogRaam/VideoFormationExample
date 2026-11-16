# F — Rapport de contrôle qualité

Toutes les vérifications portent sur les fichiers réellement rendus (`output/*.mp4`), pas seulement sur les sources.

## Spécifications techniques (ffprobe)

| Exigence | Mesure | Statut |
|---|---|---|
| Durée ≤ 120 s (cible 90–110 s) | **102,57 s** | ✅ |
| 1920 × 1080, 16:9 | 1920 × 1080 | ✅ |
| ≥ 30 FPS | 30 FPS | ✅ |
| Vidéo H.264 | H.264 High, yuv420p, BT.709, plage limitée | ✅ |
| Audio AAC | AAC-LC, 48 kHz, stéréo, 256 kb/s | ✅ |
| Sonie | **−15,9 LUFS** intégrés, crête réelle −1,7 dBTP, LRA 4,2 LU (EBU R128, deux passes) | ✅ |
| Filigrane ou élément temporaire | aucun | ✅ |

## Invariance du logiciel déployé (critère 8)

`python tools/qa_invariance.py` produit trois images PNG sans perte en pleine résolution, recadre le logiciel (730,330 → 1190,770) et compare les pixels à l'intérieur de sa forme arrondie :

```
before activation (flag off, old dashboard)        max diff 0, pixels changed 0
after activation (flag on, new dashboard shown)    max diff 0, pixels changed 0
after roll-back (flag off, old dashboard again)    max diff 0, pixels changed 0
IDENTICAL
```

Le code garantit aussi cette invariance : le composant `AppBox` ne reçoit aucune propriété liée au flag ou à l'utilisateur. La caméra reste verrouillée de la bascule ON jusqu'à la fin du retour en arrière.

**Défaut trouvé par ce test, puis corrigé :** au moment « Seule la configuration a changé », la lueur violette de l'étiquette « En mémoire » débordait sur le haut du logiciel. Le logiciel semblait donc changer à l'instant précis où la narration affirme le contraire. La lueur a été réduite et remplacée par un contour sur l'étiquette elle-même.

Tolérance documentée : jusqu'à 2/255 sur l'anticrénelage des bords. Une passe a montré 21 pixels à ±1–2 sur un bord de carte, ce qui est invisible. La passe finale montre 0 pixel.

## Inspection visuelle

Les images extraites du MP4 (planches dans `build/qa/`, non versionnées et régénérables) ont été examinées pour chaque séquence et chaque transition critique : fusion, déploiement, apparition de LaunchDarkly, envoi de configuration, évaluation, retour en arrière, synthèse, carton final, ainsi que la version sous-titrée.

| Défaut constaté | Correction |
|---|---|
| Ouverture : le titre chevauchait le logiciel visible derrière le gros plan | Le logiciel, les voies et la plateforme n'apparaissent qu'au recul de la caméra |
| S1 trop petit, beaucoup de vide à l'écran | La caméra suit l'action : gros plan → vue d'ensemble → zone de développement → logiciel → retour à la scène |
| « Nouvelle branche » traversée par la courbe de fusion | Géométrie de la branche et position de l'étiquette revues |
| Étiquette « En mémoire · Flag : désactivé » coupée sur deux lignes | Étiquette élargie, texte non sécable |
| Légende du message central visible seulement 2,4 s, en même temps que l'apparition du problème | Visible ≈ 5 s, de « Le logiciel » jusqu'au problème |
| Synthèse décentrée, avec un grand vide à droite | Lignes centrées, scène miniature agrandie (échelle 0,6) |
| Version sous-titrée : les sous-titres chevauchaient la légende centrale et la pastille « Version 2.0 · inchangée » | Légende déplacée en haut, pastilles rapprochées du logiciel (l'étiquette PRODUCTION s'efface pendant ce temps), sous-titres un peu plus petits |
| Vidéo encodée en `yuvj420p` (plage complète héritée des images JPEG) | Master réencodé en yuv420p BT.709, plage limitée |

## Synchronisation et pauses

Chaque événement visuel est ancré sur un mot de la narration (horodatage au mot de Whisper large-v3, voir `video/src/lib/cues.ts`). Si la voix est régénérée, l'image suit. Pauses volontaires : après la fusion (1,4 s), avant « mais elle dort », avant le retour en arrière (respiration de 2,4 s), et avant la conclusion (3,8 s, pendant la démonstration finale).

## Audio

`python tools/qa_audio.py output/FF02-FeatureFlags-LaunchDarkly.fr.mp4` mesure le niveau du lit sonore (musique + effets) par rapport à la voix, sur des fenêtres de 200 ms où la voix est active :

- **Médiane : lit 17,6 dB sous la voix.**
- Fenêtre la plus proche : −2,2 dB (transitoire bref du « ping » d'arrivée).
- Trois passes de correction ont été nécessaires. Au départ, des whoosh, un impact sourd, des pops et le ping d'arrivée dépassaient la voix de jusqu'à +3,6 dB ; leurs gains ont été réduits.

Aucune prise de narration ne dérive du texte selon la vérification Whisper : un seul écart (taux d'erreur de 8 % sur f3, « garde à mémoire ») ; c'est l'autre prise, exacte, qui a été retenue.

## Limites et écarts, en toute franchise

1. **Accent québécois non vérifié par un modèle audio.** La clé OpenRouter n'avait plus que ≈ 0,26 $ de crédit (limite de 20 $ atteinte). Les modèles de jugement audio et vidéo exigent un solde d'au moins 0,50 $ et ont été refusés (HTTP 402). Conséquences :
   - La voix est celle de la vidéo précédente de la série (Gemini TTS « Algieba »), avec une consigne de style « français du Québec, accent québécois naturel ». Je n'ai pas pu confirmer par écoute automatisée que l'accent est perçu comme québécois. Gemini TTS ne propose pas de paramètre de langue fr-CA : l'accent repose uniquement sur la consigne de style.
   - Le choix entre les deux prises s'est fait sur le critère Whisper (fidélité au texte), sans le juge audio du pipeline précédent.
   - La revue créative par un modèle vidéo (`tools/review_video.py`) n'a pas pu être lancée. La revue visuelle a été faite image par image (voir ci-dessus).
   - **À faire par une personne :** écouter la narration (accent, prononciation de « LaunchDarkly » et « feature flag »). Si besoin, augmenter la limite de la clé puis relancer `python tools/tts_build.py --takes 3` (sans `--no-judge`) pour activer le juge.
2. **Musique réutilisée.** Pour la même raison, aucune nouvelle musique Lyria n'a été générée. Les pistes `explain` et `finale` proviennent de la vidéo FF01 de la même série (générées par Lyria 3 Pro pour ce parcours), ce qui assure une cohérence sonore entre les modules.
3. **Les MP4 ne sont pas versionnés** (`*.mp4` dans `.gitignore` : fichiers trop lourds pour Git, publiés en Release comme les autres vidéos). Ils se trouvent dans `output/` en local et se reconstruisent avec les commandes du README.
4. Le tableau de bord représenté est servi par le serveur (SDK serveur, évaluation locale). Le cas d'un SDK client n'est pas montré ; voir `01-recherche-technique.md`.

## Critères d'acceptation

| # | Critère | Statut |
|---|---|---|
| 1 | ≤ 120 s | ✅ 102,6 s |
| 2 | Aucun code source | ✅ |
| 3 | Compréhensible par des non-développeurs | ✅ vocabulaire courant, une seule histoire, trois colonnes nommées |
| 4 | Fusion et déploiement avant l'activation | ✅ S1 → S2 → S3 |
| 5 | Fonctionnalité déployée qui reste désactivée | ✅ S2 (« elle dort ») |
| 6 | LaunchDarkly visuellement distinct de l'application | ✅ panneau violet à gauche, logiciel bleu au centre |
| 7 | Configuration mise à jour puis évaluée avant le changement | ✅ paquet → mémoire → (écran inchangé) → ouverture → évaluation → affichage |
| 8 | Logiciel inchangé à l'activation et à la désactivation | ✅ prouvé au pixel près |
| 9 | Changement sans redéploiement sans ambiguïté | ✅ « Version 2.0 · inchangée », « Même version · aucun redéploiement » |
| 10 | Différence entre déployer et activer | ✅ lignes LIVRER et ACTIVER, carton final |
| 11 | Narration naturelle, événements synchronisés | ✅ synchronisation au mot ; ⚠️ accent québécois à confirmer à l'écoute (limite 1) |
| 12 | Direction artistique continue | ✅ une seule caméra, aucune coupe, couleurs à sens constant |
| 13 | Rendu réel inspecté, défauts critiques corrigés | ✅ voir ci-dessus |
| 14 | MP4 et livrables existants et fonctionnels | ✅ |
