# 🚀 MOZ SOLIDÁRIA - DigitalOcean Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. DigitalOcean Droplet
- [x] Create Ubuntu 22.04 droplet (minimum 2GB RAM recommended)
- [ ] Note down droplet IP address
- [ ] Set up SSH key access
- [ ] Configure domain DNS (if using custom domain)

### 2. Database Credentials
- [x] PostgreSQL database: `moz_solidaria_db`
- [x] Database user: `adamoabdala`
- [x] Database password: `Jeison2@@`
- [x] Database host: `localhost`
- [x] Database port: `5432`

## 📦 Files Prepared for DigitalOcean

### Backend Configuration
- [x] `backend/.env.production` - Production environment template
- [x] `backend/requirements-production.txt` - Additional production packages
- [x] Updated `settings.py` with DigitalOcean PostgreSQL configuration
- [x] Security settings for production

### Frontend Build
- [x] Production build configured
- [x] Optimized assets
- [x] PWA ready
- [x] SEO optimized

### Server Configuration
- [x] `nginx.conf` - Nginx server configuration
- [x] `gunicorn.service` - Systemd service for Django
- [x] Security and performance optimizations

### Deployment Scripts
- [x] `digitalocean_setup.sh` - Initial server setup
- [x] `setup_app.sh` - Application installation
- [x] `deploy_frontend.sh` - Frontend deployment
- [x] `DIGITALOCEAN_DEPLOYMENT.md` - Step-by-step guide

## 🛠️ Deployment Steps

### Step 1: Server Setup
```bash
# On DigitalOcean droplet as root
chmod +x digitalocean_setup.sh
sudo ./digitalocean_setup.sh
```

### Step 2: Application Setup
```bash
# Clone repository and setup app
chmod +x setup_app.sh
sudo ./setup_app.sh
```

### Step 3: Configure Services
```bash
# Nginx
sudo cp nginx.conf /etc/nginx/sites-available/mozsolidaria
sudo ln -s /etc/nginx/sites-available/mozsolidaria /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Gunicorn
sudo cp gunicorn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
```

### Step 4: Deploy Frontend
```bash
# On local machine
export DROPLET_IP=your-droplet-ip
./deploy_frontend.sh
```

### Step 5: SSL Certificate (Recommended)
```bash
# On droplet
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔧 Configuration Updates Needed

### 1. Environment Variables
Edit `/var/www/mozsolidaria/app/backend/.env`:
```bash
SECRET_KEY=generate-a-secure-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,your-droplet-ip
DATABASE_URL=postgresql://adamoabdala:Jeison2@@localhost:5432/moz_solidaria_db
```

### 2. Nginx Configuration
Update `nginx.conf` with your actual:
- Domain name
- Droplet IP address

### 3. Frontend Environment
Update frontend `.env.production`:
```bash
VITE_API_BASE_URL=https://your-domain.com/api
VITE_APP_URL=https://your-domain.com
```

## 🔒 Security Checklist

### Server Security
- [ ] UFW firewall enabled (ports 22, 80, 443)
- [ ] Fail2ban configured
- [ ] SSH key authentication only
- [ ] Regular security updates scheduled

### Application Security
- [ ] Secret key generated and secure
- [ ] Database password secure
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Debug mode disabled in production

## 📊 Monitoring Setup

### Health Checks
- [ ] Gunicorn service status
- [ ] Nginx service status
- [ ] Database connectivity
- [ ] Frontend accessibility

### Logs Location
- Application: `/var/log/mozsolidaria/`
- Nginx: `/var/log/nginx/`
- System: `/var/log/syslog`

### Monitoring Commands
```bash
# Service status
sudo systemctl status gunicorn nginx postgresql

# View logs
sudo tail -f /var/log/mozsolidaria/gunicorn-error.log
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart gunicorn nginx
```

## 🚀 Go-Live Checklist

### Final Testing
- [ ] All pages load correctly
- [ ] API endpoints responding
- [ ] Database operations working
- [ ] File uploads working
- [ ] Admin panel accessible
- [ ] Mobile responsiveness
- [ ] Performance acceptable

### DNS & Domain
- [ ] Domain pointing to droplet IP
- [ ] SSL certificate installed
- [ ] WWW redirect working
- [ ] HTTPS redirect working

### Backup & Recovery
- [ ] Database backup strategy
- [ ] Media files backup
- [ ] Application code backup
- [ ] Recovery procedure documented

## 📞 Support & Maintenance

### Regular Tasks
- [ ] Monitor server resources
- [ ] Check application logs
- [ ] Update dependencies
- [ ] Security patches
- [ ] Database maintenance

### Emergency Contacts
- **Technical Issues**: dev@mozsolidaria.org
- **Server Access**: System administrator
- **Domain/DNS**: Domain provider support

---

**Status**: ✅ Ready for DigitalOcean Deployment
**Database**: ✅ PostgreSQL configured with provided credentials
**Last Updated**: August 30, 2025

## 🎯 Next Actions
1. Create DigitalOcean droplet
2. Run deployment scripts
3. Configure domain/SSL
4. Test thoroughly
5. Go live! 🚀
