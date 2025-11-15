# 🐳 Docker - Organisation des Fichiers

Tous les fichiers liés à Docker sont maintenant dans ce dossier `docker/` pour une meilleure organisation.

## 📂 Structure

```
docker/
├── README.md                 # Ce fichier - guide d'utilisation
├── Dockerfile                # Image production (multi-stage)
├── Dockerfile.dev            # Image développement (hot reload)
├── docker-compose.yml        # Orchestration des services
├── .dockerignore            # Fichiers exclus du build
├── docker-entrypoint.sh     # Script de démarrage
├── docker-healthcheck.sh    # Script de health check
└── env/
    ├── .env.docker.example  # Template variables production
    └── .env.dev.example     # Template variables development
```

## 🚀 Utilisation

### Depuis la racine du projet

Toutes les commandes `make` fonctionnent depuis la racine :

```bash
# Démarrage rapide
make quick-start

# Autres commandes
make up          # Démarrer
make down        # Arrêter
make logs        # Voir les logs
make dev         # Mode développement
```

### Directement avec Docker Compose

Si vous préférez utiliser `docker compose` directement :

```bash
# Depuis le dossier docker/
cd docker/
docker compose up -d

# Ou depuis la racine avec le flag -f
docker compose -f docker/docker-compose.yml up -d
```

## ⚙️ Configuration

### 1. Fichier .env

Le fichier `.env` doit être à la **racine du projet** (pas dans docker/) :

```bash
# Depuis la racine
cp .env.docker.example .env

# Éditer les variables
nano .env  # ou vim, code, etc.
```

### 2. Variables importantes

```bash
# Requis
BETTER_AUTH_SECRET=<générer avec: openssl rand -base64 32>
DATABASE_URL=postgresql://postgres:postgres@db:5432/hack_the_gap
EMAIL_FROM=noreply@votredomaine.com

# Recommandé pour votre projet
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
```

## 📝 Fichiers Docker Expliqués

### Dockerfile (Production)

Build multi-stage optimisé pour production :

```dockerfile
# 3 stages:
1. deps    → Installation des dépendances
2. builder → Build de l'application
3. runner  → Image finale minimale
```

**Avantages** :
- Image finale légère (~150MB)
- Build optimisé
- Sécurisé (user non-root)

### Dockerfile.dev (Développement)

Image simplifiée pour développement :

```dockerfile
# 1 stage simple avec volumes montés
# Hot reload automatique
```

**Avantages** :
- Rechargement automatique du code
- Pas de rebuild nécessaire
- Logs en temps réel

### docker-compose.yml

Orchestre 2 services :

```yaml
services:
  db:   # PostgreSQL 16
  app:  # Next.js application
  dev:  # Mode développement (profile optionnel)
```

**Volumes** :
- `postgres_data` : Persistance des données DB
- `.:/app` (dev uniquement) : Montage du code source

### Scripts

**docker-entrypoint.sh** :
- Attend que PostgreSQL soit prêt
- Exécute les migrations Prisma
- Lance l'application

**docker-healthcheck.sh** :
- Vérifie que l'app répond sur `/api/health`
- Utilisé par Docker pour le monitoring

## 🔧 Problèmes Courants

### Le build échoue sur "useSearchParams"

✅ **Corrigé** : Le fichier `app/auth/signin/otp/page.tsx` a été fixé avec un Suspense boundary.

### Port 3000 déjà utilisé

```bash
# Option 1 : Tuer le processus
lsof -i :3000
kill -9 <PID>

# Option 2 : Changer le port dans docker-compose.yml
ports:
  - "8080:3000"  # Utilise le port 8080 à la place
```

### Erreur "Cannot find Prisma Schema"

✅ **Corrigé** : Le Dockerfile copie maintenant `prisma.config.ts` et le dossier `prisma/`.

### Les modifications ne sont pas prises en compte

**Mode production** : Vous devez rebuild
```bash
make down
make build
make up
```

**Mode dev** : Les changements sont automatiques
```bash
make dev  # Démarre avec hot reload
```

### Reset complet

```bash
# Supprimer conteneurs + volumes + images
make reset

# Redémarrer from scratch
make quick-start
```

## 📊 Architecture Docker

```
┌─────────────────────────────────────────┐
│  Host Machine                           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Docker Network: hack_the_gap     │ │
│  │                                   │ │
│  │  ┌────────────┐   ┌────────────┐ │ │
│  │  │  App       │───│  Database  │ │ │
│  │  │  Next.js   │   │  Postgres  │ │ │
│  │  │  :3000     │   │  :5432     │ │ │
│  │  └────────────┘   └────────────┘ │ │
│  │       │                  │        │ │
│  └───────┼──────────────────┼────────┘ │
│          │                  │          │
│    Port 3000          Port 5432        │
│    (exposed)          (exposed)        │
└─────────────────────────────────────────┘
```

## 🎯 Workflow Recommandé

### Pour le développement (hackathon)

```bash
# Setup initial (une seule fois)
make setup

# Lancer en mode dev
make dev

# L'app est sur http://localhost:3001
# Les modifications sont automatiquement rechargées
```

### Pour tester en production

```bash
# Build et start
make build
make up

# Tester sur http://localhost:3000
```

### Pour déployer

```bash
# Build l'image
docker build -f docker/Dockerfile -t hack-the-gap:latest .

# Tag et push vers votre registry
docker tag hack-the-gap:latest registry.example.com/hack-the-gap:latest
docker push registry.example.com/hack-the-gap:latest
```

## 🔗 Liens Utiles

- **Makefile** : Voir toutes les commandes avec `make help`
- **Guide de démarrage rapide** : `QUICKSTART.md` (racine du projet)
- **Documentation complète** : `README.md` (racine du projet)
- **Next.js Docker** : https://github.com/vercel/next.js/tree/canary/examples/with-docker
- **Prisma Docker** : https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker

## 💡 Tips

1. **Logs en temps réel** : `make logs` pendant le développement
2. **DB Shell rapide** : `make db-shell` pour accéder à PostgreSQL
3. **Prisma Studio** : `make studio` pour gérer la DB visuellement
4. **Tests rapides** : `make test` exécute les tests dans le conteneur

## 🆘 Besoin d'Aide ?

1. Vérifier la config : `./scripts/check-docker-setup.sh`
2. Voir les logs : `make logs`
3. Reset complet : `make reset && make quick-start`
4. Lire ce README 😊
