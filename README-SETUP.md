# FitNest Local Development Setup

## Quick Start

### 1. Database Setup

The project supports both **local** and **live** database connections.

#### Local Database (Docker)
```powershell
# Start local PostgreSQL
docker-compose up -d

# Use local database
.\setup-db.ps1 -Mode local
```

#### Live Database (Production)
```powershell
# Connect to live database
.\setup-db.ps1 -Mode live
# Enter your production DATABASE_URL when prompted
```

### 2. Development Servers

```powershell
# Start both web and admin apps
pnpm dev

# Or start individually:
pnpm dev:web    # Web app on http://localhost:3002
pnpm dev:admin  # Admin app on http://localhost:3001
```

## Port Configuration

- **Web App**: http://localhost:3002 (changed from 3000 to avoid conflicts)
- **Admin App**: http://localhost:3001

## Database Connection

The database connection is managed through environment variables:
- `.env` (root)
- `apps/web/.env.local`
- `apps/admin/.env.local`

All use the `DATABASE_URL` environment variable.

### Local Database Details
- **Host**: localhost:5433
- **Database**: fitnest_db
- **User**: fitnest
- **Password**: fitnest_dev_password
- **Connection String**: `postgresql://fitnest:fitnest_dev_password@localhost:5433/fitnest_db`

## Git Configuration

The repository is already connected to the live repo:
- **Remote**: https://github.com/Chibschibs-tech/fitnest-monorepo.git

To push changes:
```powershell
git add .
git commit -m "Your commit message"
git push origin main
```

## Switching Between Databases

Use the setup script to easily switch:
```powershell
# Switch to local
.\setup-db.ps1 -Mode local

# Switch to live
.\setup-db.ps1 -Mode live
```

## Docker Commands

```powershell
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View database logs
docker-compose logs -f postgres

# Access database directly
docker exec -it fitnest-postgres psql -U fitnest -d fitnest_db
```

