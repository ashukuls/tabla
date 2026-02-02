.PHONY: dev build start deploy stop logs seed reseed clean

# Development
dev:
	npm run dev

build:
	npm run build

start:
	npm run start

# Docker
deploy:
	docker compose up -d --build

stop:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose restart

# Database
seed:
	npx tsx scripts/seed.ts

reseed:
	npx tsx scripts/reseed.ts

# Cleanup
clean:
	rm -rf .next node_modules

# Install dependencies
install:
	npm install

# Lint
lint:
	npm run lint

# Help
help:
	@echo "Available commands:"
	@echo "  make dev      - Run development server"
	@echo "  make build    - Build for production"
	@echo "  make deploy   - Build and deploy Docker container"
	@echo "  make stop     - Stop Docker container"
	@echo "  make logs     - Tail Docker logs"
	@echo "  make restart  - Restart Docker container"
	@echo "  make seed     - Seed database (skip existing)"
	@echo "  make reseed   - Delete all and reseed database"
	@echo "  make clean    - Remove build artifacts"
	@echo "  make install  - Install dependencies"
	@echo "  make lint     - Run linter"
