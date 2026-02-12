# Deployment Guide - Quran Learning Platform

## Production Deployment Checklist

### Pre-Deployment

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] MongoDB Atlas setup (production database)
- [ ] Stripe live keys obtained
- [ ] Email configured
- [ ] Security review completed
- [ ] Performance optimization done

---

## Option 1: Vercel + Railway (Recommended)

### Frontend Deployment (Vercel)

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/quran-learning.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Environment Variables**
   Add in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
   JWT_SECRET=your-production-secret
   STRIPE_SECRET_KEY=sk_live_xxx
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### Backend Deployment (Railway)

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Deploy from GitHub

2. **Configure**
   - Root directory: `/`
   - Start command: `node server/index.js`
   - Port: 3001 (Railway will expose this)

3. **Add Environment Variables**
   Same as above, but use Railway's generated URL

4. **Custom Domain** (Optional)
   - Add custom domain in Railway
   - Update CORS settings in `server/index.js`

---

## Option 2: Heroku (Alternative)

### Prepare for Heroku

1. **Update package.json**

   ```json
   "engines": {
     "node": "18.x",
     "npm": "9.x"
   }
   ```

2. **Create Procfile** (Already included)
   ```
   web: node server/index.js
   ```

### Deploy to Heroku

1. **Install Heroku CLI**

   ```bash
   # Download from heroku.com/cli
   ```

2. **Login and Create App**

   ```bash
   heroku login
   heroku create quran-learning-platform
   ```

3. **Add MongoDB**

   ```bash
   heroku addons:create mongolab:sandbox
   ```

4. **Set Environment Variables**

   ```bash
   heroku config:set JWT_SECRET=your-secret
   heroku config:set STRIPE_SECRET_KEY=sk_live_xxx
   # Add all other variables
   ```

5. **Deploy**

   ```bash
   git push heroku main
   ```

6. **Open App**
   ```bash
   heroku open
   ```

---

## Option 3: VPS (DigitalOcean, AWS, etc.)

### Server Setup

1. **Create Ubuntu Server**
   - Recommended: Ubuntu 22.04 LTS
   - RAM: 2GB minimum
   - Storage: 50GB

2. **SSH into Server**

   ```bash
   ssh root@your-server-ip
   ```

3. **Install Dependencies**

   ```bash
   # Update system
   apt update && apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs

   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   apt update
   apt install -y mongodb-org
   systemctl start mongod
   systemctl enable mongod

   # Install Nginx
   apt install -y nginx

   # Install PM2
   npm install -g pm2
   ```

4. **Clone and Setup Project**

   ```bash
   cd /var/www
   git clone https://github.com/yourusername/quran-learning.git
   cd quran-learning
   npm install
   ```

5. **Configure Environment**

   ```bash
   nano .env.local
   # Add all environment variables
   ```

6. **Build Frontend**

   ```bash
   npm run build
   ```

7. **Start with PM2**

   ```bash
   # Backend
   pm2 start server/index.js --name quran-backend

   # Frontend
   pm2 start npm --name quran-frontend -- start

   # Save PM2 config
   pm2 save
   pm2 startup
   ```

8. **Configure Nginx**

   ```bash
   nano /etc/nginx/sites-available/quran-learning
   ```

   Add:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # WebSocket for Socket.io
       location /socket.io {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "Upgrade";
           proxy_set_header Host $host;
       }
   }
   ```

9. **Enable Site**

   ```bash
   ln -s /etc/nginx/sites-available/quran-learning /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

