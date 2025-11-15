# 🚀 Hack the Gap - Guide de Démarrage Rapide

> Template simplifié pour votre hackathon - Auth, Admin, Database déjà configurés

## ⚡ Démarrage en 2 minutes

### 1. Setup Initial

```bash
# Installer les dépendances
pnpm install

# Copier le fichier d'environnement
cp .env.docker.example .env

# Générer un secret pour l'auth
openssl rand -base64 32
# Copier le résultat dans .env → BETTER_AUTH_SECRET
```

### 2. Lancer avec Docker (Recommandé)

```bash
# Tout en une commande
make quick-start

# L'app sera disponible sur http://localhost:3000
```

### 3. Première Connexion

1. Ouvrir http://localhost:3000
2. Cliquer sur "Sign Up"
3. Créer un compte (email: test@test.com, password: test1234)
4. Les emails sont loggés dans la console : `make logs-app`

## 📁 Structure du Projet (Simplifié)

```
hack_the_gap/
├── 📂 app/                         # Routes & Pages Next.js
│   ├── page.tsx                    # ✨ Landing page (simplifiée)
│   ├── auth/                       # 🔐 Pages d'authentification
│   │   ├── signin/                 # Login
│   │   └── signup/                 # Inscription
│   ├── admin/                      # 👑 Panel administrateur
│   │   ├── users/                  # Gestion des users
│   │   └── organizations/          # Gestion des orgs
│   ├── orgs/                       # 🏢 Système d'organisations
│   │   ├── [orgSlug]/             # Page de l'organisation
│   │   └── new/                   # Créer une org
│   └── api/                        # 🔧 API Routes
│       ├── auth/[...all]/         # Better Auth endpoints
│       └── orgs/                  # API organisations
│
├── 📂 src/
│   ├── lib/
│   │   ├── auth.ts                # ✅ Configuration Better Auth
│   │   ├── prisma.ts              # ✅ Client Prisma
│   │   └── actions/
│   │       └── safe-actions.ts    # ✅ Server Actions (3 types)
│   ├── components/ui/             # ✅ Composants Shadcn/UI
│   └── features/                  # ✅ Features réutilisables
│
├── 📂 prisma/
│   └── schema/
│       ├── schema.prisma          # 🎯 TON SCHEMA (à modifier)
│       └── better-auth.prisma     # Auth (auto-généré)
│
└── 📂 documentation_starter_pack/  # 📚 Docs du projet hackathon
    └── docs/
        ├── vision.md              # Vision produit
        └── architecture.md        # Architecture cible
```

## 🔑 Fonctionnalités Prêtes à l'Emploi

### ✅ Authentification (Better Auth)

- **Email/Password** : Prêt
- **Magic Links** : Prêt (emails loggés en dev)
- **OAuth GitHub** : Configuré (ajouter clés dans `.env`)
- **OAuth Google** : Configuré (ajouter clés dans `.env`)
- **Reset Password** : Prêt
- **Email Verification** : Prêt

**Fichiers importants** :
- Config : `src/lib/auth.ts`
- Client hook : `src/lib/auth/auth-client.ts` → `useSession()`
- Server : `src/lib/auth/auth-user.ts` → `getUser()`, `getRequiredUser()`

### ✅ Admin Panel

Accès : http://localhost:3000/admin

**Fonctionnalités** :
- Liste des users
- Liste des organisations
- Recherche et filtres
- RBAC : Seuls les admins peuvent accéder

**Comment devenir admin** :
```sql
-- Dans Prisma Studio (make studio) ou directement en DB
UPDATE "User" SET role = 'admin' WHERE email = 'test@test.com';
```

### ✅ Système d'Organisations (Multi-tenant)

**Actuellement** : Organisations (à transformer en "Courses" pour votre projet)

**Fonctionnalités** :
- Création d'organisation
- Invitation de membres
- Gestion des rôles (owner, admin, member)
- Permissions granulaires
- 1 org créée automatiquement à l'inscription

**Fichiers clés** :
- Pages : `app/orgs/[orgSlug]/`
- API : `app/api/orgs/`
- Utils : `src/lib/organizations/get-org.ts`

### ✅ Database (PostgreSQL + Prisma)

**Commandes utiles** :

