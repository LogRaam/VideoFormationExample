# Parcours Feature flags — Vidéo 2 : déployer, puis activer (LaunchDarkly)

Vidéo d'introduction (1 min 43, 1080p30, français) au fonctionnement d'un feature flag avec LaunchDarkly.
Elle s'adresse à des non-développeurs (analystes, AQ, gestion de projet) d'une organisation financière.

Message central : **un logiciel inchangé + une valeur de flag qui change = un comportement différent, sans nouveau déploiement.**

## Livrables

| Fichier | Contenu |
|---|---|
| `output/FF02-FeatureFlags-LaunchDarkly.fr.mp4` | Master (H.264 yuv420p BT.709, AAC 256k, −16 LUFS / −1,7 dBTP) — *local, non versionné* |
| `output/FF02-FeatureFlags-LaunchDarkly.fr.captioned.mp4` | Même vidéo, sous-titres incrustés — *local* |
| `output/FF02-FeatureFlags-LaunchDarkly.animatique.mp4` | Animatique (blocs gris + narration, 960×540) — *local* |
| `output/FF02-FeatureFlags-LaunchDarkly.fr.srt` | Sous-titres synchronisés au mot |
| `docs/01-recherche-technique.md` | Recherche dans la documentation LaunchDarkly et conséquences pour l'animation |
| `docs/02-scenario-storyboard.md` | Charte visuelle, storyboard minuté, narration complète, notes de l'animatique |
| `docs/03-rapport-qa.md` | Contrôle qualité, limites, critères d'acceptation |

Les `*.mp4` sont exclus de Git (comme les autres vidéos du dépôt) : publiez-les dans une Release.

## Déroulé

| Temps | Séquence |
|---|---|
| 0:00 | Une nouvelle fonctionnalité : branche → fusion → le module entre dans le logiciel (version 2.0) |
| 0:15 | Déployée, mais inactive : aiguillage + flag désactivé, le client voit l'ancien tableau |
| 0:35 | La mécanique : LaunchDarkly → configuration en mémoire → évaluation à l'ouverture → nouveau tableau ; « On change la configuration, pas le logiciel » |
| 1:03 | Retour en arrière : problème → flag désactivé → prochaine évaluation → ancien tableau, même version |
| 1:14 | Synthèse : LIVRER (Développer → Fusionner → Déployer) et ACTIVER (Configurer → Évaluer → Choisir), démonstration, conclusion |

## Reconstruire

Prérequis : Python 3.11 (`pip install -r requirements.txt`), Node 20+, FFmpeg, GPU CUDA conseillé pour Whisper.
La clé `OPENROUTER_API_KEY` (et `OPENROUTER_BASE_URL`) doit être définie dans l'environnement ou dans `.env` (jamais versionné).

```bash
cd tools
python tts_build.py --takes 2 [--no-judge]   # narration (prises en cache dans build/tts_fr) + timeline + SRT
python sfx.py                                 # effets sonores synthétisés -> video/public/audio/sfx
cd ../video
npm ci
npx remotion render Main ../build/renders/final.mp4 --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=320k
npx remotion render Animatic ../output/FF02-FeatureFlags-LaunchDarkly.animatique.mp4 --scale=0.5
cd ../tools
python finalize.py ../build/renders/final.mp4 fr   # mastering R128 + version sous-titrée -> output/
```

Contrôle qualité :

```bash
python tools/qa_invariance.py                       # le logiciel est identique au pixel près (activation / retour)
python tools/qa_audio.py output/FF02-FeatureFlags-LaunchDarkly.fr.mp4
cd video && node stills.mjs ../build/stills/x 12.5 47 59.5 && cd .. && python tools/sheet.py build/stills/x
python -m unittest discover -s tests                # les maps sont à jour
```

`npx remotion studio` (dans `video/`) ouvre l'éditeur interactif.

## Architecture

- `script/narration.fr.json` : texte, consignes de voix, pauses. C'est la seule source du minutage.
- `video/src/lib/cues.ts` : tous les événements de l'histoire, ancrés sur des mots de la narration.
- `video/src/lib/story.ts` : bascules, envois de configuration et évaluations, sous forme de données. L'image, le son et le contrôle qualité les lisent.
- `video/src/scenes/Stage.tsx` : un seul monde continu filmé par une caméra (aucune coupe).
- `video/src/components/AppBox.tsx` : le logiciel. Il ne reçoit aucune propriété liée au flag, ce qui rend son invariance vraie par construction.
- `docs/maps/` : maps générées depuis le code (voir `docs/maps/README.md`).

Musique : pistes Lyria 3 Pro réutilisées de la vidéo FF01 de la série. Voix : Gemini TTS via OpenRouter, vérifiée par Whisper large-v3.
