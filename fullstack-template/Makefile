.PHONY: install dev build start db-generate db-push db-studio clean stop logs shell

# Main commands (using Docker by default)
install:
	docker compose up --build -d
	@echo "✅ Project installed and running at http://localhost:3000"

dev:
	docker compose up

start:
	docker compose up -d
	@echo "✅ Project started in background at http://localhost:3000"

stop:
	docker compose down
	@echo "✅ Project stopped"

logs:
	docker compose logs -f

shell:
	docker compose exec app sh

# Database commands (inside Docker)
db-studio:
	docker compose exec app npx prisma studio

db-push:
	docker compose exec app npx prisma db push

db-generate:
	docker compose exec app npx prisma generate

# Cleanup
clean:
	docker compose down -v
	rm -rf node_modules .next prisma/dev.db
	@echo "✅ Project cleaned"

# Legacy commands for local development (without Docker)
local-install:
	npm install

local-dev:
	npm run dev

local-build:
	npm run build

local-db-push:
	npx prisma generate
	npx prisma db push
