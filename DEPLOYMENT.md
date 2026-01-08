# cPanel Deployment Guide for Sadhana Kala Kendra

This guide covers deploying the full-stack application (React frontend + Express backend) to cPanel.

---

## Prerequisites

- cPanel hosting with Node.js support (Node.js Selector)
- MySQL database access
- SSH access (recommended) or File Manager

---

## Part 1: Backend Deployment

### Step 1: Create MySQL Database

1. Log in to cPanel
2. Go to **MySQL® Databases**
3. Create a new database (e.g., `youruser_sadhana_db`)
4. Create a new user with a strong password
5. Add the user to the database with **ALL PRIVILEGES**
6. Note down: database name, username, password

### Step 2: Upload Backend Files

1. Go to **File Manager** in cPanel
2. Navigate to a folder outside `public_html` (e.g., create `/home/youruser/nodejs_apps/sadhana-backend/`)
3. Upload all files from the `backend/` folder
4. **OR** use SSH:
   ```bash
   cd ~/nodejs_apps
   mkdir sadhana-backend
   cd sadhana-backend
   # Upload files via SFTP or git clone
   ```

### Step 3: Create Environment File

Create `.env` file in the backend folder:

```env
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=youruser_dbuser
DB_PASSWORD=your_secure_password
DB_NAME=youruser_sadhana_db
DB_PORT=3306

# JWT Secret (generate a strong random string)
JWT_SECRET=your_very_long_random_secure_string_here_at_least_32_chars

# Frontend URL (your production domain)
FRONTEND_URL=https://yourdomain.com
```

### Step 4: Configure Node.js App in cPanel

1. Go to **Setup Node.js App** in cPanel
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x or 20.x (LTS recommended)
   - **Application mode**: Production
   - **Application root**: `/home/youruser/nodejs_apps/sadhana-backend`
   - **Application URL**: Choose subdomain (e.g., `api.yourdomain.com`) or path
   - **Application startup file**: `server.js`
4. Click **Create**
5. Run NPM Install from the cPanel interface
6. Click **Run NPM Install** or via SSH:
   ```bash
   cd ~/nodejs_apps/sadhana-backend
   source /home/youruser/nodevenv/sadhana-backend/18/bin/activate
   npm install --production
   ```
7. Click **Restart** to start the application

### Step 5: Configure Subdomain for API (Recommended)

1. Go to **Subdomains** in cPanel
2. Create `api.yourdomain.com` pointing to backend folder
3. Or configure via **Domains** > **Addon Domain**

---

## Part 2: Frontend Deployment

### Step 1: Create Production Environment File

Create `.env.production` in the `frontend/` folder locally:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_BASE_URL=/
```

### Step 2: Build the Frontend

Run locally on your development machine:

```bash
cd frontend
npm install
npm run build
```

This creates a `dist/` folder with the production build.

### Step 3: Upload Frontend Files

1. Go to **File Manager** in cPanel
2. Navigate to `public_html/` (or subdomain folder)
3. **Delete existing files** (except `.htaccess` if customized)
4. Upload all contents from the `dist/` folder
5. The `.htaccess` file from `public/.htaccess` should be included in the build

**OR** via SSH:
```bash
cd ~/public_html
rm -rf *
# Upload dist folder contents
```

### Step 4: Verify .htaccess

Ensure the `.htaccess` file exists in `public_html/` with this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>
```

---

## Part 3: Database Setup

### Import Database Schema

1. Go to **phpMyAdmin** in cPanel
2. Select your database
3. Import your SQL schema file
4. Or create tables manually

---

## Part 4: SSL Configuration

1. Go to **SSL/TLS** in cPanel
2. Use **AutoSSL** or install Let's Encrypt
3. Enable **Force HTTPS** in **Domains** settings
4. Ensure both main domain and API subdomain have SSL

---

## Troubleshooting

### Backend Issues

**Error: Cannot find module**
```bash
# SSH into server, navigate to app folder
source /home/youruser/nodevenv/app-name/18/bin/activate
npm install --production
```

**Error: CORS issues**
- Verify `FRONTEND_URL` in `.env` matches exactly (with https://)
- Check browser console for specific CORS errors

**Error: Database connection failed**
- Verify database credentials in `.env`
- Check if MySQL user has proper permissions
- Verify database exists

**Error: JWT_SECRET not defined**
- Create/update `.env` file with JWT_SECRET

### Frontend Issues

**404 on page refresh**
- Ensure `.htaccess` is present and mod_rewrite is enabled
- Check Apache configuration allows .htaccess overrides

**API calls failing**
- Check `VITE_API_BASE_URL` in build
- Verify backend is running
- Check browser Network tab for actual URLs being called

**Blank page**
- Check browser console for JavaScript errors
- Verify all assets were uploaded correctly

---

## Maintenance

### Restarting Backend

1. Go to **Setup Node.js App** in cPanel
2. Find your application
3. Click **Restart**

### Viewing Logs

Backend logs location: Check Node.js app configuration or:
```bash
tail -f ~/nodejs_apps/sadhana-backend/logs/*.log
```

### Updating the Application

**Backend:**
1. Upload new files
2. Run `npm install` if dependencies changed
3. Restart the Node.js app

**Frontend:**
1. Build locally with `npm run build`
2. Upload new `dist/` contents to `public_html/`

---

## File Structure on Server

```
/home/youruser/
├── nodejs_apps/
│   └── sadhana-backend/
│       ├── server.js
│       ├── package.json
│       ├── .env (create this)
│       ├── controllers/
│       ├── routes/
│       ├── models/
│       ├── middleware/
│       ├── uploads/
│       └── ...
├── public_html/
│   ├── index.html
│   ├── .htaccess
│   └── assets/
│       ├── *.js
│       └── *.css
```

---

## Security Checklist

- [ ] Strong JWT_SECRET (32+ random characters)
- [ ] Strong database password
- [ ] SSL enabled for all domains
- [ ] .env file has restricted permissions (chmod 600)
- [ ] NODE_ENV set to production
- [ ] Rate limiting enabled on admin routes
- [ ] Remove any console.log statements with sensitive data

---

## Quick Commands Reference

```bash
# Activate Node.js environment (replace version as needed)
source /home/youruser/nodevenv/app-name/18/bin/activate

# Install dependencies
npm install --production

# Check if app is running
curl http://localhost:5000

# View running processes
ps aux | grep node

# Create admin user (run once after deployment)
node createAdmin.js
```
