#!/bin/bash

# SweetBite Bakery - Login Fix Script for HTTPS
# Adds 'trust proxy' setting to server/index.ts

set -e

echo "Applying login fix for HTTPS..."

cd /var/www/sweetbite-bakery

# Pull the latest changes (which include the fix we just pushed)
git pull origin main

# Rebuild the server
echo "Rebuilding application..."
npm run build
cp -r dist/public/* server/public/

# Restart the application
echo "Restarting application..."
pm2 restart sweetbite-bakery

echo "✅ Fix applied! Try logging in again at https://probashibakery.com"
