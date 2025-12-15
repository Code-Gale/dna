# Production Deployment Guide with PM2

This guide covers deploying the Dinner N' Awards Night application to a production server using PM2 process manager.

## Prerequisites

- **Node.js**: Version 18 or higher (20+ recommended)
- **MongoDB**: Running instance (local or remote)
- **MinIO**: Object storage service (optional, for gallery uploads)
- **SMTP Server**: For sending ticket emails
- **Server**: Linux/Unix-based server (Ubuntu, Debian, CentOS, etc.)
- **Domain**: Domain name with DNS configured (optional but recommended)

## 1. Server Setup

### Install Node.js and npm

```bash
# Using NodeSource repository (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Install PM2 globally

```bash
sudo npm install -g pm2
```

### Install pnpm (if not already installed)

```bash
npm install -g pnpm
# Or using corepack (Node.js 16.9+)
corepack enable
```

## 2. Clone and Prepare the Project

```bash
# Navigate to your deployment directory
cd /var/www  # or your preferred directory

# Clone your repository (or upload files)
git clone <your-repo-url> dinner-awards-night
cd dinner-awards-night

# Install dependencies
pnpm install --production=false
```

## 3. Environment Configuration

Create a `.env.production` file (or `.env.local`):

```bash
cp .env.example .env.production
nano .env.production
```

### Required Environment Variables

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/dinner
# Or remote MongoDB:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dinner

# Payment Gateway (Korapay)
KORAPAY_SECRET_KEY=your_korapay_secret_key
KORAPAY_PUBLIC_KEY=your_korapay_public_key

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TICKETS_FROM_EMAIL="Dinner Tickets <tickets@yourdomain.com>"

# Admin Credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_random_jwt_secret_key_min_32_chars

# MinIO (Optional - for gallery uploads)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=miniouser
MINIO_SECRET_KEY=miniosecret
MINIO_BUCKET=gallery

# Push Notifications (Optional)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

## 4. Build the Application

```bash
# Build the Next.js application
pnpm build

# Verify the build was successful
ls -la .next/standalone
```

## 5. PM2 Configuration

### Create PM2 Ecosystem File

Create a `ecosystem.config.js` file in the project root:

```bash
nano ecosystem.config.js
```

Add the following configuration:

```javascript
module.exports = {
  apps: [
    {
      name: 'dinner-awards-night',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/dinner-awards-night', // Update with your actual path
      instances: 2, // Number of instances (or 'max' for all CPU cores)
      exec_mode: 'cluster', // Enable cluster mode for load balancing
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '.env.production',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs'],
    },
  ],
};
```

**Note**: Update the `cwd` path to match your actual deployment directory.

### Alternative: Simple PM2 Start (without ecosystem file)

If you prefer a simpler approach, you can start PM2 directly:

```bash
pm2 start npm --name "dinner-awards-night" -- start
```

However, the ecosystem file approach is recommended for production.

## 6. Start the Application with PM2

```bash
# Start the application using the ecosystem file
pm2 start ecosystem.config.js

# Or start directly
pm2 start npm --name "dinner-awards-night" -- start

# Check status
pm2 status

# View logs
pm2 logs dinner-awards-night

# Monitor in real-time
pm2 monit
```

## 7. PM2 Process Management

### Basic Commands

```bash
# Start application
pm2 start ecosystem.config.js

# Stop application
pm2 stop dinner-awards-night

# Restart application
pm2 restart dinner-awards-night

# Reload application (zero-downtime)
pm2 reload dinner-awards-night

# Delete application from PM2
pm2 delete dinner-awards-night

# View logs
pm2 logs dinner-awards-night

# View last 100 lines of logs
pm2 logs dinner-awards-night --lines 100

# Clear logs
pm2 flush
```

### Advanced Management

```bash
# Save PM2 process list (important!)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions provided by the command

# View detailed information
pm2 info dinner-awards-night

# Monitor resources
pm2 monit

# View process list
pm2 list

# Restart all processes
pm2 restart all
```

## 8. Reverse Proxy Setup (Nginx)

### Install Nginx

```bash
sudo apt-get update
sudo apt-get install nginx
```

### Configure Nginx

Create a configuration file:

```bash
sudo nano /etc/nginx/sites-available/dinner-awards-night
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    # For initial setup, use this:
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/dinner-awards-night /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 9. SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

After SSL setup, update your Nginx config to redirect HTTP to HTTPS (uncomment the redirect line).

## 10. Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

## 11. Monitoring and Maintenance

### View Application Logs

```bash
# PM2 logs
pm2 logs dinner-awards-night

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs (if custom logging)
tail -f logs/pm2-out.log
tail -f logs/pm2-error.log
```

### Health Check

Create a simple health check endpoint or monitor:

```bash
# Check if the app is running
curl http://localhost:3000

# Check PM2 status
pm2 status

# Check system resources
pm2 monit
```

### Update Deployment

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
pnpm install

# Rebuild the application
pnpm build

# Restart PM2 (zero-downtime reload)
pm2 reload dinner-awards-night

# Or restart if needed
pm2 restart dinner-awards-night
```

## 12. Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs dinner-awards-night --err

# Check if port is already in use
sudo lsof -i :3000

# Check environment variables
pm2 env 0  # Replace 0 with your app ID
```

### High memory usage

```bash
# Adjust max_memory_restart in ecosystem.config.js
max_memory_restart: '512M'  # or your preferred limit

# Restart with new config
pm2 restart ecosystem.config.js
```

### Database connection issues

- Verify MongoDB is running: `sudo systemctl status mongod`
- Check MongoDB connection string in `.env.production`
- Ensure MongoDB is accessible from your server

### Email not sending

- Verify SMTP credentials in `.env.production`
- Test SMTP connection
- Check email service provider's rate limits
- Review PM2 logs for email errors

## 13. Backup Strategy

### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/dinner" --out=/backup/mongodb/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/dinner" /backup/mongodb/20240101
```

### Application Backup

```bash
# Backup entire application directory
tar -czf /backup/app/dinner-awards-night-$(date +%Y%m%d).tar.gz /var/www/dinner-awards-night
```

## 14. Performance Optimization

### PM2 Cluster Mode

The ecosystem.config.js already includes cluster mode. Adjust instances based on your server's CPU cores:

```javascript
instances: 'max', // Use all CPU cores
// or
instances: 2, // Use 2 instances
```

### Next.js Optimization

- Ensure `output: 'standalone'` is set in `next.config.mjs` (already configured)
- Enable caching headers in Nginx
- Use CDN for static assets if needed

## 15. Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Keep Node.js and dependencies updated
- [ ] Regularly review PM2 logs for errors
- [ ] Set up automated backups
- [ ] Use environment variables for all secrets
- [ ] Restrict MongoDB access (if remote)
- [ ] Enable MongoDB authentication

## 16. Quick Reference

```bash
# Start
pm2 start ecosystem.config.js

# Stop
pm2 stop dinner-awards-night

# Restart
pm2 restart dinner-awards-night

# Reload (zero-downtime)
pm2 reload dinner-awards-night

# Logs
pm2 logs dinner-awards-night

# Status
pm2 status

# Save and setup startup
pm2 save
pm2 startup
```

## Support

For issues or questions:
- Check PM2 logs: `pm2 logs dinner-awards-night`
- Review application logs in `./logs/`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify environment variables are set correctly
- Ensure all services (MongoDB, MinIO) are running

---

**Last Updated**: 2024
**Next.js Version**: 16.0.0
**PM2 Version**: Latest

