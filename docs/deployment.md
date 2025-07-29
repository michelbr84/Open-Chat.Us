# OpenChat Deployment Guide

This guide covers deploying OpenChat to various platforms and environments.

## 🚀 Quick Deploy Options

### Vercel (Recommended)

Vercel provides the best experience for React applications with automatic deployments.

1. **Connect Repository**
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Import the OpenChat repository

2. **Configure Environment Variables**
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

3. **Deploy**
   - Click "Deploy" in Vercel dashboard
   - Automatic deployments on every push to main branch

### Netlify

1. **Connect Repository**
   - Sign up at [netlify.com](https://netlify.com)
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   Add the same environment variables as Vercel

4. **Deploy**
   - Deploy automatically on every push

### Supabase Hosting

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Link Project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Deploy**
   ```bash
   npm run build
   supabase hosting deploy
   ```

## 🔧 Manual Deployment

### VPS/Dedicated Server

1. **Server Requirements**
   - Node.js 18+
   - Nginx or Apache
   - SSL certificate (Let's Encrypt recommended)

2. **Build Application**
   ```bash
   git clone https://github.com/yourusername/openchat.git
   cd openchat
   npm install
   npm run build
   ```

3. **Configure Web Server**
   
   **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;

       root /path/to/openchat/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Security headers
       add_header X-Frame-Options DENY;
       add_header X-Content-Type-Options nosniff;
       add_header X-XSS-Protection "1; mode=block";
       add_header Referrer-Policy "strict-origin-when-cross-origin";
   }
   ```

   **Apache Configuration:**
   ```apache
   <VirtualHost *:443>
       ServerName your-domain.com
       DocumentRoot /path/to/openchat/dist
       
       SSLEngine on
       SSLCertificateFile /path/to/certificate.crt
       SSLCertificateKeyFile /path/to/private.key
       
       <Directory "/path/to/openchat/dist">
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
           
           # Enable SPA routing
           RewriteEngine On
           RewriteBase /
           RewriteRule ^index\.html$ - [L]
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteRule . /index.html [L]
       </Directory>
       
       # Security headers
       Header always set X-Frame-Options DENY
       Header always set X-Content-Type-Options nosniff
   </VirtualHost>
   ```

## 🗄️ Database Setup

### Supabase Production Setup

1. **Create Production Project**
   - Create a new Supabase project for production
   - Use a different project than development

2. **Run Migrations**
   ```bash
   supabase db reset
   supabase db push
   ```

3. **Configure Authentication**
   - Set up email templates
   - Configure OAuth providers if needed
   - Set appropriate rate limits

4. **Set Up Edge Functions**
   ```bash
   supabase functions deploy chat-bot
   supabase functions deploy contact-form
   supabase functions deploy security-headers
   ```

### Database Backup Strategy

1. **Automated Backups**
   - Enable daily backups in Supabase dashboard
   - Set retention period (7-30 days recommended)

2. **Manual Backup**
   ```bash
   supabase db dump --file backup.sql
   ```

3. **Restore from Backup**
   ```bash
   supabase db reset
   psql -h your-host -U postgres -d postgres -f backup.sql
   ```

## 🔐 Security Configuration

### Environment Variables

**Production Environment Variables:**
```env
# Supabase (Required)
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# AI Bot Integration (Optional)
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat

# Analytics (Optional)
VITE_ANALYTICS_ENABLED=true
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Feature Flags (Optional)
VITE_ENABLE_CRYPTO_DONATIONS=true
VITE_ENABLE_FILE_UPLOADS=true
```

### SSL/TLS Configuration

1. **Let's Encrypt (Free SSL)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **SSL Security Headers**
   ```nginx
   # Add to Nginx config
   ssl_protocols TLSv1.2 TLSv1.3;
   ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
   ssl_prefer_server_ciphers off;
   ssl_session_cache shared:SSL:10m;
   ```

### Content Security Policy

The application includes a built-in CSP, but you can enhance it at the server level:

```nginx
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://yourproject.supabase.co wss://yourproject.supabase.co;
    font-src 'self' data:;
    frame-ancestors 'none';
    form-action 'self';
    upgrade-insecure-requests;
";
```

## 📊 Monitoring & Analytics

### Performance Monitoring

1. **Web Vitals**
   - Monitor Core Web Vitals in production
   - Use Google PageSpeed Insights
   - Set up real user monitoring

2. **Server Monitoring**
   - CPU and memory usage
   - Disk space monitoring
   - Network bandwidth monitoring

### Error Tracking

1. **Client-Side Errors**
   ```typescript
   // Add to main.tsx
   window.addEventListener('error', (event) => {
     console.error('Global error:', event.error);
     // Send to error tracking service
   });
   ```

2. **Supabase Monitoring**
   - Monitor database performance
   - Track API usage and rate limits
   - Set up alerts for errors

### Analytics Setup

1. **Google Analytics 4**
   ```typescript
   // Add to index.html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_TRACKING_ID');
   </script>
   ```

## 🚀 Performance Optimization

### Build Optimization

1. **Bundle Analysis**
   ```bash
   npm install -g vite-bundle-analyzer
   npx vite-bundle-analyzer
   ```

2. **Code Splitting**
   ```typescript
   // Lazy load routes
   const Chat = lazy(() => import('./pages/Chat'));
   const Admin = lazy(() => import('./pages/AdminDashboard'));
   ```

### CDN Setup

1. **Static Assets**
   - Use CDN for images and static files
   - Configure cache headers appropriately

2. **Edge Caching**
   ```nginx
   # Cache static assets
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    
    - name: Deploy to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Clear Vite cache
   rm -rf node_modules/.vite
   ```

2. **Environment Variables Not Loading**
   - Ensure variables start with `VITE_`
   - Check deployment platform settings
   - Verify .env.local file (local development only)

3. **Supabase Connection Issues**
   - Verify project URL and anon key
   - Check network connectivity
   - Review RLS policies

4. **Real-time Not Working**
   - Check WebSocket connectivity
   - Verify Supabase realtime is enabled
   - Review browser console for errors

### Support

- **Documentation:** Check GitHub wiki
- **Community:** GitHub Discussions
- **Issues:** GitHub Issues
- **Security:** security@open-chat.us

## 📋 Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test user authentication flows
- [ ] Confirm real-time messaging works
- [ ] Check mobile responsiveness
- [ ] Verify SSL certificate
- [ ] Test file upload functionality
- [ ] Confirm security headers are set
- [ ] Monitor error rates and performance
- [ ] Set up backup procedures
- [ ] Configure monitoring and alerts

Your OpenChat instance should now be successfully deployed! 🎉