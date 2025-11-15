# Hack the Gap

AI-powered Zettelkasten that auto-converts students' passive content consumption into active long-term retention via concept extraction and spaced repetition.

> **🚀 HACKATHON MODE**: Ce template a été simplifié pour le hackathon. Consultez **[HACKATHON_QUICKSTART.md](./HACKATHON_QUICKSTART.md)** pour démarrer rapidement.

> **Note**: This project is built on the [NOW.TS](https://nowts.app) boilerplate template.

## 🚀 Quick Start

### Option 1: Docker (Recommandé)

Le moyen le plus rapide pour démarrer le projet :

```bash
# Setup + Build + Start tout en une commande
make quick-start

# Ou manuellement :
make setup      # Créer .env et générer les secrets
make build      # Build les images Docker
make up         # Démarrer les services
```

L'application sera disponible sur http://localhost:3000

📚 **[Guide Docker complet →](README.docker.md)**

### Option 2: Installation Locale

Si vous préférez développer sans Docker :

1. **Prérequis** : Node.js 20+, pnpm, PostgreSQL

2. **Installation** :
   ```bash
   pnpm install
   cp .env.docker.example .env.local
   # Configurer DATABASE_URL dans .env.local
   ```

3. **Database setup** :
   ```bash
   pnpm prisma generate
   pnpm prisma migrate dev
   pnpm prisma:seed  # Optionnel
   ```

4. **Démarrage** :
   ```bash
   pnpm dev
   ```

## 📋 Commandes Docker (via Makefile)

```bash
make help           # Voir toutes les commandes disponibles

# Production
make up             # Démarrer les services
make down           # Arrêter les services
make logs           # Voir les logs
make restart        # Redémarrer

# Development (avec hot reload)
make dev            # Démarrer en mode dev (port 3001)
make dev-down       # Arrêter le mode dev

# Base de données
make migrate        # Exécuter les migrations
make seed           # Seed la base de données
make studio         # Ouvrir Prisma Studio
make db-shell       # Shell PostgreSQL

# Tests
make test           # Tests unitaires
make test-e2e       # Tests E2E

# Maintenance
make clean          # Nettoyer conteneurs
make reset          # Reset complet (⚠️ perd les données)
```

## 📦 Stack Technique

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Better Auth (email/password, OAuth)
- **Styling**: TailwindCSS v4 + Shadcn/UI
- **Email**: React Email + Resend
- **Testing**: Vitest + Playwright
- **Package Manager**: pnpm

## 📚 Documentation

- **[Guide Docker](README.docker.md)** - Documentation complète Docker
- **[Guide Agent IA](AGENTS.md)** - Instructions pour Claude/Copilot
- **[Documentation Projet](documentation_starter_pack/README.md)** - Vision, architecture, ADRs
- **[NOW.TS Course](https://codeline.app/courses/clqn8pmte0001lr54itcjzl59/lessons/clqn8pz990003112iia11p7uo)** - Setup du template original

## 🛠️ Scripts de Développement

```bash
pnpm dev            # Serveur de développement (Turbopack)
pnpm build          # Build production
pnpm start          # Démarrer production
pnpm test           # Tests unitaires
pnpm test:e2e       # Tests E2E
pnpm lint           # Linter
pnpm ts             # Type checking
pnpm clean          # Lint + type check + format
```

## 🔧 Configuration Requise

Créer un fichier `.env.local` ou `.env` avec :

```bash
# Database
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."

# Auth
BETTER_AUTH_SECRET="..." # Générer avec: openssl rand -base64 32

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# Pour le projet Hack the Gap
OPENAI_API_KEY="sk-..." # Extraction de concepts
```

## 🤝 Contributions

Feel free to create a pull request with any changes you think valuable.

## 📄 License

See LICENSE.TXT for details.
