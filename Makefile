.PHONY: help dev build preview format lint clean install

help: ## Show this help message
	@echo "Currency Converter - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

preview: ## Preview production build
	npm run preview

format: ## Format all files with Prettier
	npx prettier --write "**/*.{js,ts,html,css,json,md}"

lint: ## Check code formatting
	npx prettier --check "**/*.{js,ts,html,css,json,md}"

test: ## Run tests
	npm run test

test-ui: ## Run tests with UI
	npm run test:ui

test-run: ## Run tests once
	npm run test:run

clean: ## Clean build artifacts and node_modules
	rm -rf dist node_modules

setup: install ## Setup project (install dependencies)
	@echo "✅ Project setup complete!"
	@echo "Run 'make dev' to start development server"