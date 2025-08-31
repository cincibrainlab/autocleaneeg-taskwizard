#!/bin/bash

echo "🚀 Deploying AutocleanEEG Task Wizard to Cloudflare Pages..."

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
    echo "🌍 Production URL: https://config.autocleaneeg.org"
    echo "📊 Check deployment status at: https://dash.cloudflare.com"
else
    echo "❌ Deployment failed!"
    exit 1
fi
