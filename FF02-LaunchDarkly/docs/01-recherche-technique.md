# A — Recherche technique (LaunchDarkly)

Consultée le 2026-11-16 dans la documentation officielle de LaunchDarkly.

## Ce que dit la documentation

| Fait | Source |
|---|---|
| Au démarrage, le SDK stocke les données des flags dans un cache **en mémoire** et les évalue à partir de ce cache (« in-memory cache that never expires »), ce qui donne un accès quasi instantané aux variations. | [LaunchDarkly architecture](https://launchdarkly.com/docs/home/getting-started/architecture) |
| Quand on modifie les règles d'un flag, la mise à jour est **poussée par l'infrastructure de streaming** vers tous les SDK connectés. Le mode « polling » existe en repli, mais il n'est pas recommandé. | idem |
| Si le SDK perd sa connexion, l'application continue d'utiliser le cache en mémoire. Si LaunchDarkly est injoignable au démarrage, ce sont les valeurs par défaut définies dans le code qui s'appliquent. | idem |
| **SDK côté serveur** : il reçoit l'ensemble des règles et évalue les flags **localement**, sans appeler LaunchDarkly à chaque évaluation. | [Client-side, server-side, and edge SDKs](https://launchdarkly.com/docs/sdk/concepts/client-side-server-side) |
| **SDK côté client** (navigateur, mobile) : il délègue l'évaluation à LaunchDarkly pour un contexte (un utilisateur) donné et reçoit les valeurs résultantes par streaming ou polling. | idem |

## Conséquences pour le schéma mental de la vidéo

1. **Le code des deux comportements est déjà dans le logiciel déployé.** LaunchDarkly n'héberge ni n'exécute le code de l'application. À l'écran, LaunchDarkly est un panneau extérieur (violet), distinct du logiciel (bleu).
2. **Le lien LaunchDarkly → application ne s'anime que lorsque la configuration change.** Un « paquet » violet n'apparaît qu'après une bascule. Aucune requête vers LaunchDarkly n'est montrée lors d'une évaluation.
3. **L'application garde la configuration en mémoire.** L'étiquette violette « En mémoire · Flag : activé/désactivé » est accrochée au logiciel, mais à l'extérieur de son cadre : elle représente la configuration, pas le code.
4. **L'évaluation a lieu dans l'application, quand le client ouvre son tableau de bord.** La requête du téléphone va vers l'application, pas vers LaunchDarkly. L'application lit la valeur en mémoire, l'aiguillage choisit le module, puis la réponse revient au téléphone.
5. **Les écrans déjà ouverts ne changent pas instantanément.** Après l'arrivée de la configuration, l'écran du client reste sur l'ancien tableau de bord jusqu'à ce qu'il ouvre de nouveau la page. C'est la « prochaine évaluation ».
6. **Le retour en arrière n'annule rien.** Seules les évaluations suivantes reprennent l'ancien chemin. Aucune animation de « rembobinage » n'est utilisée.

Le cas représenté est celui d'une application bancaire dont le tableau de bord est servi par le **serveur**, donc un SDK serveur avec évaluation locale. Pour un SDK client, c'est LaunchDarkly qui calcule la valeur, et l'application la reçoit et la garde en mémoire. Le message de la vidéo reste exact dans les deux cas : la configuration change, l'application consulte la valeur au moment de l'évaluation, et le logiciel ne change pas.

## Volontairement exclu (modules suivants)

Types de SDK, ciblage avancé, pourcentages, variations multiples, environnements et projets, valeurs de repli, cache, gouvernance et cycle de vie. Ces notions ne sont pas montrées, et rien à l'écran ne les contredit.
