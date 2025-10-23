# Mobile Workout Tracker - Deployment Guide

## Overview

This guide covers everything needed to deploy the Mobile Workout Tracker as a Progressive Web App (PWA) that users can access on their mobile devices.

---

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Prerequisites](#prerequisites)
3. [Hosting Setup](#hosting-setup)
4. [PWA Configuration](#pwa-configuration)
5. [Domain & SSL](#domain--ssl)
6. [Installation Instructions for Users](#installation-instructions-for-users)
7. [Backup & Restore](#backup--restore)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Version Updates](#version-updates)

---

## Deployment Options

### Option 1: Static File Hosting (Recommended)

**Best for:** Simple deployment, low cost, high reliability

**Providers:**
- **Netlify** (easiest, automatic HTTPS)
- **Vercel** (great for React/Next.js)
- **GitHub Pages** (free, but public repo)
- **Cloudflare Pages** (excellent performance)
- **AWS S3 + CloudFront** (enterprise-grade)

**Pros:**
- Zero server management
- Automatic SSL/HTTPS
- CDN included
- Free tier available
- Easy rollbacks

**Cons:**
- Static files only (no backend)
- Requires build step

### Option 2: Personal Server

**Best for:** Full control, custom domain, learning

**Options:**
- Raspberry Pi at home
- VPS (DigitalOcean, Linode, AWS EC2)
- Shared hosting

**Pros:**
- Complete control
- Can add backend features later
- Cost-effective for multiple projects

**Cons:**
- Requires server management
- Need to configure SSL manually
- Responsible for uptime

### Option 3: Send Files Directly

**Best for:** Single user, no internet access needed

**Method:**
- User downloads HTML/JS/CSS files
- Opens `index.html` in mobile browser
- Bookmarks the local file

**Pros:**
- No hosting needed
- Works without internet
- Zero cost

**Cons:**
- Manual updates
- Harder to distribute
- Less professional

---

## Prerequisites

### Required Files

Your app should contain at minimum:
```
workout-tracker/
├── index.html          # Main app file
├── styles.css          # Styling
├── app.js             # Application logic
├── manifest.json      # PWA manifest
├── service-worker.js  # Offline support
└── icons/             # App icons
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

### Development Environment

- Node.js 16+ (if using build tools)
- Git (for version control)
- Text editor
- Modern browser for testing

---

## Hosting Setup

### Method 1: Netlify (Recommended for Beginners)

#### Step 1: Prepare Your Files

1. Ensure all files are in a single directory
2. Create a `netlify.toml` file (optional):

```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 2: Deploy via Drag-and-Drop

1. Go to [https://netlify.com](https://netlify.com)
2. Create account (free)
3. Click "Add new site" > "Deploy manually"
4. Drag your workout-tracker folder onto the page
5. Done! Your app is live at `your-app-name.netlify.app`

#### Step 3: Configure Custom Domain (Optional)

1. Go to Site Settings > Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. SSL is automatic

### Method 2: Vercel

#### Via Git Repository

1. Push code to GitHub:
```bash
cd workout-tracker
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/workout-tracker.git
git push -u origin main
```

2. Go to [https://vercel.com](https://vercel.com)
3. Click "Import Project"
4. Connect GitHub account
5. Select your repository
6. Click "Deploy"

**vercel.json** (optional):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Method 3: GitHub Pages

#### Step 1: Create Repository

1. Go to GitHub.com
2. Create new repository: `workout-tracker`
3. Set to Public (required for free GitHub Pages)

#### Step 2: Push Code

```bash
cd workout-tracker
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/workout-tracker.git
git push -u origin main
```

#### Step 3: Enable GitHub Pages

1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: Deploy from branch
4. Branch: `main`, folder: `/ (root)`
5. Save

**Your app will be at:** `https://yourusername.github.io/workout-tracker`

### Method 4: Self-Hosted (Nginx)

#### Prerequisites

- Linux server (Ubuntu 20.04+)
- Root/sudo access
- Domain name pointed to server IP

#### Install Nginx

```bash
sudo apt update
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Deploy Files

```bash
# Create directory
sudo mkdir -p /var/www/workout-tracker

# Upload files (from your local machine)
scp -r workout-tracker/* user@your-server:/tmp/

# Move files on server
sudo mv /tmp/workout-tracker/* /var/www/workout-tracker/
sudo chown -R www-data:www-data /var/www/workout-tracker
```

#### Configure Nginx

Create `/etc/nginx/sites-available/workout-tracker`:

```nginx
server {
    listen 80;
    server_name workout.yourdomain.com;
    root /var/www/workout-tracker;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/workout-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Setup SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d workout.yourdomain.com
```

Certbot will automatically:
- Obtain SSL certificate
- Configure Nginx for HTTPS
- Setup auto-renewal

---

## PWA Configuration

### manifest.json

Create a complete PWA manifest:

```json
{
  "name": "Workout Tracker",
  "short_name": "Workouts",
  "description": "Track your workouts offline",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["health", "fitness", "lifestyle"],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "540x720",
      "type": "image/png"
    }
  ]
}
```

### service-worker.js

Basic offline support:

```javascript
const CACHE_NAME = 'workout-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Update cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Register Service Worker in index.html

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'));
    });
  }
</script>
```

---

## Domain & SSL

### Custom Domain Setup

#### Option 1: Use Provider's Domain Management

**Netlify/Vercel:**
1. Go to domain settings
2. Add custom domain
3. Follow DNS instructions
4. SSL is automatic

#### Option 2: Manual DNS Configuration

**For self-hosted:**

Add these DNS records at your domain registrar:

```
Type    Name                Value                   TTL
A       workout             YOUR_SERVER_IP          3600
AAAA    workout             YOUR_IPv6_IP           3600 (if applicable)
```

**For Netlify:**
```
CNAME   workout             your-app.netlify.app    3600
```

**For GitHub Pages:**
```
CNAME   workout             yourusername.github.io  3600
```

### SSL Certificate

**Managed Hosting:** Automatic (Netlify, Vercel, GitHub Pages)

**Self-Hosted:** Use Let's Encrypt (see Nginx section above)

**Verify SSL:**
1. Visit `https://workout.yourdomain.com`
2. Check for padlock icon
3. Verify certificate is valid

---

## Installation Instructions for Users

### Provide Clear Instructions on Your Landing Page

Create a simple `help.html` or add to your app:

```html
<div id="install-instructions">
  <h2>How to Install</h2>

  <h3>iPhone/iPad</h3>
  <ol>
    <li>Open this page in Safari</li>
    <li>Tap the Share button (square with arrow)</li>
    <li>Scroll and tap "Add to Home Screen"</li>
    <li>Tap "Add"</li>
  </ol>

  <h3>Android</h3>
  <ol>
    <li>Open this page in Chrome</li>
    <li>Tap the menu (three dots)</li>
    <li>Tap "Add to Home Screen"</li>
    <li>Tap "Add"</li>
  </ol>
</div>
```

### Installation Prompt

Add an install banner for compatible browsers:

```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show install button
  const installBtn = document.getElementById('install-button');
  installBtn.style.display = 'block';

  installBtn.addEventListener('click', () => {
    installBtn.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      deferredPrompt = null;
    });
  });
});
```

---

## Backup & Restore

### For Users (Document in User Guide)

#### Backup

**Automatic Local Backup:**
- Data is stored in browser localStorage
- Survives app restarts
- Tied to specific browser/device

**Manual Backup:**
1. Open app
2. Go to Settings
3. Tap "Export Data"
4. Save JSON file to:
   - iCloud Drive (iOS)
   - Google Drive (Android)
   - Email to yourself
   - Cloud storage app

**Recommended Schedule:**
- Weekly for active users
- After major workouts
- Before device changes

#### Restore

**From JSON Backup:**
1. Open app
2. Go to Settings
3. Tap "Import Data"
4. Select your JSON file
5. Confirm import
6. Data is merged (or replaces existing)

**After Device Change:**
1. Install app on new device
2. Import latest backup JSON
3. Verify data loaded correctly

### For Developers (Version Control)

```bash
# Create deployment backup
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0

# Backup database/files (if applicable)
tar -czf backup-$(date +%Y%m%d).tar.gz workout-tracker/

# Store in secure location
aws s3 cp backup-$(date +%Y%m%d).tar.gz s3://my-backups/
```

---

## Monitoring & Maintenance

### Analytics (Optional)

**Privacy-Friendly Options:**
- Plausible Analytics
- Simple Analytics
- Self-hosted Matomo

**Add to index.html:**
```html
<script defer data-domain="workout.yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

**Metrics to Track:**
- Daily active users
- Installation rate
- Feature usage
- Error rates

### Error Monitoring

**Basic Error Logging:**

```javascript
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Optionally send to error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

**Advanced:** Use Sentry, Rollbar, or similar

### Uptime Monitoring

**For Self-Hosted:**
- UptimeRobot (free)
- Pingdom
- StatusCake

**Setup:**
1. Add your URL
2. Set check interval (5 minutes)
3. Configure alerts (email/SMS)

### Performance Monitoring

**Google Lighthouse:**
```bash
npm install -g lighthouse
lighthouse https://workout.yourdomain.com --view
```

**Target Scores:**
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >80
- PWA: 100

---

## Troubleshooting

### Users Can't Install PWA

**Checklist:**
1. ✅ Site served over HTTPS
2. ✅ manifest.json is valid and linked
3. ✅ Service worker registered
4. ✅ start_url is accessible
5. ✅ Icons provided (192x192 and 512x512 minimum)

**Test:**
```bash
# Validate manifest
curl https://workout.yourdomain.com/manifest.json | jq
```

**Chrome DevTools:**
1. Open DevTools (F12)
2. Application tab > Manifest
3. Check for errors
4. Application tab > Service Workers
5. Verify registration

### Service Worker Not Updating

**Force Update:**
1. Clear browser cache
2. Unregister service worker in DevTools
3. Reload page

**Programmatic Update:**
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.update();
  });
});
```

**Version Cache Name:**
```javascript
// Increment version on each update
const CACHE_NAME = 'workout-tracker-v2'; // Changed from v1
```

### Data Not Persisting

**Check Storage Quota:**
```javascript
if ('storage' in navigator && 'estimate' in navigator.storage) {
  navigator.storage.estimate().then(estimate => {
    console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
  });
}
```

**Request Persistent Storage:**
```javascript
if ('storage' in navigator && 'persist' in navigator.storage) {
  navigator.storage.persist().then(persistent => {
    if (persistent) {
      console.log("Storage will not be cleared except by explicit user action");
    }
  });
}
```

### SSL Certificate Issues

**Let's Encrypt Renewal:**
```bash
# Check expiration
sudo certbot certificates

# Manual renewal
sudo certbot renew

# Auto-renewal (should be automatic)
sudo systemctl status certbot.timer
```

---

## Version Updates

### Semantic Versioning

Use SemVer: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (data format changes)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Examples:
- `1.0.0` → `1.0.1`: Bug fix
- `1.0.1` → `1.1.0`: New feature (export CSV)
- `1.1.0` → `2.0.0`: Data format change

### Update Process

#### 1. Test Update Locally

```bash
# Create feature branch
git checkout -b feature/export-csv

# Make changes
# Test thoroughly

# Commit
git add .
git commit -m "feat: Add CSV export functionality"
```

#### 2. Update Version

**package.json:**
```json
{
  "version": "1.1.0"
}
```

**manifest.json:**
```json
{
  "version": "1.1.0"
}
```

**Update Cache Name:**
```javascript
const CACHE_NAME = 'workout-tracker-v1.1.0';
```

#### 3. Create Migration (if needed)

```javascript
// In app.js
function migrateData() {
  const version = localStorage.getItem('dataVersion');

  if (version === '1.0.0') {
    // Migrate from 1.0.0 to 1.1.0
    const data = JSON.parse(localStorage.getItem('workouts'));
    // Apply migration logic
    localStorage.setItem('workouts', JSON.stringify(data));
    localStorage.setItem('dataVersion', '1.1.0');
  }
}

// Run on app startup
migrateData();
```

#### 4. Deploy

**Netlify/Vercel:**
```bash
git push origin main
# Auto-deploys
```

**Self-Hosted:**
```bash
# On server
cd /var/www/workout-tracker
git pull origin main
sudo systemctl reload nginx
```

#### 5. Notify Users

**In-App Update Notice:**
```javascript
const currentVersion = '1.1.0';
const userVersion = localStorage.getItem('appVersion') || '1.0.0';

if (currentVersion !== userVersion) {
  showUpdateNotification('New features available! Tap to reload.');
  localStorage.setItem('appVersion', currentVersion);
}
```

### Rollback Plan

**Git Rollback:**
```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or use specific tag
git checkout v1.0.0
git push origin main
```

**Netlify/Vercel:** Use web interface to deploy previous version

---

## Security Considerations

### Content Security Policy

Add to index.html:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

### Security Headers (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### Input Sanitization

```javascript
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
```

---

## Performance Optimization

### Minification

```bash
# Install tools
npm install -g terser csso-cli html-minifier

# Minify
terser app.js -o app.min.js -c -m
csso styles.css --output styles.min.css
html-minifier index.html --collapse-whitespace --remove-comments --minify-js --minify-css -o index.min.html
```

### Image Optimization

```bash
# Install ImageMagick or use online tools
convert icon.png -resize 192x192 icon-192x192.png
convert icon.png -resize 512x512 icon-512x512.png

# Optimize
optipng icon-*.png
```

### Lazy Loading

```javascript
// Lazy load images
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => {
    img.src = img.dataset.src;
  });
});
```

---

## Checklist Before Going Live

- [ ] All files tested locally
- [ ] PWA manifest validated
- [ ] Service worker working offline
- [ ] Icons generated (all sizes)
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Error tracking setup
- [ ] Analytics added (optional)
- [ ] User documentation complete
- [ ] Backup strategy documented
- [ ] Test installation on iOS device
- [ ] Test installation on Android device
- [ ] Performance audit passed (Lighthouse >90)
- [ ] Accessibility audit passed
- [ ] Cross-browser testing complete
- [ ] Legal pages added (Privacy Policy, if collecting any data)

---

## Launch Checklist

1. **Pre-Launch:**
   - [ ] Final testing on staging environment
   - [ ] Security scan (OWASP ZAP)
   - [ ] Performance baseline established
   - [ ] Backup of previous version

2. **Launch:**
   - [ ] Deploy to production
   - [ ] Verify deployment successful
   - [ ] Test installation flow
   - [ ] Smoke test all features

3. **Post-Launch:**
   - [ ] Monitor error rates
   - [ ] Check analytics
   - [ ] Gather user feedback
   - [ ] Document any issues

---

## Support & Resources

**Documentation:**
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [PWA Builder](https://www.pwabuilder.com/)

**Testing Tools:**
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Manifest Validator](https://manifest-validator.appspot.com/)

**Hosting Providers:**
- [Netlify](https://www.netlify.com)
- [Vercel](https://vercel.com)
- [GitHub Pages](https://pages.github.com)

---

**Deployment Guide Version:** 1.0
**Last Updated:** October 23, 2025
**Next Review:** Before major version releases

---

**You're Ready to Deploy!** 🚀

Follow this guide step-by-step, and your workout tracker will be live and accessible to users on their mobile devices. Remember to start simple (Option 1: Netlify), and you can always migrate to more advanced hosting later.
