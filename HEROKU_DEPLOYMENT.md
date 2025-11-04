# 🚀 Heroku Deployment Guide

This guide will help you deploy both `nola-godlevel-backend` and `nola-godlevel-frontend` to Heroku.

## 📋 Prerequisites

- ✅ Heroku account created
- ✅ Heroku CLI installed
- ✅ Git initialized in both projects (or parent directory)
- ✅ Both projects are working locally

## 🔧 Step 1: Login to Heroku

```bash
heroku login
```

This will open a browser window for authentication.

## 🗄️ Step 2: Deploy Backend

### 2.1 Navigate to Backend Directory

```bash
cd nola-godlevel-backend
```

### 2.2 Create Heroku App for Backend

```bash
heroku create nola-godlevel-backend
```

(You can use any name you prefer, but it must be unique. Heroku will suggest an available name if yours is taken.)

### 2.3 Add PostgreSQL Database

```bash
heroku addons:create heroku-postgresql:mini
```

This creates a free PostgreSQL database. For production, consider upgrading to a paid plan.

### 2.4 Set Environment Variables

Set the required environment variables. Heroku automatically sets `DATABASE_URL` when you add the PostgreSQL addon, so you don't need to set DB connection variables manually if your code reads from `DATABASE_URL`.

However, you should set other environment variables:

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key-here-change-this-to-random-string
heroku config:set API_RATE_LIMIT=100
```

**Important:** Your backend code needs to read database configuration from `DATABASE_URL` if it's provided, or fall back to individual DB_* variables. Let me check if your backend supports `DATABASE_URL`.

### 2.5 Initialize Git Repository (if not already)

```bash
git init
git add .
git commit -m "Initial commit for Heroku deployment"
```

### 2.6 Deploy to Heroku

```bash
heroku git:remote -a nola-godlevel-backend
git push heroku main
```

(If your branch is `master` instead of `main`, use `git push heroku master`)

### 2.7 Verify Backend Deployment

```bash
heroku logs --tail
```

Or test the health endpoint:
```bash
curl https://nola-godlevel-backend.herokuapp.com/health
```

**Note:** Save your backend URL! You'll need it for the frontend configuration.

---

## 🎨 Step 3: Deploy Frontend

### 3.1 Navigate to Frontend Directory

```bash
cd ../nola-godlevel-frontend
```

### 3.2 Create Heroku App for Frontend

```bash
heroku create nola-godlevel-frontend
```

(Again, use your preferred unique name)

### 3.3 Set Environment Variables

Set the backend API URL (replace with your actual backend Heroku URL):

```bash
heroku config:set VITE_API_BASE_URL=https://nola-godlevel-backend.herokuapp.com
```

### 3.4 Initialize Git Repository (if not already)

```bash
git init
git add .
git commit -m "Initial commit for Heroku deployment"
```

### 3.5 Deploy to Heroku

```bash
heroku git:remote -a nola-godlevel-frontend
git push heroku main
```

(If your branch is `master`, use `git push heroku master`)

### 3.6 Verify Frontend Deployment

```bash
heroku logs --tail
```

Or open your app:
```bash
heroku open
```

---

## 🔄 Step 4: Update Database Configuration (If Needed)

Your backend needs to support Heroku's `DATABASE_URL` environment variable. If your database config doesn't already handle this, you'll need to update it.

Heroku provides database connection via `DATABASE_URL` in this format:
```
postgres://username:password@host:port/database
```

You can extract the connection details from `DATABASE_URL` or set individual variables:

```bash
# Heroku sets DATABASE_URL automatically, but you can also set individual vars:
heroku config:set DB_HOST=your-postgres-host
heroku config:set DB_PORT=5432
heroku config:set POSTGRES_DB=your-db-name
heroku config:set POSTGRES_USER=your-username
heroku config:set POSTGRES_PASSWORD=your-password
```

---

## 📝 Step 5: Deploy Database Schema and Data

After deploying your backend, you need to create the database tables and import your data. 

**You have two database files:**
- `database.sql` - Schema and sample data (text format)
- `db` - Full database backup (likely PostgreSQL custom format dump, 63MB)

### 🗄️ Restoring from `db` Backup File (Recommended if you have production data)

If your `db` file contains your actual production data, use this method. The `db` file appears to be a PostgreSQL custom format dump (binary format).

**First, check your file format:**
- **If `db` is a text/SQL file:** Use Method 1 below (same as `database.sql`)
- **If `db` is binary/custom format:** Use one of the options below

To check if it's text or binary, you can try opening it in a text editor. If you see readable SQL commands at the beginning, it's a text/SQL file. If it looks like binary/gibberish, it's a custom format dump.

#### Option A: Using pg_restore (If you have PostgreSQL client tools installed)

1. Get your Heroku DATABASE_URL:
```bash
heroku config:get DATABASE_URL -a nola-godlevel-backend
```

2. Navigate to your backend directory and restore:
```bash
cd nola-godlevel-backend

