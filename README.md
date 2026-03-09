# MCP DataGouv Explorer 🇫🇷

Chatbot IA pour explorer les **données ouvertes françaises** via le protocole MCP et [data.gouv.fr](https://www.data.gouv.fr).

Propulsé par **Mistral AI** et le [serveur MCP officiel de data.gouv.fr](https://github.com/datagouv/datagouv-mcp).

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![MCP](https://img.shields.io/badge/MCP-Protocol-blue) ![Mistral](https://img.shields.io/badge/Mistral-AI-orange)

## Fonctionnalités

- **Recherche intelligente** de jeux de données sur data.gouv.fr
- **Exploration** des métadonnées, ressources et APIs publiques
- **Interrogation** directe des données tabulaires (CSV, Excel)
- **Statistiques** de fréquentation des datasets
- Design **dark mode** avec accents tricolores
- Rate limiting intégré (5/session, 50/jour)

## Architecture

```
Utilisateur → Next.js Frontend → API Route → Mistral AI (function calling)
                                                    ↕
                                              MCP Client SDK
                                                    ↕
                                      mcp.data.gouv.fr (Streamable HTTP)
                                                    ↕
                                            data.gouv.fr API
```

## Installation locale

```bash
git clone https://github.com/alexishessler/MCPdatagouv.git
cd MCPdatagouv
npm install
cp .env.example .env.local
# Éditez .env.local avec votre clé API Mistral
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Déploiement Docker

```bash
cp .env.example .env
# Éditez .env avec votre clé API Mistral
docker compose up -d
```

## Configuration

| Variable | Description | Défaut |
|----------|-------------|--------|
| `MISTRAL_API_KEY` | Clé API Mistral (requis) | — |
| `MISTRAL_MODEL` | Modèle Mistral | `mistral-small-latest` |
| `MCP_SERVER_URL` | URL du serveur MCP | `https://mcp.data.gouv.fr/mcp` |
| `RATE_LIMIT_PER_SESSION` | Requêtes max par session | `5` |
| `RATE_LIMIT_DAILY` | Requêtes max par jour | `50` |

## Hébergement français

Ce projet est conçu pour être hébergé en France :
- **Scaleway** — Serverless Containers (free tier)
- **Clever Cloud** — PaaS Node.js (Nantes)
- **OVH** — VPS avec Docker

## Licence

MIT — Créé par [Alexis Hessler](https://github.com/alexishessler)
