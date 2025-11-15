# API Documentation - Hack the Gap

**Date:** 2025-11-15
**Base URL:** `http://localhost:3000` (dev) | `https://yourdomain.com` (prod)

## 🔐 Authentication

Tous les endpoints API nécessitent une authentification. L'utilisateur doit être connecté via Better Auth.

**Headers requis:**
```
Cookie: better-auth.session_token=...
```

Si l'utilisateur n'est pas connecté, l'API renvoie une erreur 401 Unauthorized.

---

## 📊 Endpoints de Test

### 1. GET `/api/test/courses`

Récupère la liste des cours avec leurs relations (subject, year, semester, concepts).

**Request:**
```bash
curl http://localhost:3000/api/test/courses \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "code": "PHIL101",
      "name": "Introduction to Philosophy",
      "subjectId": "uuid-subject",
      "yearId": "uuid-year",
      "semesterId": "uuid-sem",
      "ueNumber": "UE1",
      "syllabusUrl": "https://...",
      "createdAt": "2025-11-15T10:00:00Z",
      "subject": {
        "id": "uuid-subject",
        "name": "Philosophy",
        "createdAt": "2025-11-15T09:00:00Z"
      },
      "year": {
        "id": "uuid-year",
        "name": "L1",
        "level": 1
      },
      "semester": {
        "id": "uuid-sem",
        "number": 1
      },
      "syllabusConcepts": [
        {
          "id": "uuid-concept",
          "conceptText": "Categorical Imperative",
          "category": "Ethics",
          "importance": 5,
          "order": 1
        }
      ],
      "enrollments": [
        {
          "userId": "user-uuid",
          "courseId": "uuid-123",
          "isActive": true,
          "learnedCount": 12
        }
      ],
      "_count": {
        "syllabusConcepts": 45,
        "enrollments": 23,
        "reviewSessions": 5
      }
    }
  ],
  "meta": {
    "total": 10,
    "userId": "user-uuid",
    "timestamp": "2025-11-15T12:34:56Z"
  }
}
```

**Use Case:**
- Afficher la liste des cours disponibles
- Voir les cours auxquels l'étudiant est inscrit
- Afficher le nombre de concepts par cours

---

### 2. GET `/api/test/subjects`

Récupère la liste des matières (subjects) avec le nombre de cours associés.

**Request:**
```bash
curl http://localhost:3000/api/test/subjects \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-sub1",
      "name": "Philosophy",
      "createdAt": "2025-11-15T09:00:00Z",
      "_count": {
        "courses": 5
      }
    },
    {
      "id": "uuid-sub2",
      "name": "Biology",
      "createdAt": "2025-11-15T09:00:00Z",
      "_count": {
        "courses": 8
      }
    }
  ],
  "meta": {
    "total": 2,
    "timestamp": "2025-11-15T12:34:56Z"
  }
}
```

**Use Case:**
- Afficher les catégories de cours (matières)
- Filtrer les cours par matière
- Statistiques par matière

---

### 3. GET `/api/test/user-stats`

Récupère les statistiques complètes de l'utilisateur connecté (enrollments, flashcards, reviews, video jobs).

**Request:**
```bash
curl http://localhost:3000/api/test/user-stats \
  -H "Cookie: better-auth.session_token=YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "student@example.com",
      "name": "John Doe"
    },
    "stats": {
      "totalEnrollments": 3,
      "totalFlashcards": 47,
      "totalReviewSessions": 12,
      "totalVideoJobs": 5,
      "totalLearnedConcepts": 35,
      "activeCourses": 2
    },
    "enrollments": [
      {
        "userId": "user-uuid",
        "courseId": "course-uuid",
        "isActive": true,
        "learnedCount": 12,
        "course": {
          "id": "course-uuid",
          "name": "Introduction to Philosophy",
          "subject": {
            "name": "Philosophy"
          }
        }
      }
    ],
    "recentFlashcards": [
      {
        "id": "flashcard-uuid",
        "question": "What is the Categorical Imperative?",
        "answer": "A moral principle by Kant...",
        "timesReviewed": 3,
        "timesCorrect": 2,
        "nextReviewAt": "2025-11-16T10:00:00Z"
      }
    ],
    "recentReviewSessions": [
      {
        "id": "session-uuid",
        "courseId": "course-uuid",
        "flashcardCount": 10,
        "status": "completed",
        "startedAt": "2025-11-15T08:00:00Z",
        "completedAt": "2025-11-15T08:15:00Z",
        "course": {
          "name": "Introduction to Philosophy"
        }
      }
    ],
    "recentVideoJobs": [
      {
        "id": "job-uuid",
        "url": "https://youtube.com/watch?v=...",
        "status": "completed",
        "processedConceptsCount": 8,
        "createdAt": "2025-11-14T15:00:00Z",
        "completedAt": "2025-11-14T15:05:00Z"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-11-15T12:34:56Z"
  }
}
```

