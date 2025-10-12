#!/bin/bash

# Docker Compose setup script for HubCEFET

echo "Setting up HubCEFET with Docker Compose..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create one based on .env.example"
    exit 1
fi

# Build and start all services
echo "Building and starting services..."
docker-compose up --build -d

echo "Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "Running database migrations..."
docker-compose run --rm migrate

# Run database seeds
echo "Running database seeds..."
docker-compose run --rm seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "Your application is now running:"
echo "🌐 Frontend: http://localhost"
echo "🔗 API: http://localhost/api"
echo "🗄️ Adminer: http://localhost:8080"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo "To restart: docker-compose restart"