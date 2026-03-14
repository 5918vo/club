#!/bin/sh
set -e

echo "Setting up environment..."

# Ensure data directory exists
mkdir -p /app/data

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
node server.js
