"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

type ApiResponse = {
  success: boolean;
  data?: Record<string, unknown> | Record<string, unknown>[];
  meta?: Record<string, unknown>;
  error?: string;
};

export default function ApiTestPage() {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [endpoint, setEndpoint] = useState<string>("");

  const testApi = async (url: string) => {
    setLoading(true);
    setEndpoint(url);
    setResponse(null);

    try {
      const res = await fetch(url);
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">API Test Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Test des endpoints API pour récupérer des données de la database
        </p>
      </div>

      {/* Boutons de test */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>Récupère tous les cours</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={async () => testApi("/api/test/courses")}
              disabled={loading}
              className="w-full"
            >
              {loading && endpoint === "/api/test/courses"
                ? "Chargement..."
                : "GET /api/test/courses"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Récupère toutes les matières</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={async () => testApi("/api/test/subjects")}
              disabled={loading}
              className="w-full"
            >
              {loading && endpoint === "/api/test/subjects"
                ? "Chargement..."
                : "GET /api/test/subjects"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Stats</CardTitle>
            <CardDescription>Stats de l'utilisateur connecté</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={async () => testApi("/api/test/user-stats")}
              disabled={loading}
              className="w-full"
            >
              {loading && endpoint === "/api/test/user-stats"
                ? "Chargement..."
                : "GET /api/test/user-stats"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Affichage de la réponse */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Réponse API</CardTitle>
            <CardDescription>
              Endpoint: <code className="text-sm">{endpoint}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span
                  className={`rounded px-2 py-1 text-sm ${
                    response.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {response.success ? "✅ Success" : "❌ Error"}
                </span>
              </div>

              {/* Metadata */}
              {response.meta && (
                <div>
                  <span className="font-semibold">Metadata:</span>
                  <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4 text-sm">
                    {JSON.stringify(response.meta, null, 2)}
                  </pre>
                </div>
              )}

              {/* Data */}
              {response.data && (
                <div>
                  <span className="font-semibold">Data:</span>
                  <pre className="mt-2 max-h-96 overflow-auto rounded bg-gray-100 p-4 text-sm">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error */}
              {response.error && (
                <div>
                  <span className="font-semibold text-red-600">Error:</span>
                  <pre className="mt-2 overflow-auto rounded bg-red-50 p-4 text-sm text-red-800">
                    {response.error}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions pour la dev frontend */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Documentation pour la Dev Frontend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Endpoints disponibles:</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <code className="rounded bg-gray-100 px-2 py-1">
                  GET /api/test/courses
                </code>{" "}
                - Liste des cours avec relations
              </li>
              <li>
                <code className="rounded bg-gray-100 px-2 py-1">
                  GET /api/test/subjects
                </code>{" "}
                - Liste des matières
              </li>
              <li>
                <code className="rounded bg-gray-100 px-2 py-1">
                  GET /api/test/user-stats
                </code>{" "}
                - Statistiques utilisateur
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Exemple d'utilisation:</h3>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4 text-sm">
              {`// Dans un composant React
const [courses, setCourses] = useState([]);

useEffect(() => {
  fetch('/api/test/courses')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCourses(data.data);
      }
    });
}, []);`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Structure de réponse:</h3>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4 text-sm">
              {`{
  "success": true,
  "data": [...],  // Données demandées
  "meta": {       // Métadonnées
    "total": 10,
    "timestamp": "2025-11-15T..."
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