# Windows (if you have PostgreSQL installed):
pg_restore --verbose --clean --no-acl --no-owner -h <host> -U <user> -d <database> -j 2 db

# Or using DATABASE_URL directly:
pg_restore --verbose --clean --no-acl --no-owner -d $DATABASE_URL -j 2 db
```

**For Windows PowerShell, first get the DATABASE_URL:**
```powershell
$dbUrl = heroku config:get DATABASE_URL -a nola-godlevel-backend
pg_restore --verbose --clean --no-acl --no-owner -d $dbUrl -j 2 db
```

#### Option B: Upload and Restore via URL (Best for large files)

1. **Upload your `db` file to a cloud storage** (S3, Dropbox, Google Drive with direct link, etc.)
   
   For quick upload, you can use:
   - **S3** (if you have AWS account)
   - **Dropbox** - Get a direct download link
   - **Google Drive** - Make it public and get a direct download link
   - **Temporary file sharing** - Upload to any file sharing service that provides direct download URLs

2. **Restore from URL:**
```bash
heroku pg:backups:restore '<URL-to-your-db-file>' DATABASE_URL -a nola-godlevel-backend --confirm nola-godlevel-backend
```

**Example:**
```bash
heroku pg:backups:restore 'https://example.com/path/to/db' DATABASE_URL -a nola-godlevel-backend --confirm nola-godlevel-backend
```

#### Option C: Convert to SQL format (If pg_restore doesn't work)

If the file is actually a custom format dump and you can't use pg_restore:

1. **Convert to SQL format locally:**
```bash
pg_restore --file=db_converted.sql db
```

2. **Then import the SQL file using Method 1 below**

#### Option D: Direct Connection (If you have local PostgreSQL client)

1. Get connection details from Heroku:
```bash
heroku pg:credentials:url DATABASE_URL -a nola-godlevel-backend
```

2. Use those credentials with pg_restore:
```bash
pg_restore --host=<host> --port=<port> --username=<user> --dbname=<dbname> --clean --no-acl --no-owner db
```
(You'll be prompted for the password)

### 📄 Using `database.sql` File (For schema and sample data)

If you prefer to use the `database.sql` file (contains schema and sample data):

### Method 1: Using Heroku CLI (Recommended - Windows/Mac/Linux)

This is the easiest method. Navigate to your backend directory and run:

```bash
cd nola-godlevel-backend
heroku pg:psql -a nola-godlevel-backend < database.sql
```

**Note for Windows PowerShell:** If the above doesn't work, use:
```powershell
Get-Content database.sql | heroku pg:psql -a nola-godlevel-backend
```

**Note for Windows CMD:** Use:
```cmd
type database.sql | heroku pg:psql -a nola-godlevel-backend
```

### Method 2: Interactive PostgreSQL Session

1. Connect to your Heroku PostgreSQL database:
```bash
heroku pg:psql -a nola-godlevel-backend
```

2. Once connected, you can either:
   - Copy and paste the contents of `database.sql` directly into the terminal
   - Or run SQL commands one by one

3. To exit, type: `\q`

### Method 3: Using Copy-Paste (For Large Files)

1. Connect to the database:
```bash
heroku pg:psql -a nola-godlevel-backend
```

2. Open your `database.sql` file in a text editor
3. Copy the entire contents
4. Paste into the PostgreSQL terminal session
5. Press Enter to execute

### Method 4: Upload SQL File and Run Remotely

If the file is too large or you're having issues with the above methods:

1. Upload the file to a temporary location (or use a gist)
2. Download and run it remotely:
```bash
curl https://your-file-url/database.sql | heroku pg:psql -a nola-godlevel-backend
```

### Verify Database Setup

After running the SQL script, verify that your tables were created:

1. Connect to the database:
```bash
heroku pg:psql -a nola-godlevel-backend
```

2. List all tables:
```sql
\dt
```

3. Check if data was inserted (example):
```sql
SELECT COUNT(*) FROM brands;
SELECT COUNT(*) FROM stores;
SELECT COUNT(*) FROM products;
```

4. Exit: `\q`

### Common Issues and Solutions

**Issue:** "relation already exists" errors
- **Solution:** Your tables might already exist. Drop them first:
```sql
DROP TABLE IF EXISTS coupon_sales CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS payment_types CASCADE;
-- ... (drop all tables in reverse order of dependencies)
```
Then run your `database.sql` again.

**Issue:** Permission denied or authentication errors
- **Solution:** Make sure you're logged into Heroku CLI: `heroku login`

**Issue:** "No database specified" error
- **Solution:** Make sure the PostgreSQL addon is attached:
```bash
heroku addons -a nola-godlevel-backend
```
If not, add it: `heroku addons:create heroku-postgresql:mini -a nola-godlevel-backend`

**Issue:** SQL file encoding errors
- **Solution:** Ensure your `database.sql` file is UTF-8 encoded

### Importing Additional Data

If you have additional data to import (e.g., from a dump file):

1. **CSV Import:**
```bash
heroku pg:psql -a nola-godlevel-backend
\copy table_name FROM '/path/to/file.csv' WITH CSV HEADER;
```

2. **PostgreSQL Dump:**
```bash
heroku pg:psql -a nola-godlevel-backend < your-dump.sql
```

### Backup Your Heroku Database

It's good practice to backup your database before making changes:
```bash
heroku pg:backups:capture -a nola-godlevel-backend
heroku pg:backups:download -a nola-godlevel-backend
```

---

## 🔍 Troubleshooting

### Backend Issues

**Problem:** App crashes on startup
- Check logs: `heroku logs --tail -a nola-godlevel-backend`
- Verify all environment variables are set
- Ensure database is accessible

**Problem:** Database connection errors
- Verify PostgreSQL addon is attached: `heroku addons -a nola-godlevel-backend`
- Check `DATABASE_URL` is set: `heroku config -a nola-godlevel-backend`

**Problem:** Port binding errors
- Heroku sets `PORT` automatically - make sure your code uses `process.env.PORT`

### Frontend Issues

**Problem:** Build fails
- Check Node.js version compatibility
- Review build logs: `heroku logs --tail -a nola-godlevel-frontend`

**Problem:** API calls failing
- Verify `VITE_API_BASE_URL` is set correctly
- Check CORS settings on backend (should allow your frontend URL)
- Test backend directly: `curl https://your-backend.herokuapp.com/api/dashboard/metrics`

