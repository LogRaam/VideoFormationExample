# Mandat de production — Vidéo d’introduction aux Feature Flags avec LaunchDarkly

## 1. Mission

Tu agis comme une équipe autonome de production audiovisuelle professionnelle réunissant les compétences de concepteur pédagogique, scénariste, directeur artistique, expert LaunchDarkly, développeur d’animations, ingénieur du son et responsable du contrôle qualité.

**Produis une vidéo animée, narrée et sonorisée d’une durée maximale absolue de 2 minutes.**

**Sujet :** Comprendre intuitivement le fonctionnement d’un indicateur de fonctionnalité (*Feature Flag*) dans une application informatique, avec LaunchDarkly comme plateforme de gestion.

Cette vidéo constitue la première étape d’un parcours de formation plus complet. Son objectif n’est pas de transmettre toutes les connaissances sur les Feature Flags, mais de créer **le bon schéma mental** chez l’apprenant avant les formations détaillées.

La priorité absolue est la clarté conceptuelle, sans sacrifier la qualité audiovisuelle.

## 2. Public cible

La vidéo s’adresse à des employés d’une organisation financière qui ne possèdent pas nécessairement de connaissances en développement logiciel : analystes d’affaires, conseillers en assurance qualité, gestionnaires de projet et autres intervenants non développeurs, mais qui a un service Information en soutient avec des équipes de développement professionnels.

Règles impératives :

- Aucun code source à l’écran.
- Aucun prérequis technique.
- Très peu de texte affiché.
- SI explication sur la programmation des flags, ça doit être compris par les gens n'ayant pas de connaissances techniques.
- Une seule histoire visuelle, du début à la fin.
- Des animations illustrant les relations de cause à effet.
- Une narration naturelle en français professionnel.

## 3. Schéma mental à transmettre

**Une fonctionnalité peut être développée, fusionnée et déployée dans une application sans être immédiatement activée. LaunchDarkly permet ensuite de contrôler son activation en modifiant une configuration, sans nécessiter un nouveau déploiement du logiciel.**

L’apprenant doit distinguer trois éléments :

1. **Le logiciel :** il contient déjà les comportements possibles.
2. **LaunchDarkly :** il gère la configuration et les règles déterminant quelle valeur l’application obtient lors de l’évaluation de l’indicateur.
2.5. Deux rôles se partagent la responsabilité: le technicien qui met en place les flags, le responsable  (infra, affaires, etc) #qui pilote les flags.
3. **L’utilisateur :** il voit le comportement résultant du choix fait par l’application.

Le logiciel ne change pas lorsque la configuration de l’indicateur change. **C’est le message central.**

## 4. Concept visuel

Utiliser un exemple unique : une application bancaire possède un ancien tableau de bord; une équipe développe un nouveau tableau de bord.

Les deux expériences doivent être suffisamment distinctes pour être reconnues immédiatement.

Composer la démonstration centrale avec trois éléments visibles simultanément :

- **À gauche — LaunchDarkly :** panneau de contrôle externe avec indicateur activé ou désactivé.
- **Au centre — Application :** logiciel contenant les deux comportements possibles.
- **À droite — Utilisateur :** écran présentant le comportement effectivement utilisé.

Une liaison illustre la mise à jour de configuration disponible pour l’application; une autre montre le résultat visible par l’utilisateur.

Ne jamais représenter LaunchDarkly comme l’endroit où le code applicatif est hébergé ou exécuté.

## 5. Déroulement narratif

**Durée cible : 90 à 110 secondes. Limite absolue : 120 secondes, génériques inclus.**

### Séquence 1 — Une nouvelle fonctionnalité (0–15 s)

Montrer l’application bancaire avec son tableau de bord actuel. Une équipe développe un nouveau tableau de bord. Une branche de développement rejoint la branche principale. Le nouveau comportement est maintenant intégré au logiciel.

**Message :** la nouvelle fonctionnalité fait partie de l’application.

### Séquence 2 — Déployée, mais inactive (15–35 s)

Montrer la nouvelle version de l’application déployée en production. Elle contient l’ancien et le nouveau tableau de bord. Le Feature Flag associé au nouveau tableau de bord est désactivé. L’utilisateur voit toujours l’ancien tableau de bord.

**Message :** une fonctionnalité peut être présente dans un logiciel sans être utilisée.

### Séquence 3 — La mécanique du Feature Flag (35–65 s)

Présenter simultanément LaunchDarkly, l’application et l’utilisateur. L’indicateur est désactivé; l’application l’évalue et affiche l’ancien tableau de bord. L’indicateur est ensuite activé dans LaunchDarkly. Animer la mise à jour de la configuration accessible à l’application. Lors d’une nouvelle évaluation, elle affiche le nouveau tableau de bord.