```bash
# Prisma Studio (GUI database)
make studio

# Ou manuellement
pnpm prisma studio

# Créer une migration
pnpm prisma migrate dev --name add_my_table

# Générer le client Prisma (après modif schema)
pnpm prisma generate

# Seed la database
pnpm prisma:seed
```

**Ajouter vos tables** :
```prisma
// prisma/schema/schema.prisma

model Course {
  id        String   @id @default(nanoid(11))
  name      String
  slug      String   @unique
  syllabus  String?  @db.Text

  concepts  Concept[]
  students  Enrollment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Concept {
  id          String   @id @default(nanoid(11))
  name        String
  description String   @db.Text

  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
}
```

Puis :
```bash
pnpm prisma migrate dev --name add_courses_and_concepts
```

## 🛠️ Développer votre Hackathon

### Server Actions (Recommandé)

**3 types de clients disponibles** :

```typescript
// 1. Action publique (pas d'auth)
import { action } from "@/lib/actions/safe-actions";

export const submitContact = action
  .inputSchema(z.object({
    email: z.string().email()
  }))
  .action(async ({ parsedInput }) => {
    await prisma.contact.create({ data: parsedInput });
    return { success: true };
  });

// 2. Action authentifiée (user requis)
import { authAction } from "@/lib/actions/safe-actions";

export const updateProfile = authAction
  .inputSchema(z.object({
    name: z.string()
  }))
  .action(async ({ parsedInput, ctx: { user } }) => {
    // user est disponible dans ctx
    await prisma.user.update({
      where: { id: user.id },
      data: parsedInput,
    });
    return { success: true };
  });

// 3. Action organisation (org + permissions)
import { orgAction } from "@/lib/actions/safe-actions";

export const createCourse = orgAction
  .metadata({
    permissions: { courses: ["create"] }
  })
  .inputSchema(z.object({
    name: z.string(),
    orgId: z.string()
  }))
  .action(async ({ parsedInput, ctx: { org } }) => {
    // org est disponible dans ctx
    const course = await prisma.course.create({
      data: {
        ...parsedInput,
        organizationId: org.id
      }
    });
    return course;
  });
```

### API Routes (Pour webhooks, APIs externes)

```typescript
// app/api/concepts/extract/route.ts
import { authRoute } from "@/lib/zod-route";
import { z } from "zod";

export const POST = authRoute
  .body(z.object({
    videoUrl: z.string().url(),
    courseId: z.string(),
  }))
  .handler(async (req, { body, ctx: { user } }) => {
    // Appel OpenAI pour extraction concepts
    const concepts = await extractConceptsFromVideo(body.videoUrl);

    return {
      concepts,
      count: concepts.length
    };
  });
```

### Formulaires React

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export function MyCourseForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // Appeler votre server action
    const result = await createCourse(data);
    if (result.success) {
      toast.success("Course created!");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <div>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </div>
          )}
        />

        <Button type="submit">Create Course</Button>
      </form>
    </Form>
  );
}
```

## 🎯 Roadmap Développement Hackathon

### Phase 1 : Setup Database (2h)

```bash
# 1. Définir votre schéma dans prisma/schema/schema.prisma
# Modèles suggérés : Course, Concept, Flashcard, Review, VideoSource

# 2. Créer la migration
pnpm prisma migrate dev --name initial_hackathon_schema

# 3. Seed quelques données de test
# Modifier prisma/seed.ts puis :
pnpm prisma:seed
```

### Phase 2 : Intégration AI (4h)

```bash
# Ajouter OpenAI API key dans .env
echo "OPENAI_API_KEY=sk-your-key-here" >> .env

# Créer src/lib/ai/openai.ts
# Créer src/features/concept-extraction/
# API route pour extraction : app/api/concepts/extract/route.ts
```

### Phase 3 : UI pour Votre Projet (6h)

```bash
# Réutiliser les pages organisations comme base
# Transformer app/orgs/ en app/courses/
# Créer l'interface de révision flashcards
# Dashboard de progression
```

### Phase 4 : Features Métier (8h)

- Upload syllabus (PDF parsing)
- Matching concepts → syllabus
- Algorithme spaced repetition
- Dashboard progression

## 📊 Commandes Docker Essentielles

```bash
# Démarrer (production mode)
make up

# Démarrer en dev (hot reload sur port 3001)
make dev

# Arrêter
make down

# Voir les logs en temps réel
make logs

# Logs app seulement
make logs-app

# Prisma Studio (GUI database)
make studio