**Problem:** Page shows blank or 404
- Verify `dist` folder is being built correctly
- Check that `vite.config.js` has correct output settings
- Ensure all routes are handled (may need to configure SPA routing)

---

## 📚 Useful Commands

### View Logs
```bash
# Backend
heroku logs --tail -a nola-godlevel-backend

# Frontend
heroku logs --tail -a nola-godlevel-frontend
```

### Open Apps
```bash
heroku open -a nola-godlevel-backend
heroku open -a nola-godlevel-frontend
```

### View Config Variables
```bash
heroku config -a nola-godlevel-backend
heroku config -a nola-godlevel-frontend
```

### Restart Apps
```bash
heroku restart -a nola-godlevel-backend
heroku restart -a nola-godlevel-frontend
```

### Run Commands
```bash
# Run any command in the Heroku environment
heroku run node your-script.js -a nola-godlevel-backend
```

---

## 🔐 Security Notes

1. **JWT_SECRET:** Use a strong, random secret key in production
2. **CORS:** Update CORS settings to only allow your frontend domain
3. **Database:** Don't commit `.env` files with sensitive data
4. **Rate Limiting:** Adjust `API_RATE_LIMIT` based on your needs

---

## 🎯 Next Steps

1. Set up custom domains (if needed)
2. Enable SSL (automatically enabled on Heroku)
3. Set up monitoring and alerts
4. Configure automated deployments from Git
5. Set up staging environment for testing

---

## 📞 Need Help?

- Check Heroku logs: `heroku logs --tail`
- Review Heroku documentation: https://devcenter.heroku.com/
- Check your app status: `heroku ps -a your-app-name`
