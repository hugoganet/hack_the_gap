# Makefile pour Hack the Gap - Docker
# Utilisation: make <commande>
# Tous les fichiers Docker sont dans le dossier docker/

.PHONY: help install setup build up down restart logs clean reset dev dev-down prod test migrate seed studio

# Couleurs pour l'affichage
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Chemins
DOCKER_DIR := docker
DOCKER_COMPOSE := docker compose -f $(DOCKER_DIR)/docker-compose.yml

help: ## Afficher l'aide
	@echo "$(GREEN)🐳 Hack the Gap - Commandes Docker$(NC)"
	@echo ""
	@echo "$(YELLOW)Commandes disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

# ============================================
# Configuration initiale
# ============================================

install: ## Installer les dépendances (créer .env)
	@echo "$(YELLOW)📋 Création du fichier .env...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.docker.example .env; \
		echo "$(GREEN)✅ Fichier .env créé depuis .env.docker.example$(NC)"; \
		echo "$(YELLOW)⚠️  N'oubliez pas de configurer les variables dans .env !$(NC)"; \
		echo "$(YELLOW)⚠️  Générez BETTER_AUTH_SECRET avec: openssl rand -base64 32$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Le fichier .env existe déjà$(NC)"; \
	fi

setup: install ## Configuration complète (install + génération secrets)
	@echo "$(YELLOW)🔐 Génération de BETTER_AUTH_SECRET...$(NC)"
	@SECRET=$$(openssl rand -base64 32); \
	if grep -q "BETTER_AUTH_SECRET=your-secret-key-here" .env; then \
		sed -i "s|BETTER_AUTH_SECRET=your-secret-key-here.*|BETTER_AUTH_SECRET=$$SECRET|" .env; \
		echo "$(GREEN)✅ BETTER_AUTH_SECRET généré et inséré dans .env$(NC)"; \
	else \
		echo "$(YELLOW)ℹ️  BETTER_AUTH_SECRET déjà configuré$(NC)"; \
	fi
	@echo "$(GREEN)✅ Setup terminé !$(NC)"
	@echo "$(YELLOW)⚠️  Configurez maintenant RESEND_API_KEY et autres variables dans .env$(NC)"

# ============================================
# Production
# ============================================

build: ## Build les images Docker
	@echo "$(YELLOW)🔨 Build des images Docker...$(NC)"
	$(DOCKER_COMPOSE) build
	@echo "$(GREEN)✅ Build terminé !$(NC)"

up: ## Démarrer les services (production)
	@echo "$(YELLOW)🚀 Démarrage des services...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✅ Services démarrés !$(NC)"
	@echo "$(GREEN)📱 Application disponible sur: http://localhost:3000$(NC)"

down: ## Arrêter les services
	@echo "$(YELLOW)🛑 Arrêt des services...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✅ Services arrêtés !$(NC)"

restart: down up ## Redémarrer les services

logs: ## Voir les logs en temps réel
	$(DOCKER_COMPOSE) logs -f

logs-app: ## Voir les logs de l'application uniquement
	$(DOCKER_COMPOSE) logs -f app

logs-db: ## Voir les logs de la base de données uniquement
	$(DOCKER_COMPOSE) logs -f db

prod: build up ## Build et démarrer (production)

# ============================================
# Development
# ============================================

dev: ## Démarrer en mode développement avec hot reload
	@echo "$(YELLOW)🔥 Démarrage en mode développement...$(NC)"
	$(DOCKER_COMPOSE) --profile dev up -d dev
	@echo "$(GREEN)✅ Mode dev démarré !$(NC)"
	@echo "$(GREEN)📱 Application dev disponible sur: http://localhost:3001$(NC)"

dev-down: ## Arrêter le mode développement
	@echo "$(YELLOW)🛑 Arrêt du mode développement...$(NC)"
	$(DOCKER_COMPOSE) --profile dev down
	@echo "$(GREEN)✅ Mode dev arrêté !$(NC)"

