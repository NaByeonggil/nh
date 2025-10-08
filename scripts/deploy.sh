#!/bin/bash

# Production deployment script for Neighbor Pharmacist

set -e

echo "🚀 Starting production deployment..."

# Load environment variables
if [ -f .env.production ]; then
    echo "📝 Loading production environment variables..."
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "⚠️  No .env.production file found. Please create one based on .env.example"
    exit 1
fi

# Validate required environment variables
required_vars=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "MYSQL_ROOT_PASSWORD"
    "MYSQL_DATABASE"
    "MYSQL_USER"
    "MYSQL_PASSWORD"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build and start services
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "📦 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check health
echo "🔍 Checking application health..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:${APP_PORT:-3000}/api/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    
    attempt=$((attempt + 1))
    echo "⏳ Attempt $attempt/$max_attempts - waiting for application..."
    sleep 10
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Application failed to start properly"
    echo "📝 Checking logs..."
    docker-compose -f docker-compose.prod.yml logs app
    exit 1
fi

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml exec app npx prisma db push

echo "🎉 Deployment completed successfully!"
echo "🌐 Application is running at: ${NEXTAUTH_URL}"
echo "📊 View logs with: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 Stop services with: docker-compose -f docker-compose.prod.yml down"