**Le logiciel déployé doit rester visuellement identique pendant toute la séquence.**

**Message : « On change la configuration, pas le logiciel. »**

Cette séquence est le cœur pédagogique. Ne pas suggérer qu’une requête réseau à LaunchDarkly est nécessaire à chaque évaluation ni que toutes les interfaces déjà ouvertes se modifient instantanément.

### Séquence 4 — Revenir en arrière (65–85 s)

Un problème est découvert dans le nouveau tableau de bord. Le responsable désactive l’indicateur dans LaunchDarkly. À la prochaine évaluation applicable, l’application présente de nouveau l’ancien tableau de bord. Aucun redéploiement n’a lieu.

**Message :** le comportement peut être contrôlé sans remplacer la version du logiciel.

Ne pas suggérer que la désactivation annule les opérations ou les effets déjà produits.

### Séquence 5 — Modèle mental final (85–105 s)

Afficher une synthèse animée :

**Développer → Fusionner → Déployer**

Puis, sur une ligne distincte :

**Configurer dans LaunchDarkly → Évaluer → Choisir le comportement**

Faire une dernière démonstration rapide avec le même logiciel et deux comportements différents selon la valeur du flag.

Conclure : **« Le déploiement met la fonctionnalité dans l’application. Le Feature Flag permet de contrôler son activation. »**

La conclusion doit être simple, mémorable et visuellement forte.

## 6. Contenu à exclure

Ne pas détailler :

- La configuration complète de LaunchDarkly.
- Les types de SDK.
- Les règles avancées de ciblage et les pourcentages de déploiement.
- Les variations multiples.
- Les environnements et projets LaunchDarkly.
- La création technique des flags.
- Les valeurs de repli et les caches.
- La gouvernance, les tests, la sécurité et la gestion du cycle de vie.

Ces notions appartiennent aux modules suivants. Les évoquer seulement si cela évite une représentation techniquement fausse.

**Ne pas confondre exactitude technique et exhaustivité.**

## 7. Exactitude technique

Consulter la documentation officielle actuelle de LaunchDarkly avant de finaliser le scénario. La vidéo doit respecter les principes suivants :

- Le code de la fonctionnalité est déjà présent dans le logiciel déployé.
- LaunchDarkly gère les configurations et règles des indicateurs.
- L’application utilise son intégration/SDK pour évaluer l’indicateur.
- La valeur évaluée guide le choix du comportement prévu par le code.
- Une nouvelle configuration peut modifier ce comportement sans nouveau déploiement.
- La nouvelle configuration doit être prise en compte et l’indicateur réévalué pour que le comportement change.

La narration peut simplifier ces détails, mais l’animation doit rester fidèle au mécanisme réel.

## 8. Direction artistique et continuité cinématographique

Produire un *motion design* professionnel, comparable aux meilleures vidéos explicatives de produits technologiques haut de gamme.

Avant de créer les animations, définir une charte visuelle cohérente : palette, typographie, formes, iconographie, profondeur, contrastes, ombres et grammaire de mouvement.

**Concevoir une histoire visuelle continue, et non une suite de diapositives.** Les objets doivent se transformer et se réorganiser d’une séquence à l’autre : la branche fusionne avec la version logicielle, le logiciel est déployé, puis la mise en scène révèle LaunchDarkly et le comportement utilisateur.

Exigences :

- Illustrations vectorielles nettes et soignées.
- Transitions motivées par la narration.
- Animation fluide avec accélérations/décélérations naturelles.
- Mouvements de caméra subtils et utiles.
- Masques, morphing, parallaxe ou profondeur simulée lorsque pertinents.
- Hiérarchie visuelle claire et composition aérée.
- Couleurs constantes pour distinguer logiciel, configuration et comportement.
- Le mouvement guide l’attention vers un seul concept important à la fois.
- Chaque information essentielle reste affichée assez longtemps pour être assimilée.

Éviter les apparitions abruptes, animations linéaires mécaniques, flèches décoratives, interfaces illisibles, mouvements excessifs et effets gratuits.

**Critère :** la vidéo ne doit pas ressembler à une présentation PowerPoint, un prototype de programmation ou une juxtaposition de schémas animés.

## 9. Narration et conception sonore

La narration doit être en **français québécois naturel et professionnel**, expressive, calme et intelligible.

Viser environ **190 à 230 mots**, puis ajuster au débit réel, aux pauses et à la durée totale. La voix explique ce que les images démontrent : éviter la redondance verbale.

Utiliser un service TTS de haute qualité réellement accessible, en vérifiant la prise en charge du français québécois.

Variables disponibles dans `.env` :

