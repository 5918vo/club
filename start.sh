#!/bin/sh
set -e

echo "Setting up environment..."

# Ensure data directory exists and has correct permissions
mkdir -p /app/data
chmod 777 /app/data

# Create database file if it doesn't exist
touch /app/data/prod.db
chmod 666 /app/data/prod.db

# Check if database needs initialization
TABLE_COUNT=$(sqlite3 /app/data/prod.db "SELECT count(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" = "0" ]; then
  echo "Initializing database schema..."
  npx prisma db push
  echo "Running database seed..."
  node prisma/seed.js || echo "Seed skipped"
else
  echo "Database already initialized, checking for schema updates..."
  npx prisma db push --skip-generate 2>/dev/null || true
fi

echo "Starting application..."
node server.js
