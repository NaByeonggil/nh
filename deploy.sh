#!/bin/bash

echo "🚀 Starting Neighbor Pharmacist Production Deployment"

# Load production environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building Docker images..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
docker-compose exec app npx prisma db push

# Check service health
echo "✅ Checking service health..."
docker-compose ps

echo "✨ Deployment complete!"
echo "📌 Application is running at: http://localhost:3000"
echo "📌 To view logs: docker-compose logs -f"
echo "📌 To stop: docker-compose down"