.PHONY: up down build logs restart clean ps shell-backend shell-db

# ── Production ────────────────────────────────────────────────────────────────
up:
	docker compose up -d --build
	@echo ""
	@echo "✅  SysMon is running!"
	@echo "   Frontend → http://localhost:3000"
	@echo "   Backend  → http://localhost:8000"
	@echo ""

down:
	docker compose down

build:
	docker compose build --no-cache

logs:
	docker compose logs -f

restart:
	docker compose restart

# Stop containers AND remove volumes (wipes DB)
clean:
	docker compose down -v --remove-orphans
	docker image rm sysmon-backend sysmon-frontend 2>/dev/null || true

ps:
	docker compose ps

# ── Dev (hot-reload) ──────────────────────────────────────────────────────────
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# ── Shells ────────────────────────────────────────────────────────────────────
shell-backend:
	docker compose exec backend bash

shell-db:
	docker compose exec db psql -U sysmon_user -d sysmon_db

# ── Migrations ────────────────────────────────────────────────────────────────
migrate:
	docker compose exec backend python manage.py migrate

migrations:
	docker compose exec backend python manage.py makemigrations monitor
