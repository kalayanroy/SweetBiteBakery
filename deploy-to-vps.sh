#!/bin/bash

# SweetBite Bakery - VPS Deployment Script
# For Hostinger KVM 2 (Malaysia) - Ubuntu/Debian

set -e  # Exit on any error

echo "=========================================="
echo "SweetBite Bakery - VPS Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Update System
echo -e "${GREEN}[Step 1/10] Updating system packages...${NC}"
apt update && apt upgrade -y

# Step 2: Install Node.js 20 LTS
echo -e "${GREEN}[Step 2/10] Installing Node.js 20 LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Step 3: Install PostgreSQL
echo -e "${GREEN}[Step 3/10] Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
echo "PostgreSQL installed successfully"

# Step 4: Install Nginx
echo -e "${GREEN}[Step 4/10] Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo "Nginx installed successfully"

# Step 5: Install PM2 globally
echo -e "${GREEN}[Step 5/10] Installing PM2 process manager...${NC}"
npm install -g pm2

# Step 6: Setup Firewall
echo -e "${GREEN}[Step 6/10] Configuring firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo "y" | ufw enable
echo "Firewall configured"

# Step 7: Create PostgreSQL Database
echo -e "${GREEN}[Step 7/10] Setting up PostgreSQL database...${NC}"
sudo -u postgres psql <<EOF
CREATE DATABASE sweetbite_bakery;
CREATE USER sweetbite_user WITH PASSWORD 'SweetBite2026!Secure';
GRANT ALL PRIVILEGES ON DATABASE sweetbite_bakery TO sweetbite_user;
ALTER DATABASE sweetbite_bakery OWNER TO sweetbite_user;
\q
EOF
echo "Database created successfully"

# Step 8: Clone GitHub Repository
echo -e "${GREEN}[Step 8/10] Cloning GitHub repository...${NC}"
cd /var/www
if [ -d "sweetbite-bakery" ]; then
    echo "Directory exists, pulling latest changes..."
    cd sweetbite-bakery
    git pull
else
    git clone https://github.com/kalayanroy/SweetBiteBakery.git sweetbite-bakery
    cd sweetbite-bakery
fi
echo "Repository cloned/updated successfully"

# Step 9: Configure Environment Variables
echo -e "${GREEN}[Step 9/10] Creating environment file...${NC}"
cat > .env <<EOF
# Database
DATABASE_URL=postgresql://sweetbite_user:SweetBite2026!Secure@localhost:5432/sweetbite_bakery

# Server
NODE_ENV=production
PORT=5000

# Pathao API (Update with your actual credentials)
PATHAO_CLIENT_ID=your_pathao_client_id
PATHAO_CLIENT_SECRET=your_pathao_client_secret
PATHAO_STORE_ID=your_store_id
PATHAO_BASE_URL=https://api-hermes.pathao.com

# Session Secret (Generated random string)
SESSION_SECRET=$(openssl rand -base64 32)

# API URL
VITE_API_URL=http://72.62.249.216
EOF
echo ".env file created"

# Step 10: Install Dependencies and Build
echo -e "${GREEN}[Step 10/10] Installing dependencies and building application...${NC}"
npm install
echo "Building frontend..."
npm run build

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Create PM2 ecosystem file (using .cjs for CommonJS in ES module project)
echo "Creating PM2 configuration..."
cat > ecosystem.config.cjs <<EOF
module.exports = {
  apps: [{
    name: 'sweetbite-bakery',
    script: './server/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/sweetbite-bakery <<EOF
server {
    listen 80;
    server_name 72.62.249.216;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Client body size
    client_max_body_size 10M;

    # Proxy to Node.js app
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

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/sweetbite-bakery /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Set timezone to Malaysia
timedatectl set-timezone Asia/Kuala_Lumpur

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete! 🎉"
echo "==========================================${NC}"
echo ""
echo "Your SweetBite Bakery is now running at:"
echo -e "${YELLOW}http://72.62.249.216${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check application status"
echo "  pm2 logs sweetbite-bakery - View application logs"
echo "  pm2 restart sweetbite-bakery - Restart application"
echo "  pm2 monit               - Monitor resources"
echo ""
echo -e "${RED}IMPORTANT:${NC}"
echo "1. Update Pathao API credentials in /var/www/sweetbite-bakery/.env"
echo "2. Change database password in production"
echo "3. Set up SSL certificate with: certbot --nginx -d yourdomain.com"
echo ""