- `OPENROUTER_API_KEY`
- `OPENROUTER_BASE_URL`

Ne jamais afficher, consigner ou livrer ces secrets.

Prévoir des pauses intentionnelles, une normalisation sonore adaptée, des effets subtils pour les changements d’état et une musique discrète seulement si elle sert le propos. La narration doit rester toujours au premier plan sonore.

## 10. Environnement et production

Le projet est déjà configuré en Python. Tu peux utiliser Python, JavaScript, TypeScript, SVG, Canvas, Remotion, FFmpeg ou toute autre technologie pertinente.

L’animation doit être **programmée, reproductible et pilotée par une ligne du temps déterministe**. Utiliser les modèles OpenRouter et ressources Internet disponibles lorsque leur qualité, leur licence et leurs capacités le justifient.

Tu es responsable de l’intégralité de la production, du scénario au fichier MP4 final.

## 11. Processus obligatoire

### A — Recherche technique

Vérifier la documentation officielle de LaunchDarkly et les contraintes techniques qui affectent l’exactitude du schéma mental.

### B — Scénario et storyboard

Rédiger une narration concise et détailler chaque séquence : durée, éléments visuels, transformations, transitions, sons et message pédagogique.

### C — Animatique

**Créer et examiner un animatique synchronisé avec la narration avant les animations définitives.** Valider le rythme, les pauses, la lisibilité et le minutage. Corriger tout dépassement de durée.

### D — Assets et production

Créer les illustrations, les interfaces fictives, la narration et les effets sonores en conservant la cohérence visuelle définie.

### E — Animation et rendu

Programmer les animations et synchroniser précisément les événements visuels et sonores. Exporter une première vidéo intégrale.

### F — Contrôle qualité et itération

**Inspecter le rendu réel**, et non seulement les sources :

1. Extraire des images représentatives de chaque séquence.
2. Vérifier les transitions critiques et les changements d’état.
3. Détecter textes coupés, superpositions, débordements et défauts de composition.
4. Confirmer que la version logicielle reste identique lors du changement de flag.
5. Vérifier la synchronisation narration/animation et les pauses pédagogiques.
6. Contrôler les pistes audio, le niveau sonore, les silences et la qualité d’encodage.
7. Corriger les défauts et refaire le rendu.

Une exécution sans erreur du script **ne constitue pas** une validation audiovisuelle.

## 12. Livrables

### Principal

- Vidéo MP4 finale.
- Durée cible : 90–110 secondes; **maximum absolu : 120 secondes**.
- Résolution : 1920 × 1080, format 16:9.
- Fréquence : 30 FPS ou plus.
- Vidéo H.264, audio AAC.
- Narration en français québécois.
- Aucun filigrane ou élément temporaire.

### Complémentaires

- Scénario final et narration en Markdown.
- Storyboard et animatique.
- Sources complètes de l’animation.
- Ressources graphiques et sonores requises pour reproduire le résultat.
- Sous-titres synchronisés au format SRT.
- README avec commandes de génération et rendu.
- Bref rapport de contrôle qualité et limites éventuelles.

## 13. Critères d’acceptation

Le projet est terminé seulement si :

1. La vidéo ne dépasse pas 120 secondes.
2. Aucun code source n’apparaît.
3. Un public non développeur peut comprendre la mécanique.
4. La fusion et le déploiement précèdent l’activation.
5. La fonctionnalité déployée peut rester désactivée.
6. LaunchDarkly et l’application sont visuellement distincts.
7. La configuration est mise à jour puis évaluée avant le changement de comportement.
8. **Le logiciel déployé demeure inchangé pendant l’activation et la désactivation.**
9. Le changement de comportement sans redéploiement est sans ambiguïté.
10. La vidéo explique intuitivement la différence entre déployer et activer.
11. La narration est naturelle et les événements sont synchronisés.
12. L’animation présente une direction artistique continue et une finition professionnelle.
13. La vidéo a été réellement rendue et inspectée; les défauts critiques ont été corrigés.
14. Le MP4 et tous les livrables annoncés existent et sont fonctionnels.

## 14. Instruction finale

Réalise la production audiovisuelle de bout en bout, de manière autonome. Ne cherche pas à enseigner toute la technologie des Feature Flags; construis **un seul modèle mental exact et durable**.

Le moment pédagogique central doit montrer :

**Un logiciel inchangé + une valeur de Feature Flag qui change = un comportement différent, sans nouveau déploiement.**

Privilégie une démonstration visuelle mémorable, l’exactitude technique et une finition de studio professionnel. Si un service est inaccessible, cherche une alternative adaptée et documente honnêtement toute limite.

**Ne déclare pas le projet terminé avant d’avoir vérifié le MP4 final et ses livrables.**
