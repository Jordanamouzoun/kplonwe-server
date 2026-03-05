#!/bin/bash
set -e

echo "🔧 Installing dependencies..."
npm install

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🔄 Creating database schema..."
npx prisma db push --skip-generate

echo "✅ Build complete!"
