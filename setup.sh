#!/bin/bash

set -euo pipefail

# Docker Compose setup script for HubCEFET

echo "Setting up HubCEFET with Docker Compose..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create one based on .env.example"
    exit 1
fi

if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD=(docker compose)
    COMPOSE_DISPLAY="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD=(docker-compose)
    COMPOSE_DISPLAY="docker-compose"
else
    echo "Error: Docker Compose not found. Install Docker Compose v2 ('docker compose') or the legacy 'docker-compose' binary."
    exit 1
fi

compose() {
    "${COMPOSE_CMD[@]}" "$@"
}

# Start only the infrastructure first. Starting every service here would also
# run the one-off migrate and seed services before the explicit commands below.
echo "Starting database and cache services..."
compose up -d postgres redis

echo "Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "Running database migrations..."
compose run --rm migrate

# Run database seeds
echo "Running database seeds..."
compose run --rm --no-deps seed

# Build and start the long-running application services after the database is ready.
echo "Building and starting application services..."
compose up --build -d nginx frontend app adminer

echo ""
echo "✅ Setup complete!"
echo ""
echo "Your application is now running:"
echo "🌐 Frontend: http://localhost:4330"
echo "🔗 API: http://localhost:4330/api"
echo "🗄️ Adminer: http://localhost:8080"
echo ""
echo "To view logs: ${COMPOSE_DISPLAY} logs -f"
echo "To stop: ${COMPOSE_DISPLAY} down"
echo "To restart: ${COMPOSE_DISPLAY} restart"