**Use Case:**
- Dashboard principal de l'étudiant
- Afficher la progression globale
- Historique des activités récentes
- Statistiques d'apprentissage

---

## 🧪 Page de Test

Une page de test interactive est disponible à :

**URL:** `/api-test` (accessible uniquement quand connecté)

Cette page permet de :
- Tester tous les endpoints en un clic
- Voir les réponses JSON formatées
- Copier les exemples de code
- Debugger les problèmes d'API

**Accès:**
1. Connectez-vous à l'application
2. Allez sur `http://localhost:3000/api-test`
3. Cliquez sur les boutons pour tester les endpoints

---

## 📝 Utilisation Frontend (React/Next.js)

### Exemple 1: Récupérer les cours

```tsx
"use client";

import { useEffect, useState } from "react";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/test/courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCourses(data.data);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Mes Cours</h1>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            {course.name} - {course.subject.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Exemple 2: Récupérer les stats utilisateur

```tsx
"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/test/user-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data.stats);
        }
      });
  }, []);

  if (!stats) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Mon Tableau de Bord</h1>
      <div className="stats">
        <div>Cours actifs: {stats.activeCourses}</div>
        <div>Flashcards: {stats.totalFlashcards}</div>
        <div>Concepts appris: {stats.totalLearnedConcepts}</div>
      </div>
    </div>
  );
}
```

### Exemple 3: Avec React Query (Recommandé)

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

function fetchCourses() {
  return fetch("/api/test/courses").then((res) => res.json());
}

export default function CoursesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      <h1>Mes Cours</h1>
      <ul>
        {data.data.map((course) => (
          <li key={course.id}>{course.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## ⚠️ Gestion d'Erreurs

### Réponse d'erreur standard

```json
{
  "success": false,
  "error": "User not authenticated"
}
```

**Codes d'erreur possibles:**
- `401 Unauthorized`: Utilisateur non connecté
- `500 Internal Server Error`: Erreur serveur/database
- `404 Not Found`: Endpoint inexistant

### Exemple de gestion d'erreur

```tsx
fetch("/api/test/courses")
  .then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then((data) => {
    if (!data.success) {
      console.error("API Error:", data.error);
      return;
    }
    // Utiliser data.data
  })
  .catch((error) => {
    console.error("Fetch error:", error);
  });
```

---

## 🚀 Prochaines Étapes

Pour ajouter de nouveaux endpoints, suivez ce pattern :

1. **Créer le fichier de route** : `app/api/test/[nom]/route.ts`
2. **Importer les dépendances** :
   ```ts
   import { getRequiredUser } from "@/lib/auth/auth-user";
   import { prisma } from "@/lib/prisma";
   import { NextResponse } from "next/server";
   ```
3. **Exporter la fonction GET** :
   ```ts
   export async function GET() {
     const user = await getRequiredUser();
     const data = await prisma.model.findMany();
     return NextResponse.json({ success: true, data });
   }
   ```
4. **Tester sur** `/api-test`

---

## 📚 Ressources

- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Better Auth:** https://better-auth.com

---

**Dernière mise à jour:** 2025-11-15
**Contact:** thomas@hackthegap.com