# Shell dans le conteneur
make shell

# Shell PostgreSQL
make db-shell

# Redémarrer
make restart

# Rebuild complet
make down && make build && make up

# Reset complet (⚠️ PERD LES DONNÉES)
make reset
```

## 🔧 Variables d'Environnement Importantes

```bash
# .env (créé à partir de .env.docker.example)

# Database (Docker auto-configuré)
DATABASE_URL=postgresql://postgres:postgres@db:5432/hack_the_gap

# Auth (REQUIS - générer avec openssl rand -base64 32)
BETTER_AUTH_SECRET=your-secret-key-here

# Email (Optionnel pour MVP - les emails sont loggés en console)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@hackthegap.com

# OpenAI (À AJOUTER pour votre projet)
OPENAI_API_KEY=sk-your-openai-key

# OAuth (Optionnel)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 🐛 Debugging

### Voir les logs

```bash
# Tous les logs
make logs

# Suivre les logs en temps réel
docker compose -f docker/docker-compose.yml logs -f

# Logs de l'app uniquement
make logs-app

# Logs PostgreSQL
make logs-db
```

### Vérifier la santé

```bash
# Health check API
curl http://localhost:3000/api/health

# Liste des conteneurs
docker compose -f docker/docker-compose.yml ps

# Entrer dans le conteneur
make shell
```

### Reset si problème

```bash
# Soft reset (redémarrage)
make restart

# Hard reset (rebuild sans cache)
make down
docker compose -f docker/docker-compose.yml build --no-cache
make up

# Nuclear reset (⚠️ perd toutes les données)
make reset
```

## 📚 Ressources

### Documentation Interne

- **Vision Produit** : `documentation_starter_pack/docs/vision.md`
- **Architecture** : `documentation_starter_pack/docs/architecture.md`
- **Tasks** : `documentation_starter_pack/docs/tasks.md`

### Documentation Technique

- **Better Auth** : https://better-auth.com
- **Prisma** : https://prisma.io/docs
- **Shadcn/UI** : https://ui.shadcn.com
- **Next.js 15** : https://nextjs.org/docs
- **React Hook Form** : https://react-hook-form.com
- **Zod** : https://zod.dev

### Fichiers README

- `README.md` - Overview général
- `README.docker.md` - Docker détaillé
- `AGENTS.md` - Conventions code pour IA

## 💡 Tips pour le Hackathon

### 1. Commencer Simple

```bash
# Jour 1 : Setup + Auth + Database
# Jour 2 : Features métier core (extraction concepts)
# Jour 3 : UI + Dashboard + Polish
```

### 2. Réutiliser au Maximum

- ✅ Formulaires : Copier depuis `app/orgs/[orgSlug]/(navigation)/settings/`
- ✅ Tables : Copier depuis `app/admin/users/`
- ✅ Dialogs : Utiliser `dialogManager` (voir `src/features/dialog-manager/`)

### 3. Logger Abondamment

```typescript
import { logger } from "@/lib/logger";

logger.debug("Processing video", { videoUrl, userId });
logger.info("Concepts extracted", { count: concepts.length });
logger.error("Extraction failed", error);
```

### 4. Tests Rapides

```bash
# E2E test d'un flow complet
pnpm test:e2e

# Unit tests
pnpm test
```

## 🚨 Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| Port 3000 occupé | `lsof -i :3000` puis `kill -9 <PID>` ou changer port dans docker-compose.yml |
| Prisma errors | `pnpm prisma generate` puis restart |
| Auth ne fonctionne pas | Vérifier `BETTER_AUTH_SECRET` dans `.env` |
| Database connection failed | `make logs-db` pour voir les logs PostgreSQL |
| Hot reload ne marche pas | Utiliser `make dev` au lieu de `make up` |

## ✅ Checklist Avant de Coder

- [ ] `pnpm install` effectué
- [ ] `.env` créé et configuré (au minimum `BETTER_AUTH_SECRET`)
- [ ] `make quick-start` lancé avec succès
- [ ] http://localhost:3000 accessible
- [ ] Account créé et login fonctionne
- [ ] Prisma Studio accessible (`make studio`)
- [ ] Lecture de `documentation_starter_pack/docs/vision.md`

---

**🎉 Vous êtes prêt ! Bon hackathon !**

> En cas de blocage : vérifier les logs avec `make logs` et consulter la doc Better Auth / Prisma
