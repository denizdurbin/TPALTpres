# Fonctionnalités Clés

## Matchmaking et ELO

En mode casual, le matchmaking est réalisé selon une politique FIFO. En mode classé, la fenêtre ELO démarre à ±150 et s'élargit de ±50 toutes les 10 secondes (maximum ±500), afin d'éviter la famine de matchs aux extrémités du classement. Le calcul ELO suit la formule standard des échecs (K = 32, plancher = 100) : battre un adversaire mieux classé rapporte davantage de points.

La file d'attente est géré par le serveur websocket (`server.ts`) et la formule de calcule de l'élo peut être trouvé dans le fichier `src/lib/eli.ts`.

```{.mermaid caption="Déroulement d'une partie"}
sequenceDiagram
  participant J as Joueur
  participant S as Serveur WS
  participant AI as Groq API

  J->>S: queue (mode, locale)
  S->>J: matched (debateId)
  loop 12 tours
    J->>S: message
    S->>J: new_message (broadcast immédiat)
    S->>AI: évaluation live
    AI-->>S: move_quality, events[], score_delta
    S->>J: score_update
  end
  S->>AI: analyse post-débat
  AI-->>S: scores, sophismes, biais
  S->>J: debate_ended + analysis
```

## Intelligence Artificielle

Cinq prompts spécialisés couvrent l'ensemble du cycle de vie d'un débat :

| Prompt | Déclenchement | Température |
|---|---|---|
| Évaluation live | Chaque message | 0,1 |
| Adversaire IA | Tour IA (entraînement) | 0,9 / 0,7 / 0,4 |
| Analyse post-débat | Fin de partie | 0,3 |
| Indice | Bouton « Indice » | 0,5 |
| Fact-check | À la demande | 0,2 |

L'évaluation en temps réel détecte huit types d'événements (claim, evidence, counter_argument, sophism, ad_hominem, etc.) et calcule un delta de score par message. La règle critique *wrong_side* pénalise tout argument défendant la position adverse, quelle que soit sa qualité rhétorique.

L'analyse post-partie identifie les sophismes classiques (ad hominem, homme de paille, pente glissante, fausse dichotomie, etc.) avec citations exactes, et produit cinq scores individuels : qualité des arguments, style rhétorique, cohérence logique, fact-checking et score global.

L'adversaire IA propose trois niveaux de difficulté calibrés par température et par instructions système : facile (température 0,9, arguments informels et hors-sujet), moyen (température 0,7, thèse accompagnée de sa justification), difficile (température 0,4, contre-argument direct, structuré et sans répétition).

Les promptes peuvent être retrouvé dans le fichier `src/lib/prompts.ts`.

## Anti-triche et succès

En mode classé, l'API Visibility du navigateur détecte les changements d'onglet, à partir de 3 infractions, une pénalité de 30 points ELO est appliquée. Le code est implémenté dans `src/app/(app)/debate/[id]/hooks/useAntiCheat.ts`

La plateforme propose 24 succès répartis en 6 catégories (Jalons, Victoires, Séries, Qualité, Progression, Ultime). On peut les retrouver dans le fichier `src/lib/achievements.ts`.