dev-logs: ## Voir les logs du mode développement
	$(DOCKER_COMPOSE) logs -f dev

# ============================================
# Base de données
# ============================================

migrate: ## Exécuter les migrations Prisma
	@echo "$(YELLOW)🔄 Exécution des migrations...$(NC)"
	$(DOCKER_COMPOSE) exec app npx prisma migrate deploy
	@echo "$(GREEN)✅ Migrations terminées !$(NC)"

seed: ## Seed la base de données
	@echo "$(YELLOW)🌱 Seeding de la base de données...$(NC)"
	$(DOCKER_COMPOSE) exec app npx prisma db seed
	@echo "$(GREEN)✅ Seed terminé !$(NC)"

studio: ## Ouvrir Prisma Studio
	@echo "$(YELLOW)🎨 Ouverture de Prisma Studio...$(NC)"
	@echo "$(GREEN)📱 Prisma Studio disponible sur: http://localhost:5555$(NC)"
	$(DOCKER_COMPOSE) exec app npx prisma studio

db-reset: ## Reset complet de la base de données (⚠️ PERD LES DONNÉES)
	@echo "$(RED)⚠️  ATTENTION: Cette commande va supprimer toutes les données !$(NC)"
	@read -p "Êtes-vous sûr ? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)🗑️  Suppression des volumes...$(NC)"; \
		$(DOCKER_COMPOSE) down -v; \
		echo "$(YELLOW)🚀 Redémarrage...$(NC)"; \
		$(DOCKER_COMPOSE) up -d; \
		echo "$(GREEN)✅ Base de données réinitialisée !$(NC)"; \
	else \
		echo "$(YELLOW)❌ Opération annulée$(NC)"; \
	fi

db-shell: ## Se connecter au shell PostgreSQL
	$(DOCKER_COMPOSE) exec db psql -U postgres -d hack_the_gap

# ============================================
# Tests
# ============================================

test: ## Exécuter les tests unitaires
	$(DOCKER_COMPOSE) exec app pnpm test:ci

test-e2e: ## Exécuter les tests E2E
	$(DOCKER_COMPOSE) exec app pnpm test:e2e:ci

# ============================================
# Maintenance
# ============================================

clean: ## Nettoyer les conteneurs et images
	@echo "$(YELLOW)🧹 Nettoyage des conteneurs et images...$(NC)"
	$(DOCKER_COMPOSE) down --remove-orphans
	$(DOCKER_COMPOSE) rm -f
	@echo "$(GREEN)✅ Nettoyage terminé !$(NC)"

reset: ## Reset complet (conteneurs + volumes + images)
	@echo "$(RED)⚠️  ATTENTION: Cette commande va tout supprimer !$(NC)"
	@read -p "Êtes-vous sûr ? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)🗑️  Suppression complète...$(NC)"; \
		$(DOCKER_COMPOSE) down -v --remove-orphans; \
		docker rmi hack_the_gap_app hack_the_gap_dev 2>/dev/null || true; \
		echo "$(GREEN)✅ Reset complet terminé !$(NC)"; \
	else \
		echo "$(YELLOW)❌ Opération annulée$(NC)"; \
	fi

ps: ## Voir l'état des conteneurs
	$(DOCKER_COMPOSE) ps

shell: ## Se connecter au shell du conteneur app
	$(DOCKER_COMPOSE) exec app sh

# ============================================
# Développement rapide
# ============================================

quick-start: setup build up migrate ## Setup + Build + Start (première utilisation)
	@echo "$(GREEN)✅ Application prête !$(NC)"
	@echo "$(GREEN)📱 Ouvrez http://localhost:3000$(NC)"

quick-dev: setup dev ## Setup + Start dev (première utilisation dev)
	@echo "$(GREEN)✅ Mode dev prêt !$(NC)"
	@echo "$(GREEN)📱 Ouvrez http://localhost:3001$(NC)"

# Par défaut, afficher l'aide
.DEFAULT_GOAL := help