10. **Setup SSL (Let's Encrypt)**
    ```bash
    apt install certbot python3-certbot-nginx
    certbot --nginx -d your-domain.com
    ```

---

## Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free tier cluster
   - Choose region closest to your users

2. **Configure Network Access**
   - Add IP: 0.0.0.0/0 (allow all) or specific IPs
   - For production, use specific IPs

3. **Create Database User**
   - Username: quran_admin
   - Password: Strong password
   - Role: readWrite

4. **Get Connection String**

   ```
   mongodb+srv://quran_admin:password@cluster.mongodb.net/quran-learning?retryWrites=true&w=majority
   ```

5. **Update Environment Variables**
   ```
   MONGODB_URI=your-connection-string
   ```

---

## Production Environment Variables

Create `.env.production`:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quran-learning

# JWT Secret (Generate strong secret)
JWT_SECRET=generate-strong-random-secret-here-min-32-chars

# Stripe LIVE Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=production@quranlearning.com
EMAIL_PASS=app-specific-password

# Production URLs
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
PORT=3001

# Node Environment
NODE_ENV=production
```

---

## Security Checklist

### Pre-Production Security

- [ ] Change all default passwords
- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Secure cookie settings
- [ ] Hide sensitive error messages
- [ ] Enable security headers

### Update CORS in server/index.js

```javascript
app.use(
  cors({
    origin: ["https://yourdomain.com", "https://www.yourdomain.com"],
    credentials: true,
  }),
);
```

### Add Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require("helmet");
app.use(helmet());
```

### Add Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

---

## Performance Optimization

### Frontend

1. **Image Optimization**
   - Use Next.js Image component
   - Compress images
   - Use appropriate formats (WebP)

2. **Code Splitting**
   - Already handled by Next.js
   - Dynamic imports where needed

3. **Caching**
   - Configure CDN (Vercel Edge Network)
   - Browser caching headers

### Backend

1. **Database Indexing**

   ```javascript
   // Add to models
   userSchema.index({ email: 1 });
   classSchema.index({ scheduledTime: 1 });
   ```

2. **Query Optimization**
   - Use projection to limit fields
   - Add pagination
   - Use lean() for read-only queries

3. **Caching**
   - Implement Redis for session storage
   - Cache frequently accessed data

---

## Monitoring & Logging

### Error Tracking

1. **Sentry** (Recommended)

   ```bash
   npm install @sentry/next @sentry/node
   ```

2. **Configure Sentry**

   ```javascript
   // sentry.config.js
   import * as Sentry from "@sentry/next";

   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: process.env.NODE_ENV,
   });
   ```

### Logging

1. **Winston** (Backend)

   ```bash
   npm install winston
   ```

2. **Configure Logger**

   ```javascript
   const winston = require("winston");

   const logger = winston.createLogger({
     level: "info",
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: "error.log", level: "error" }),
       new winston.transports.File({ filename: "combined.log" }),
     ],
   });
   ```

### Analytics

1. **Google Analytics**
   - Add tracking code to \_app.tsx
   - Track page views and events

2. **Stripe Dashboard**
   - Monitor payments
   - Track revenue

---

## Backup Strategy

### Database Backups

1. **MongoDB Atlas Automatic Backups**
   - Enabled by default in paid tiers
   - Configure backup frequency

2. **Manual Backup**

   ```bash
   mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/quran-learning"
   ```

3. **Restore**
   ```bash
   mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/quran-learning" dump/
   ```

### Application Backups

1. **Git Repository**
   - Push to GitHub/GitLab
   - Keep multiple branches

2. **Server Files**
   ```bash
   # Automated backup script
   tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/quran-learning
   ```

---

## Post-Deployment

### Testing in Production

1. **Smoke Tests**
   - Test all main features
   - Verify payments work
   - Test video calling
   - Check email notifications

2. **Performance Testing**
   - Use Google PageSpeed Insights
   - Test loading times
   - Check mobile responsiveness

### Monitoring

1. **Uptime Monitoring**
   - Use UptimeRobot or Pingdom
   - Set up alerts

2. **Error Monitoring**
   - Check Sentry daily
   - Review error logs

3. **Analytics**
   - Monitor user traffic
   - Track conversions

---

## Maintenance

### Regular Tasks

**Daily:**

- Check error logs
- Monitor server resources
- Review failed payments

**Weekly:**

- Update dependencies
- Check database performance
- Review user feedback

**Monthly:**

- Security updates
- Backup verification
- Performance optimization
- Cost review

---

## Domain & DNS Setup

### Purchase Domain

1. Buy domain from:
   - Namecheap
   - GoDaddy
   - Google Domains

### Configure DNS

Add these records:

```
Type    Name    Value
A       @       your-server-ip
A       www     your-server-ip
CNAME   api     your-backend-url
```

### SSL Certificate

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Scaling Considerations

### When to Scale

- Response times > 2 seconds
- Server CPU > 80%
- Database queries slow
- More than 1000 concurrent users

### Scaling Options

1. **Vertical Scaling**
   - Upgrade server resources
   - Increase MongoDB tier

2. **Horizontal Scaling**
   - Load balancer
   - Multiple server instances
   - Database replication

3. **CDN**
   - CloudFlare
   - AWS CloudFront
   - Vercel Edge Network

---

## Cost Estimates

### Development (Free Tier)

- MongoDB Atlas: Free (512MB)
- Vercel: Free
- Railway: Free ($5 credit)
- Total: $0-5/month

### Production (Starting)

- MongoDB Atlas: $9/month (Shared)
- Vercel Pro: $20/month
- Railway: $10/month
- Domain: $12/year
- Email: $0 (Gmail)
- Total: ~$40/month

### Production (Growing)

- MongoDB Atlas: $57/month (Dedicated)
- Vercel Pro: $20/month
- Railway: $20-50/month
- Domain: $12/year
- Email: $6/month (Pro)
- Total: ~$100-130/month

---

## Support & Maintenance

### Documentation

- Keep README updated
- Document API changes
- Maintain changelog

### User Support

- Set up support email
- Create FAQ page
- Implement live chat (optional)

### Updates

- Regular feature updates
- Security patches
- Bug fixes
- Performance improvements

---

## Rollback Plan

### If Deployment Fails

1. **Frontend (Vercel)**
   - Click "Rollback" to previous deployment
   - Or redeploy from Git

2. **Backend (Railway/Heroku)**

   ```bash
   # Heroku
   heroku rollback

   # Railway
   # Use Railway dashboard to redeploy previous version
   ```

3. **Database**
   ```bash
   # Restore from backup
   mongorestore dump/
   ```

---

**Deployment Complete! 🎉**

Your Quran Learning Platform is now live and serving the Ummah worldwide!

For issues, refer to logs and monitoring tools.
May Allah bless this endeavor! 🤲
