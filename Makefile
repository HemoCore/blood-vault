BOX = docker compose
RUN = $(BOX) run --rm app

.PHONY: help install test check run stop

help:
	@echo "make install - installe les dependances"
	@echo "make test    - lance les tests"
	@echo "make check   - verifie les types"
	@echo "make run     - lance Blood Vault sur http://localhost:3000"
	@echo "make stop    - arrete les conteneurs"

install:
	$(RUN) npm install --no-audit --no-fund

test:
	$(BOX) up -d db
	$(RUN) npm test

check:
	$(RUN) npm run check

run:
	$(BOX) run --rm --service-ports app npx tsx src/bootstrap/index.ts

stop:
	$(BOX) down --remove-orphans