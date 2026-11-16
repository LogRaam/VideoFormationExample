# B — Scénario final, narration et storyboard

**Durée totale : 1 min 42,5 s.** Narration de 195 mots en français (voix Gemini TTS « Algieba »). Le dernier carton reste à l'écran 2,4 s.

Source de vérité : `script/narration.fr.json` (texte, pauses) et `video/src/lib/cues.ts` (événements visuels ancrés sur les mots). Les temps ci-dessous sont ceux du rendu final.

## Charte visuelle

| Élément | Choix |
|---|---|
| Couleurs à sens constant | **Logiciel** (code, versions, déploiement) = bleu `#4FB3FF` · **Configuration** (LaunchDarkly, valeur du flag) = violet `#A78BFA` · **Comportement** (ce que voit le client, chemin choisi) = sarcelle `#2EE6C5` · **Problème** = corail `#FF5C7A` |
| Fond | Marine profond `#060B18`, halos lents (un par couleur d'idée), trame de points, grain, vignettage |
| Typographie | Space Grotesk (titres), Inter (texte) |
| Formes | Panneaux arrondis opaques (rayon 26), pilules, avatars plats, icônes vectorielles dessinées pour le film (aucun logo de marque) |
| Deux comportements | Ancien tableau : pâle, liste textuelle. Nouveau : sombre, carte de solde en dégradé, graphique, raccourcis colorés |
| Mouvement | Courbes de Bézier « out » et « in-out », ressorts légers pour les apparitions. Une seule caméra continue, sans aucune coupe. Caméra **verrouillée** de la bascule ON jusqu'à la fin du retour en arrière |
| Son | Effets synthétisés en Python (une famille cohérente), musique Lyria réutilisée de la série et atténuée sous la voix |

## Séquences

### S1 — Une nouvelle fonctionnalité (0:00–0:15)

| Temps | Narration | Image | Son |
|---|---|---|---|
| 0:00 | — | Gros plan du téléphone : ancien tableau de bord. Titre « Parcours feature flags · Déployer, puis activer » | Musique |
| 0:01.6 | « Voici l'application de votre banque et son tableau de bord. » | La caméra recule : le logiciel version 1.0 sur la plateforme PRODUCTION alimente le téléphone (voie sarcelle) | souffle grave |
| 0:05.3 | « Une équipe en développe un nouveau. Une fois prêt, sa branche est fusionnée dans la branche principale. » | La caméra glisse vers la gauche. Branche principale (bleue), trois développeurs ; une branche part, le module « Nouveau tableau de bord » se construit dessus, puis la branche rejoint la principale | pop, scintillement, souffle |
| 0:12.4 | « Le voilà dans le logiciel. » | Le module glisse dans le logiciel, qui passe en version 2.0 (lueur) | carillon |

**Message :** la nouvelle fonctionnalité fait partie de l'application.

### S2 — Déployée, mais inactive (0:15–0:35)

| Temps | Narration | Image | Son |
|---|---|---|---|
| 0:15.6 | « Au passage, les développeurs l'ont relié à un feature flag, un indicateur de fonctionnalité. » | La caméra se rapproche du logiciel ; l'aiguillage (drapeau) apparaît devant les deux modules, puis l'étiquette violette « En mémoire · Flag : désactivé » | pop aigu, tic |
| 0:22.3 | « La nouvelle version est déployée en production, avec les deux tableaux de bord. » | Le logiciel 2.0 décrit un arc jusqu'à la plateforme PRODUCTION et remplace la version 1.0, qui s'efface ; les deux modules s'allument | souffle, impact sourd |
| 0:27.0 | « Mais le flag est désactivé : les clients voient toujours l'ancien. » | Léger rapprochement ; la pilule « désactivé » pulse ; la voie sarcelle part du module actuel vers le téléphone | tic |
| 0:31.1 | « La fonctionnalité est là… mais elle dort. » | Le module « Nouveau tableau de bord » s'assombrit (lune, « z z ») | scintillement doux |

**Message :** une fonctionnalité peut être présente dans un logiciel sans être utilisée.

### S3 — La mécanique du feature flag (0:35–1:03)

| Temps | Narration | Image | Son |
|---|---|---|---|
| 0:35.2 | « Ce flag se pilote à l'extérieur de l'application, dans LaunchDarkly. » | La caméra recule et LaunchDarkly glisse à gauche. Trois colonnes : CONFIGURATION · LOGICIEL DÉPLOYÉ · CE QUE VOIT LE CLIENT. Un lien pointillé violet relie LaunchDarkly à l'étiquette mémoire | souffle grave |
| 0:40.1 | « La personne responsable du produit l'active. » | L'avatar « Responsable du produit » apparaît ; le curseur clique sur l'interrupteur, qui passe à « Activé » | clic d'interrupteur |
| 0:43.6 | « LaunchDarkly transmet la nouvelle configuration à l'application, qui la garde en mémoire. » | Un paquet violet voyage sur le lien ; l'étiquette devient « Flag : activé ». **Le téléphone, déjà ouvert, ne change pas** | envoi, ping |
| 0:49.8 | « Quand un client ouvre son tableau de bord, l'application évalue le flag : activé. Elle affiche le nouveau. » | Toucher sur le téléphone, chargement, requête vers l'application (pas vers LaunchDarkly). L'étiquette mémoire pulse (l'application lit la valeur qu'elle détient), un chevron sarcelle s'allume **à l'extérieur** du logiciel, sur la sortie du nouveau module, la réponse suit la voie basse et le nouveau tableau glisse à l'écran | tic, souffle rapide |
| 0:57.1 | « Le logiciel n'a pas changé. Seule la configuration a changé. » | Crochets autour du logiciel, pastille « Version 2.0 · inchangée » ; l'interrupteur, le lien et l'étiquette s'illuminent en violet. Légende en haut : « On change la configuration, pas le logiciel. » | carillon discret |

**Message :** on change la configuration, pas le logiciel. Aucun élément n'est dessiné sur le logiciel pendant S3 et S4 : tous les repères (paquet, mémoire, évaluation, réponse) restent à l'extérieur de son cadre. Il reste identique au pixel près de la bascule jusqu'à la fin du retour en arrière (voir le rapport QA).

### S4 — Revenir en arrière (1:03–1:14)

| Temps | Narration | Image | Son |
|---|---|---|---|
| 1:03.0 | — | Bandeau corail « Solde erroné ! » sur le nouveau tableau, halo corail autour du téléphone | alerte |
| 1:03.8 | « Un problème ? On désactive le flag. » | Le curseur désactive l'interrupteur ; le paquet voyage ; l'étiquette repasse à « désactivé ». L'écran ouvert ne change pas encore | clic, envoi, ping |
| 1:07.5 | « À la prochaine évaluation, l'application revient à l'ancien tableau de bord. Même version, aucun redéploiement. » | Nouvelle ouverture : l'étiquette pulse, le chevron s'allume sur la sortie du module actuel, l'ancien tableau revient. Pastille « Même version · aucun redéploiement » | tic, souffle, carillon discret |

**Message :** le comportement se contrôle sans remplacer la version du logiciel. Rien n'est « annulé » : seules les évaluations suivantes changent.

### S5 — Modèle mental final (1:14–1:42)

| Temps | Narration | Image | Son |
|---|---|---|---|
| 1:14.2 | — | La scène rétrécit vers le bas et s'atténue. Titre « DEUX ÉTAPES DISTINCTES » | souffle grave, musique finale |
| 1:15.2 | « Retenez deux étapes. Développer, fusionner, déployer : la fonctionnalité entre dans l'application. » | Ligne LIVRER (bleue) : Développer → Fusionner → Déployer, une pilule par mot | pops |
| 1:23.2 | « Configurer dans LaunchDarkly, évaluer, choisir le comportement : on décide quand elle s'active. » | Ligne ACTIVER : Configurer dans LaunchDarkly (violet) → Évaluer → Choisir le comportement (sarcelle) | pops |
| 1:29.5 | — | Démonstration rapide sur la même scène miniature : ON → nouveau tableau, OFF → ancien, avec le même logiciel | clics, envois |
| 1:33.2 | « Le déploiement met la fonctionnalité dans l'application. Le feature flag permet de contrôler son activation. » | Carton final : deux grandes lignes avec icônes (logiciel bleu, drapeau violet), « contrôler son activation » souligné | scintillement |
| 1:41.3 | — | Fondu au noir | |

## Narration complète

> Voici l'application de votre banque et son tableau de bord. Une équipe en développe un nouveau. Une fois prêt, sa branche est fusionnée dans la branche principale. Le voilà dans le logiciel.
>
> Au passage, les développeurs l'ont relié à un feature flag, un indicateur de fonctionnalité. La nouvelle version est déployée en production, avec les deux tableaux de bord. Mais le flag est désactivé : les clients voient toujours l'ancien. La fonctionnalité est là… mais elle dort.
>
> Ce flag se pilote à l'extérieur de l'application, dans LaunchDarkly. La personne responsable du produit l'active. LaunchDarkly transmet la nouvelle configuration à l'application, qui la garde en mémoire. Quand un client ouvre son tableau de bord, l'application évalue le flag : activé. Elle affiche le nouveau. Le logiciel n'a pas changé. Seule la configuration a changé.
>
> Un problème ? On désactive le flag. À la prochaine évaluation, l'application revient à l'ancien tableau de bord. Même version, aucun redéploiement.
>
> Retenez deux étapes. Développer, fusionner, déployer : la fonctionnalité entre dans l'application. Configurer dans LaunchDarkly, évaluer, choisir le comportement : on décide quand elle s'active. Le déploiement met la fonctionnalité dans l'application. Le feature flag permet de contrôler son activation.

## Les deux rôles

- **Développeurs** (bleu, couleur du logiciel) : ils construisent le module et le relient au flag (l'aiguillage).
- **Responsable du produit** (violet, couleur de la configuration) : cette personne pilote l'interrupteur dans LaunchDarkly.

## Animatique (étape C)

`output/FF02-FeatureFlags-LaunchDarkly.animatique.mp4` (960×540) contient des blocs gris pilotés par la même table de repères, sur la vraie narration. Son examen a conduit à deux corrections :

- Le message central n'avait que 0,2 s de respiration avant l'apparition du problème. L'entrée de S4 a été allongée (+1,1 s).
- La démonstration finale ne disposait que de 2,5 s. La pause avant la conclusion a été allongée (+1,2 s).

Durée : 100,2 s → 102,5 s.
