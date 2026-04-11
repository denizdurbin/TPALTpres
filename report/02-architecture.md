# Architecture Technique

## Stack

Le projet repose sur **Next.js 15** (App Router, SSR, API Routes) pour le frontend et les endpoints REST, ainsi que sur un **serveur WebSocket personnalisé** (`server.ts`). La base de données est gérée par **Prisma**, avec SQLite en environnement de développement et PostgreSQL en production. L'inférence par intelligence artificielle s'appuie sur l'**API Groq** (Llama 3.3 70B). L'ensemble du projet est typé en **TypeScript 5** strict, avec TailwindCSS 4 et TanStack Query 5 côté client.

Le choix d'un serveur WebSocket développé en interne, plutôt que Socket.io, résulte de l'incompatibilité de Next.js avec les connexions longue durée mais aussi le besoin d'avoir une gestion du matchmaking qui soit rapide et réactive.

```{.mermaid caption="Vue d'ensemble de l'architecture"}
graph LR
  B["Navigateur"]
  N["Next.js 15 (SSR / REST)"]
  W["server.ts (WebSocket)"]
  DB[("PostgreSQL")]
  G["Groq API Llama 3.3 70B"]

  B -->|"REST / SSR"| N
  B -->|"WebSocket"| W
  N --> DB
  W --> DB
  N --> G
  W --> G
```

## Modèle de données

Le schéma de la base de donnée peut être retrouvé `prisma/schema.prisma`. Et un schéma de la db peut être retrouvé sur la figure 2.

```{.mermaid caption="schéma de base de donnée"}
erDiagram
    User ||--o{ Debate : plays
    Debate ||--o{ Message : contains
    Debate ||--o| Analysis : has
    User ||--o{ UserAchievement : unlocks
```


## WebSocket et cohérence

Le serveur websocket (`server.ts`) maintient en mémoire les salles actives et les files d'attente par mode de jeu. Afin de minimiser la latence perçue, les messages sont diffusés aux deux joueurs *avant* l'écriture en base de données. Un mécanisme de détection de connexions inactives par échange ping/pong toutes les 15 secondes permet de libérer les connexions zombies.
