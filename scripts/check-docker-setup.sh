#!/bin/bash

# Script de vérification de la configuration Docker
# Usage: ./scripts/check-docker-setup.sh

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 Vérification de la configuration Docker pour Hack the Gap${NC}\n"

# Vérifier si Docker est installé
echo -e "${YELLOW}Vérification de Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    echo -e "   Installez Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
else
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✅ Docker installé: $DOCKER_VERSION${NC}"
fi

# Vérifier si Docker Compose est installé
echo -e "\n${YELLOW}Vérification de Docker Compose...${NC}"
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    echo -e "   Docker Compose est inclus avec Docker Desktop"
    exit 1
else
    COMPOSE_VERSION=$(docker compose version)
    echo -e "${GREEN}✅ Docker Compose installé: $COMPOSE_VERSION${NC}"
fi

# Vérifier si Docker daemon est en cours d'exécution
echo -e "\n${YELLOW}Vérification du Docker daemon...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon n'est pas en cours d'exécution${NC}"
    echo -e "   Démarrez Docker Desktop"
    exit 1
else
    echo -e "${GREEN}✅ Docker daemon en cours d'exécution${NC}"
fi

# Vérifier si le fichier .env existe
echo -e "\n${YELLOW}Vérification du fichier .env...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé${NC}"
    echo -e "   Création depuis .env.docker.example..."
    cp .env.docker.example .env
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
    echo -e "${YELLOW}⚠️  N'oubliez pas de configurer BETTER_AUTH_SECRET et autres variables !${NC}"
else
    echo -e "${GREEN}✅ Fichier .env trouvé${NC}"
fi

# Vérifier si BETTER_AUTH_SECRET est configuré
echo -e "\n${YELLOW}Vérification de BETTER_AUTH_SECRET...${NC}"
if grep -q "BETTER_AUTH_SECRET=your-secret-key-here" .env; then
    echo -e "${YELLOW}⚠️  BETTER_AUTH_SECRET n'est pas configuré${NC}"
    echo -e "   Génération automatique..."
    SECRET=$(openssl rand -base64 32)
    sed -i "s|BETTER_AUTH_SECRET=your-secret-key-here.*|BETTER_AUTH_SECRET=$SECRET|" .env
    echo -e "${GREEN}✅ BETTER_AUTH_SECRET généré et configuré${NC}"
elif grep -q "BETTER_AUTH_SECRET=" .env && [ ! -z "$(grep "BETTER_AUTH_SECRET=" .env | cut -d'=' -f2)" ]; then
    echo -e "${GREEN}✅ BETTER_AUTH_SECRET configuré${NC}"
else
    echo -e "${RED}❌ BETTER_AUTH_SECRET manquant${NC}"
fi

# Vérifier les variables critiques
echo -e "\n${YELLOW}Vérification des variables d'environnement critiques...${NC}"

check_var() {
    VAR_NAME=$1
    REQUIRED=$2

    if grep -q "$VAR_NAME=" .env; then
        VALUE=$(grep "$VAR_NAME=" .env | cut -d'=' -f2)
        if [ ! -z "$VALUE" ] && [ "$VALUE" != "your-secret-key-here-generate-with-openssl-rand-base64-32" ] && [ "$VALUE" != "re_your_api_key_here" ]; then
            echo -e "${GREEN}✅ $VAR_NAME configuré${NC}"
            return 0
        fi
    fi

    if [ "$REQUIRED" = "true" ]; then
        echo -e "${RED}❌ $VAR_NAME manquant ou non configuré (REQUIS)${NC}"
        return 1
    else
        echo -e "${YELLOW}⚠️  $VAR_NAME manquant ou non configuré (optionnel)${NC}"
        return 0
    fi
}

# Variables requises
REQUIRED_OK=true
check_var "DATABASE_URL" "true" || REQUIRED_OK=false
check_var "BETTER_AUTH_SECRET" "true" || REQUIRED_OK=false
check_var "EMAIL_FROM" "true" || REQUIRED_OK=false

# Variables optionnelles mais recommandées
echo -e "\n${YELLOW}Variables optionnelles :${NC}"
check_var "RESEND_API_KEY" "false"
check_var "OPENAI_API_KEY" "false"
check_var "GITHUB_CLIENT_ID" "false"
check_var "GOOGLE_CLIENT_ID" "false"

# Vérifier les fichiers Docker
echo -e "\n${YELLOW}Vérification des fichiers Docker...${NC}"
FILES=("Dockerfile" "docker-compose.yml" ".dockerignore")
for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo -e "${GREEN}✅ $FILE trouvé${NC}"
    else
        echo -e "${RED}❌ $FILE manquant${NC}"
        REQUIRED_OK=false
    fi
done

# Résumé
echo -e "\n${GREEN}═══════════════════════════════════════════════════${NC}"
if [ "$REQUIRED_OK" = true ]; then
    echo -e "${GREEN}✅ Configuration prête ! Vous pouvez lancer :${NC}"
    echo -e "   ${YELLOW}make up${NC}        # Démarrer en production"
    echo -e "   ${YELLOW}make dev${NC}       # Démarrer en développement"
    echo -e "   ${YELLOW}make help${NC}      # Voir toutes les commandes"
else
    echo -e "${RED}❌ Configuration incomplète${NC}"
    echo -e "   Veuillez configurer les variables manquantes dans .env"
fi
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}\n"

exit 0
