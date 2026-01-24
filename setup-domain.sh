#!/bin/bash

# SweetBite Bakery - Domain Setup Script
# Domain: probashibakery.com
# IP: 72.62.249.216

set -e

echo "=========================================="
echo "Setting up probashibakery.com..."
echo "=========================================="

# 1. Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/sweetbite-bakery <<'EOF'
server {
    listen 80;
    server_name 72.62.249.216 probashibakery.com www.probashibakery.com;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

nginx -t
systemctl reload nginx
echo "Nginx configured."

# 2. Update Application URL
echo "Updating application URL..."
sed -i 's|VITE_API_URL=.*|VITE_API_URL=https://probashibakery.com|' /var/www/sweetbite-bakery/.env

# 3. Restart Application
echo "Restarting application..."
pm2 restart sweetbite-bakery

# 4. SSL Setup Instructions
echo ""
echo "=========================================="
echo "Almost done! Now run this command manually to install SSL:"
echo "------------------------------------------"
echo "certbot --nginx -d probashibakery.com -d www.probashibakery.com"
echo "------------------------------------------"
echo "(We can't automate this step fully because it requires your email input)"
echo "=========================================="
