#!/bin/bash

# SweetBite Bakery - SSL Setup Script
# Configures Nginx for probashibakery.com and installs SSL via Certbot

set -e

DOMAIN="probashibakery.com"
EMAIL="probashibakery@gmail.com"

echo "=========================================="
echo "Setting up SSL for $DOMAIN"
echo "=========================================="

# 1. Update Nginx Configuration
echo "Updating Nginx configuration..."
cat > /etc/nginx/sites-available/sweetbite-bakery <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN 72.62.249.216;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)\$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Reload Nginx to apply changes
nginx -t
systemctl reload nginx
echo "Nginx configuration updated."

# 2. Install Certbot
echo "Installing Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# 3. Obtain and Install SSL Certificate
echo "Obtaining SSL certificate..."
# --non-interactive: Run without user input
# --agree-tos: Agree to Terms of Service
# --redirect: Automatically redirect HTTP to HTTPS
# --email: Email for urgent renewal and security notices
certbot --nginx \
    -d $DOMAIN -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --redirect \
    -m $EMAIL

echo ""
echo "=========================================="
echo "SSL Setup Complete! 🎉"
echo "=========================================="
echo "You can now access your site at: https://$DOMAIN"
echo ""
