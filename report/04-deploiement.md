# Déploiement et Perspectives

## Pipeline CI/CD

L'application est conteneurisée via **Docker** (`Dockerfile`). Le pipeline CI/CD repose sur **Coolify** (PaaS auto-hébergé) : un push sur la branche `main` déclenche automatiquement une reconstruction et un redéploiement sur le serveur. Le trafic entrant transite par un **Cloudflare Tunnel** (masquage de l'adresse IP, protection DDoS et chiffrement SSL sans exposition de port), puis par **Traefik** (reverse proxy avec gestion automatique des certificats Let's Encrypt).


```{.mermaid caption="Pipeline de déploiement continu"}
graph LR
  Dev["Développeur\ngit push main"]
  GH["GitHub"]
  Cool["Coolify\n(webhook)"]
  Docker["Docker build\n(Node 20)"]
  VPS["VPS"]
  CF["Cloudflare Tunnel\n(DDoS / SSL)"]
  Traefik["Traefik\n(Let's Encrypt)"]
  User["Utilisateur"]

  Dev --> GH --> Cool --> Docker --> VPS
  User --> CF --> Traefik --> VPS
```

## Perspectives d'évolution

Trois axes d'amélioration sont envisagés :

- l'ajout d'un **cache Redis** pour la gestion du classement et des sessions (afin de réduire la charge sur PostgreSQL)

- le **fine-tuning** du modèle sur des débats réels annotés (dans le but d'améliorer la précision de l'évaluation)

- l'implémentation de **replays commentés par l'IA** (permettant à l'utilisateur de revoir sa partie avec des annotations argumentatives générées a posteriori), qui est une grosse feature de chess.com.
