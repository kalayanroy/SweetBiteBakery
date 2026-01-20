# SweetBite Bakery - Manual Deployment Guide
# VPS: 72.62.249.216 (Hostinger KVM 2 Malaysia)

## Prerequisites
- SSH access to VPS: ssh root@72.62.249.216
- GitHub repository: https://github.com/kalayanroy/SweetBiteBakery

---

## OPTION 1: Automated Deployment (Recommended)

### Step 1: Upload the deployment script to your VPS

From your Windows machine (PowerShell):
```powershell
scp "d:\Open AI Projects\SweetBakary\SweetBiteBakery\deploy-to-vps.sh" root@72.62.249.216:/root/
```

### Step 2: SSH into your VPS
```powershell
ssh root@72.62.249.216
```

### Step 3: Run the deployment script
```bash
chmod +x /root/deploy-to-vps.sh
bash /root/deploy-to-vps.sh
```

The script will automatically:
- Update system packages
- Install Node.js, PostgreSQL, Nginx, PM2
- Clone your GitHub repository
- Set up database
- Configure environment variables
- Build and deploy your application
- Configure Nginx reverse proxy

**Estimated time: 10-15 minutes**

---

## OPTION 2: Manual Step-by-Step Deployment

If you prefer to run commands manually, follow these steps:

### 1. Update System
```bash
apt update && apt upgrade -y
```

### 2. Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version
```

### 3. Install PostgreSQL
```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### 4. Install Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 5. Install PM2
```bash
npm install -g pm2
```

### 6. Configure Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### 7. Create PostgreSQL Database
```bash
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE sweetbite_bakery;
CREATE USER sweetbite_user WITH PASSWORD 'SweetBite2026!Secure';
GRANT ALL PRIVILEGES ON DATABASE sweetbite_bakery TO sweetbite_user;
ALTER DATABASE sweetbite_bakery OWNER TO sweetbite_user;
\q
```

### 8. Clone GitHub Repository
```bash
cd /var/www
git clone https://github.com/kalayanroy/SweetBiteBakery.git sweetbite-bakery
cd sweetbite-bakery
```

### 9. Create Environment File
```bash
nano .env
```

Add this content (update Pathao credentials):
```env
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

# Session Secret
SESSION_SECRET=your_very_secure_random_string_here

# API URL
VITE_API_URL=http://72.62.249.216
```

Save with `Ctrl+X`, then `Y`, then `Enter`

### 10. Install Dependencies
```bash
npm install
```

### 11. Build Frontend
```bash
npm run build
```

### 12. Run Database Migrations
```bash
npm run db:push
```

### 13. Create PM2 Ecosystem File
```bash
nano ecosystem.config.cjs
```

Add:
```javascript
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
```

**Note:** We use `.cjs` extension because the project uses ES modules.

### 14. Create Logs Directory
```bash
mkdir -p logs
```

### 15. Start Application with PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Copy and run the command that PM2 outputs.

### 16. Configure Nginx
```bash
nano /etc/nginx/sites-available/sweetbite-bakery
```

Add:
```nginx
server {
    listen 80;
    server_name 72.62.249.216;

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
```

### 17. Enable Nginx Site
```bash
ln -s /etc/nginx/sites-available/sweetbite-bakery /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 18. Set Timezone
```bash
timedatectl set-timezone Asia/Kuala_Lumpur
```

---

## Post-Deployment

### Access Your Application
Open browser: **http://72.62.249.216**

### Useful Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs sweetbite-bakery

# Restart application
pm2 restart sweetbite-bakery

# Monitor resources
pm2 monit

# Check Nginx status
systemctl status nginx

# View Nginx logs
tail -f /var/log/nginx/error.log
```

### Update Application
```bash
cd /var/www/sweetbite-bakery
git pull
npm install
npm run build
pm2 restart sweetbite-bakery
```

---

## Troubleshooting

### Application won't start
```bash
pm2 logs sweetbite-bakery --lines 100
```

### Database connection issues
```bash
sudo -u postgres psql -d sweetbite_bakery -U sweetbite_user
```

### Nginx issues
```bash
nginx -t
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### Check if port 5000 is listening
```bash
netstat -tulpn | grep 5000
```

---

## Security Recommendations

1. **Change database password** in production
2. **Update Pathao API credentials** in `.env`
3. **Set up SSL certificate** (if you have a domain):
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com
   ```
4. **Enable automatic security updates**
5. **Set up automated backups**

---

## Next Steps

1. ✅ Test all features (products, cart, checkout, admin panel)
2. ✅ Update Pathao API credentials
3. ✅ Point your domain to 72.62.249.216 (optional)
4. ✅ Set up SSL certificate
5. ✅ Configure automated backups
