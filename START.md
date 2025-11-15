# 🚀 Démarrage Rapide - Hack the Gap

## Étapes pour démarrer l'application

### 1. Démarrer les conteneurs

```bash
make up
```

**Ou manuellement** :
```bash
docker compose -f docker/docker-compose.yml up -d
```

### 2. Attendre que l'application soit prête (~15-20 secondes)

```bash
# Vérifier les logs
docker compose -f docker/docker-compose.yml logs -f app
```

Attendez de voir : `Ready in X ms` ou `Listening on...`

### 3. Accéder à l'application

**Ouvrez votre navigateur** sur :
```
http://localhost:3000
```

### 4. Exécuter les migrations (si nécessaire)

Si vous voyez une erreur de base de données :

```bash
# Attendre que le conteneur soit complètement démarré
sleep 15

# Exécuter les migrations
docker compose -f docker/docker-compose.yml exec app npx prisma migrate deploy
```

---

## ✅ Vérification rapide

### Vérifier que les conteneurs tournent

```bash
docker compose -f docker/docker-compose.yml ps
```

Vous devriez voir :
- `hack_the_gap_db` - Up/Healthy
- `hack_the_gap_app` - Up

### Tester l'API health

```bash
curl http://localhost:3000/api/health
```

Devrait retourner :
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "hack-the-gap"
}
```

---

## 🐛 Problèmes Courants

### L'application ne démarre pas

```bash
# 1. Voir les logs
docker compose -f docker/docker-compose.yml logs app

# 2. Redémarrer
docker compose -f docker/docker-compose.yml restart app

# 3. Reset complet (attention : perd les données)
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d
```

### Port 3000 déjà utilisé

**Option 1** : Tuer le processus utilisant le port
```bash
lsof -i :3000
kill -9 <PID>
```

**Option 2** : Changer le port
- Éditer `docker/docker-compose.yml`
- Modifier la ligne `ports: - "3000:3000"` en `ports: - "3001:3000"`
- Redémarrer : `docker compose -f docker/docker-compose.yml restart`
- Accéder à : `http://localhost:3001`

### Erreur Prisma

```bash
# Vérifier que prisma.config.ts est bien copié
docker compose -f docker/docker-compose.yml exec app ls -la | grep prisma

# Vérifier les logs
docker compose -f docker/docker-compose.yml logs app | grep -i prisma
```

---

## 📋 Commandes Utiles

```bash
# Démarrer
make up

# Arrêter
make down

# Redémarrer
make restart

# Voir les logs en temps réel
make logs

# Logs de l'app uniquement
make logs-app

# Logs de la DB uniquement
make logs-db

# Shell dans le conteneur app
make shell

# Prisma Studio (interface graphique pour la DB)
make studio

# Tests
make test
```

---

## 🎯 Première Utilisation

1. **Accédez à** : http://localhost:3000
2. **Vous devriez voir** : La page d'accueil de NOW.TS
3. **Créer un compte** : Cliquez sur "Sign Up"
4. **Les emails sont loggés** : Voir avec `make logs-app`

---

## 🔧 Rebuild complet (si modifications du code)

```bash
# 1. Arrêter
make down

# 2. Rebuild
make build

# 3. Démarrer
make up

# Ou tout en une commande
make down && make build && make up
```

---

## 💡 Tips

- **Premier démarrage** : Peut prendre 20-30 secondes
- **Logs en temps réel** : `make logs` dans un terminal séparé pendant le développement
- **Health check** : `curl http://localhost:3000/api/health` pour vérifier rapidement

---

## 🆘 Besoin d'Aide ?

1. Vérifier `docker compose -f docker/docker-compose.yml ps`
2. Voir les logs `docker compose -f docker/docker-compose.yml logs app`
3. Lire `docker/README.md` pour plus de détails
