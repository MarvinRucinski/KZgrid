#!/bin/bash

# Production Build Test Script for KZgrid
# This script simulates a production build locally

set -e

echo "🚀 KZgrid Production Build Test"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials."
    echo "See .env.local.example for template."
    exit 1
fi

echo "✓ Environment file found"
echo ""

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next
echo "✓ Clean complete"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
echo "✓ Dependencies installed"
echo ""

# Run linting
echo "🔍 Running ESLint..."
npm run lint
echo "✓ Linting passed"
echo ""

# Run type checking
echo "📝 Running TypeScript type check..."
npx tsc --noEmit
echo "✓ Type check passed"
echo ""

# Build for production
echo "🏗️  Building for production..."
npm run build
echo "✓ Build complete"
echo ""

# Test production server
echo "🌐 Starting production server on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""
npm run start
