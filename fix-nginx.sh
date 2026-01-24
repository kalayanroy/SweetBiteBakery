#!/bin/bash
set -e

NGINX_CONF="/etc/nginx/sites-enabled/default"

echo "Checking Nginx configuration..."

# Backup config
cp $NGINX_CONF "${NGINX_CONF}.bak"

# Check if X-Forwarded-Proto is missing
if ! grep -q "proxy_set_header X-Forwarded-Proto" $NGINX_CONF; then
    echo "❌ Missing X-Forwarded-Proto header. Fixing..."
    
    # Insert the header after 'proxy_pass' or inside the 'location /' block
    # We'll try to find 'proxy_pass' and add headers before it
    sed -i '/proxy_pass/i \        proxy_set_header X-Forwarded-Proto $scheme;' $NGINX_CONF
    sed -i '/proxy_pass/i \        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' $NGINX_CONF
    sed -i '/proxy_pass/i \        proxy_set_header Host $host;' $NGINX_CONF
    
    echo "✅ Configuration updated."
else
    echo "✅ X-Forwarded-Proto header already present."
fi

# Test configuration
echo "Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "Reloading Nginx..."
systemctl reload nginx

echo "✅ Nginx fix applied successfully!"
