# Docker Setup Guide

This guide explains how to run the NOLA GodLevel application using Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Important

The `docker-compose.yml` file is located in the **root directory** of the project. All commands should be run from the root directory.

## Quick Start

From the root directory of the project:

1. **Start all services:**
   ```bash
   docker-compose up
   ```

2. **Start services in detached mode (background):**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes (fresh start):**
   ```bash
   docker-compose down -v
   ```

## Services

The docker-compose setup includes (container names use `app-` prefix to avoid conflicts):

- **app-db** - PostgreSQL Database
- **app-backend** - Backend API
- **app-frontend** - Frontend Application

Optional services (use `--profile tools` to run):
- **app-data-generator** - Data Generator (runs separately)

## Container Details

- **PostgreSQL Database** (external port 5433, internal port 5432)
  - Database: `challenge_db`
  - User: `challenge`
  - Password: `challenge_2024`
  - The database schema is automatically initialized from `nola-godlevel-backend/database-schema.sql`
  - Note: Port 5433 is used externally to avoid conflicts with other PostgreSQL instances

- **Data Generator** (optional, runs separately)
  - Generates realistic restaurant data using `generate_data.py`
  - Creates stores, products, customers, and sales data
  - Must be run separately using `--profile tools`

- **Backend API** (port 3000)
  - API: http://localhost:3000
  - Health check: http://localhost:3000/health
  - API docs: http://localhost:3000/api-docs

- **Frontend** (port 5173)
  - Application: http://localhost:5173
  - Uses Vite dev server with hot reload

## Accessing the Application

Once all containers are running:
cd
- **Frontend Dashboard:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api-docs

## Troubleshooting

### Database connection issues

If the backend can't connect to the database, make sure:
1. The postgres service is healthy (check with `docker-compose ps`)
2. The backend waits for the database to be ready (healthcheck dependency is configured)

### Rebuild containers

If you make changes to the code and need to rebuild:

```bash
docker-compose up --build
```

### View specific service logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f postgres
```

### Generate data

To populate the database with generated data, you have several options:

#### Option 1: Using Docker (Recommended)

Run from the **root directory** of the project:

**Windows PowerShell:**
```powershell
docker run --rm --network godlevel_app-network -v "${PWD}/nola-godlevel-backend:/app" -w /app python:3.11-slim bash -c "pip install -q -r requirements.txt && python generate_data.py --db-url postgresql://challenge:challenge_2024@postgres:5432/challenge_db"
```

**Windows CMD:**
```cmd
docker run --rm --network godlevel_app-network -v "%cd%/nola-godlevel-backend:/app" -w /app python:3.11-slim bash -c "pip install -q -r requirements.txt && python generate_data.py --db-url postgresql://challenge:challenge_2024@postgres:5432/challenge_db"
```

**Linux/Mac:**
```bash
docker run --rm --network godlevel_app-network \
  -v "$(pwd)/nola-godlevel-backend:/app" \
  -w /app \
  python:3.11-slim \
  bash -c "pip install -q -r requirements.txt && python generate_data.py --db-url postgresql://challenge:challenge_2024@postgres:5432/challenge_db"
```

#### Option 2: Using Docker Compose (Recommended for Container Setup)

Run from the **root directory** where `docker-compose.yml` is located:

**Step 1:** Make sure the database is running:
```bash
docker-compose up -d postgres
```

**Step 2:** Wait for the database to be healthy (about 10-15 seconds), then run the data generator:
```bash
docker-compose --profile tools up data-generator
```

Or build and run in one command:
```bash
docker-compose --profile tools up --build data-generator
```

**Note:** 
- The `--profile tools` flag is required to run the data-generator service
- The service will automatically wait for the database to be ready before starting
- The container will exit when data generation is complete
- You can view logs with: `docker-compose --profile tools logs data-generator`

#### Option 3: Generate data locally (if Python is installed)

If you have Python 3.11+ and pip installed locally, you can run the generator directly:

**Windows:**
```bash
cd nola-godlevel-backend
pip install -r requirements.txt
python generate_data.py --db-url postgresql://challenge:challenge_2024@localhost:5433/challenge_db
```

**Or use the helper script:**
```bash
cd nola-godlevel-backend
run_generate_data.bat
```

**Linux/Mac:**
```bash
cd nola-godlevel-backend
pip install -r requirements.txt
python generate_data.py --db-url postgresql://challenge:challenge_2024@localhost:5433/challenge_db
```

**Or use the helper script:**
```bash
cd nola-godlevel-backend
chmod +x run_generate_data.sh
./run_generate_data.sh
```

**Note:** When running locally, use port `5433` (external port) instead of `5432`.

### Reset database

To start with a fresh database:

```bash
docker-compose down -v
docker-compose up -d
```

Then generate data using one of the options above (Option 1 is recommended).

## Environment Variables

The docker-compose.yml file includes all necessary environment variables. If you need to customize them, you can:

1. Create a `.env` file in the root directory
2. Override specific variables in docker-compose.yml

## Development Tips

- The frontend uses Vite dev server, so changes will hot-reload automatically
- The backend uses `npm start` - for development with auto-reload, you may want to modify the Dockerfile to use `npm run dev` instead
- Database data persists in a Docker volume named `postgres_data`

