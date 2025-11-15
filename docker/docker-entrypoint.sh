#!/bin/sh
set -e

echo "🐳 Starting Hack the Gap application..."

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h db -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "✅ PostgreSQL is ready!"

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

# Seed database (optionnel, décommenter si nécessaire)
# echo "🌱 Seeding database..."
# npx prisma db seed

echo "🚀 Starting application..."
exec "$@"
