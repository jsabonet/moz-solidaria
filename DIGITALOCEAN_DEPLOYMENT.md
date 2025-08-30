#!/bin/bash

# MOZ SOLIDÁRIA - Complete DigitalOcean Deployment Guide
# Run these commands step by step on your DigitalOcean droplet

echo "🌐 MOZ SOLIDÁRIA - DigitalOcean Deployment"
echo "=========================================="

# 1. Initial Server Setup
echo "1️⃣ Run initial server setup (as root):"
echo "chmod +x digitalocean_setup.sh"
echo "sudo ./digitalocean_setup.sh"
echo ""

# 2. Application Setup
echo "2️⃣ Set up the application:"
echo "chmod +x setup_app.sh" 
echo "sudo ./setup_app.sh"
echo ""

# 3. Configure Nginx
echo "3️⃣ Configure Nginx:"
echo "sudo cp nginx.conf /etc/nginx/sites-available/mozsolidaria"
echo "sudo ln -s /etc/nginx/sites-available/mozsolidaria /etc/nginx/sites-enabled/"
echo "sudo rm /etc/nginx/sites-enabled/default"
echo "sudo nginx -t"
echo "sudo systemctl restart nginx"
echo ""

# 4. Configure Gunicorn Service
echo "4️⃣ Set up Gunicorn service:"
echo "sudo cp gunicorn.service /etc/systemd/system/"
echo "sudo systemctl daemon-reload"
echo "sudo systemctl enable gunicorn"
echo "sudo systemctl start gunicorn"
echo "sudo systemctl status gunicorn"
echo ""

# 5. Frontend Deployment
echo "5️⃣ Deploy frontend:"
echo "# On your local machine:"
echo "npm run build"
echo "scp -r dist/* root@your-droplet-ip:/var/www/mozsolidaria/frontend/dist/"
echo ""

# 6. SSL Certificate (Optional but recommended)
echo "6️⃣ Set up SSL certificate:"
echo "sudo apt install certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d your-domain.com -d www.your-domain.com"
echo ""

# 7. Security Setup
echo "7️⃣ Security configuration:"
echo "sudo ufw allow 22"
echo "sudo ufw allow 80" 
echo "sudo ufw allow 443"
echo "sudo ufw enable"
echo ""

# 8. Monitoring and Maintenance
echo "8️⃣ Monitoring commands:"
echo "# Check application status:"
echo "sudo systemctl status gunicorn"
echo "sudo systemctl status nginx"
echo ""
echo "# View logs:"
echo "sudo tail -f /var/log/mozsolidaria/gunicorn-error.log"
echo "sudo tail -f /var/log/nginx/error.log"
echo ""
echo "# Restart services:"
echo "sudo systemctl restart gunicorn"
echo "sudo systemctl restart nginx"
echo ""

echo "🎉 Deployment guide complete!"
echo ""
echo "📝 Don't forget to:"
echo "- Update your domain DNS to point to the droplet IP"
echo "- Edit /var/www/mozsolidaria/app/backend/.env with actual values"
echo "- Change the default superuser password"
echo "- Set up regular backups"
echo "- Monitor application performance"
