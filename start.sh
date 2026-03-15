#!/bin/sh
set -e

echo "Setting up environment..."

# Ensure data directory exists and has correct permissions
mkdir -p /app/data
chmod 777 /app/data

# Create database file if it doesn't exist
touch /app/data/prod.db
chmod 666 /app/data/prod.db

echo "Syncing database schema..."
npx prisma db push --accept-data-loss

echo "Running database seed..."
node prisma/seed.js || echo "Seed skipped (may already exist)"

echo "Starting application..."
node server.js
