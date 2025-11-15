# Correctifs Appliqués au Template

## Problèmes Résolus

### 1. ❌ Erreur Prisma : Enum non supporté par SQLite
**Erreur:** `Error code: P1012 - The current connector does not support enums`

**Solution:**
- Remplacé `enum Role { USER, ADMIN }` par `role String @default("USER")`
- Ajouté la relation `sessions Session[]` manquante dans le modèle User

**Fichier:** `prisma/schema.prisma`

---

### 2. ❌ Bug API /users/me - Token non vérifié
**Erreur:** ID utilisateur hardcodé `'user-id-from-token'`

**Solution:**
- Implémenté la vérification JWT correcte avec `verifyToken(token)`
- Extraction de l'ID utilisateur depuis le token décodé

**Fichier:** `pages/api/users/me.ts`

---

### 3. ❌ Docker build indéfiniment bloqué
**Problème:** 
- Copie de 113 MB de node_modules à chaque build
- Étape "exporting to image" prenant 100+ secondes

**Solutions appliquées:**

#### A. Optimisation Dockerfile
- ✅ Installation d'OpenSSL pour Prisma (`apk add --no-cache openssl`)
- ✅ Ordre optimisé des COPY pour meilleur caching
- ✅ Génération Prisma avant la copie du code source

#### B. Amélioration .dockerignore
Ajouté exclusions:
```
node_modules
.next
.git
.env
*.log
prisma/dev.db
prisma/dev.db-journal
```

#### C. Optimisation docker-compose.yml
- ✅ Retrait de `version: '3.8'` (obsolète)
- ✅ Ajout volume `/app/.next` pour cache Next.js
- ✅ Commande combinée: `npx prisma db push && npm run dev`
- ✅ Variables d'environnement sans guillemets inutiles

**Résultat:** Build passe de "indéfini" à ~3-5 minutes

**Fichiers:** `Dockerfile`, `.dockerignore`, `docker-compose.yml`

---

### 4. ❌ Configuration Next.js incompatible
**Erreur:** `appDir: true` activé alors que le projet utilise Pages Router

**Solution:**
- Retiré `experimental.appDir`
- Ajouté `reactStrictMode: true`

**Fichier:** `next.config.js`

---

### 5. ⚠️ Sécurité & Validation manquantes

**Améliorations:**

#### A. Validation des inputs
```typescript
// lib/auth.ts
export function isValidEmail(email: string): boolean
export function isValidPassword(password: string): boolean
```

#### B. Validation côté serveur
- ✅ Vérification format email dans `/api/auth/login` et `/api/auth/register`
- ✅ Vérification longueur mot de passe (min 8 caractères)

#### C. Pattern Singleton Prisma
```typescript
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
```
Évite les problèmes de connexions multiples en développement.

**Fichiers:** `lib/auth.ts`, `pages/api/auth/*.ts`

---

## Commandes Utiles

### Démarrage rapide
```bash
make install          # Build et start en arrière-plan
make logs            # Voir les logs
make stop            # Arrêter l'application
```

### En cas de problème
```bash
make clean           # Nettoyage complet
docker system prune  # Nettoyage cache Docker (optionnel)
make install         # Rebuild complet
```

### Développement local (sans Docker)
```bash
make local-install   # npm install
make local-db-push   # Setup database
make local-dev       # Start dev server
```

---

## Temps de Build Attendus

| Étape | Durée |
|-------|-------|
| Premier build | 3-5 min |
| Rebuild (avec cache) | 30-60 sec |
| Démarrage container | 10-15 sec |
| Next.js ready | 3-5 sec |

**Total premier lancement:** ~4-6 minutes
**Relancement:** ~1 minute

---

## État Final

✅ Tous les bugs critiques corrigés
✅ Application fonctionnelle sur http://localhost:3000
✅ Build Docker optimisé
✅ Validation et sécurité améliorées
✅ Prêt pour le hackathon

---

*Date des correctifs: 15 novembre 2025*
