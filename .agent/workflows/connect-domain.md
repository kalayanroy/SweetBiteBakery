---
description: Connect a custom domain to the Hostinger KVM 2 VPS
---

# Connect Domain to VPS

Follow these steps to point your custom domain (e.g., `example.com`) to your SweetBite Bakery VPS.

## Step 1: Configure DNS Records
Login to your domain registrar (where you bought your domain, e.g., Namecheap, GoDaddy, Hostinger) and manage DNS settings.

Add the following **A Records**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 72.62.249.216 | Auto / 3600 |
| A | www | 72.62.249.216 | Auto / 3600 |

> **Note:** DNS propagation can take anywhere from a few minutes to 24 hours. You can check if it's propagated using [DNS Checker](https://dnschecker.org/).

## Step 2: Configure Nginx on VPS
Once your domain points to the VPS IP, update Nginx to recognize it.

1.  SSH into your VPS:
    ```bash
    ssh root@72.62.249.216
    ```

2.  Edit the Nginx configuration:
    ```bash
    nano /etc/nginx/sites-available/sweetbite-bakery
    ```

3.  Update the `server_name` line. Replace `yourdomain.com` with your actual domain:
    ```nginx
    server_name 72.62.249.216 yourdomain.com www.yourdomain.com;
    ```

4.  Test and reload Nginx:
    ```bash
    nginx -t
    systemctl reload nginx
    ```

## Step 3: Install SSL Certificate (HTTPS)
Secure your site with a free Let's Encrypt SSL certificate.

1.  Install Certbot:
    ```bash
    apt install -y certbot python3-certbot-nginx
    ```

2.  Run Certbot (replace `yourdomain.com` with your real domain):
    ```bash
    certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```
    *   Enter your email when prompted (for renewal alerts).
    *   Agree to terms (Type `Y` and Enter).
    *   It will automatically update your Nginx config for HTTPS.

## Step 4: Update Application Configuration
Your application needs to know its new public URL.

1.  Edit the `.env` file on the VPS:
    ```bash
    nano /var/www/sweetbite-bakery/.env
    ```

2.  Update `VITE_API_URL` to your domain (use `https`):
    ```env
    VITE_API_URL=https://yourdomain.com
    ```

3.  Rebuild and restart the application:
    ```bash
    cd /var/www/sweetbite-bakery
    npm run build
    cp -r dist/public/* server/public/
    pm2 restart sweetbite-bakery
    ```

## Verification
Visit `https://yourdomain.com` in your browser. You should see your secure SweetBite Bakery site!
