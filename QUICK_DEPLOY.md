# 🚀 Quick Deployment Instructions

## Your VPS Details
- **IP Address**: 72.62.249.216
- **GitHub Repo**: https://github.com/kalayanroy/SweetBiteBakery
- **Access URL**: http://72.62.249.216 (after deployment)

---

## ⚡ FASTEST METHOD: Automated Deployment

### Step 1: Connect to your VPS
Open PowerShell on Windows and run:
```powershell
ssh root@72.62.249.216
```

### Step 2: Download and run the deployment script
Once connected to VPS, run these commands:
```bash
cd /root
curl -o deploy.sh https://raw.githubusercontent.com/kalayanroy/SweetBiteBakery/main/deploy-to-vps.sh
chmod +x deploy.sh
bash deploy.sh
```

**That's it!** The script will automatically:
- ✅ Install all required software (Node.js, PostgreSQL, Nginx)
- ✅ Clone your GitHub repository
- ✅ Set up the database
- ✅ Build and deploy your application
- ✅ Configure Nginx reverse proxy

**Time: ~10-15 minutes**

---

## 📋 After Deployment

### 1. Access Your Website
Open browser: **http://72.62.249.216**

### 2. Update Pathao API Credentials
```bash
nano /var/www/sweetbite-bakery/.env
```
Update these lines with your actual Pathao credentials:
```
PATHAO_CLIENT_ID=your_actual_client_id
PATHAO_CLIENT_SECRET=your_actual_client_secret
PATHAO_STORE_ID=your_actual_store_id
```
Save and restart:
```bash
pm2 restart sweetbite-bakery
```

### 3. Test Your Application
- ✅ Browse products
- ✅ Add to cart
- ✅ Place test order
- ✅ Login to admin panel: http://72.62.249.216/admin
  - Username: `admin`
  - Password: `admin123`
- ✅ Check customers page
- ✅ Test Pathao delivery

---

## 🔧 Useful Commands

```bash
# Check application status
pm2 status

# View application logs
pm2 logs sweetbite-bakery

# Restart application
pm2 restart sweetbite-bakery

# Monitor CPU/Memory
pm2 monit

# Update application (after pushing to GitHub)
cd /var/www/sweetbite-bakery
git pull
npm install
npm run build
pm2 restart sweetbite-bakery
```

---

## 🆘 Troubleshooting

### Application not accessible?
```bash
# Check if app is running
pm2 status

# Check logs for errors
pm2 logs sweetbite-bakery --lines 50

# Check if port 5000 is listening
netstat -tulpn | grep 5000

# Check Nginx status
systemctl status nginx
```

### Database connection error?
```bash
# Test database connection
sudo -u postgres psql -d sweetbite_bakery -U sweetbite_user

# Check database logs
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 🔒 Security Checklist

- [ ] Change VPS root password
- [ ] Change database password (in .env and PostgreSQL)
- [ ] Update Pathao API credentials
- [ ] Change admin panel password
- [ ] Set up SSL certificate (if you have a domain)
- [ ] Enable automatic backups

---

## 📞 Need Help?

If you encounter any issues:
1. Check the logs: `pm2 logs sweetbite-bakery`
2. Review the full guide: `DEPLOYMENT_GUIDE.md`
3. Check Nginx logs: `tail -f /var/log/nginx/error.log`

---

**Your SweetBite Bakery will be live at: http://72.62.249.216** 🎉
