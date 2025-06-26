#!/bin/bash

echo "🚀 Deploying Autoclean EEG to Cloudflare Pages..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to Cloudflare Pages
echo "☁️  Deploying to Cloudflare..."
wrangler pages deploy dist --project-name=autoclean-eeg-config

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your site will be available at: https://autoclean-eeg-config.pages.dev"
    echo "📊 Check deployment status at: https://dash.cloudflare.com"
else
    echo "❌ Deployment failed!"
    exit 1
fi