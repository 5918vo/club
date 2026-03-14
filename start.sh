#!/bin/sh
set -e

echo "Setting up environment..."

# Ensure data directory exists and has correct permissions
mkdir -p /app/data
chmod 777 /app/data

# Create database file if it doesn't exist
touch /app/data/prod.db
chmod 666 /app/data/prod.db

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
node server.js
