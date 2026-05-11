# Docker Deployment Guide - Sadhana Kala Kendra

This guide explains how to deploy the Sadhana Kala Kendra application using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Git

Install Docker: https://docs.docker.com/install/

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Coderkabish/sadhana-kala-kendra.git
cd sadhana-kala-kendra
```

### 2. Configure Environment Variables

```bash
# Copy the Docker environment template
cp .env.docker .env

# Edit .env with your specific values
nano .env
```

**Key variables to customize:**
- `DB_PASSWORD`: Strong MySQL password
- `DB_ROOT_PASSWORD`: Root MySQL password
- `JWT_SECRET`: Generate with: `openssl rand -base64 32`
- `ADMIN_PASSWORD`: Secure admin panel password
- `FRONTEND_URL`: Your production domain (e.g., https://sadhanakalakendra.com.np)
- `FRONTEND_URLS`: Additional allowed origins (www variant, staging, etc.)

### 3. Start the Application

```bash
# Build images and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Initialize Database (First Run Only)

```bash
# Connect to MySQL and seed initial data (if needed)
docker-compose exec mysql mysql -u root -p"$DB_ROOT_PASSWORD" dswdijkn_sadhana < backend/database/schema1.sql

# Create admin user
docker-compose exec backend node createAdminUser.js
```

### 5. Access the Application

- **Frontend**: http://localhost:3000 (or your domain)
- **Backend API**: http://localhost:5000 (or https://api.your-domain)
- **Health Check**: http://localhost:5000/health

## Service Architecture

```
┌─────────────────────────────────────────────┐
│         Docker Compose Network              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │   Frontend   │  │   Backend    │       │
│  │  (Next.js)   │  │  (Express)   │       │
│  │  Port 3000   │  │  Port 5000   │       │
│  └──────────────┘  └──────────────┘       │
│        │                   │               │
│        └───────────────────┘               │
│                   │                        │
│            ┌──────▼──────┐                │
│            │    MySQL    │                │
│            │  Port 3306  │                │
│            └─────────────┘                │
│                                             │
└─────────────────────────────────────────────┘
```

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v

# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Execute commands in a container
docker-compose exec backend node createAdmin.js
docker-compose exec mysql mysql -u root -p

# Rebuild images after code changes
docker-compose build --no-cache

# Update and restart a specific service
docker-compose up -d --build backend
```

## Production Deployment

### Option 1: Docker on VPS/Server

```bash
# On your server
git clone https://github.com/Coderkabish/sadhana-kala-kendra.git
cd sadhana-kala-kendra
cp .env.docker .env

# Edit .env with production values
nano .env

# Start with automatic restart
docker-compose up -d

# Enable auto-restart on boot
docker-compose up -d --restart-policy on-failure
```

### Option 2: Docker Registry (for CI/CD)

```bash
# Build and push to Docker Hub
docker-compose build
docker tag sadhana-backend:latest youruser/sadhana-backend:latest
docker push youruser/sadhana-backend:latest

# On production server, pull and run
docker pull youruser/sadhana-backend:latest
docker-compose pull
docker-compose up -d
```

### Option 3: Kubernetes Deployment

For large-scale deployments, consider converting to Kubernetes manifests. Key considerations:
- Use ConfigMaps for non-sensitive config
- Use Secrets for passwords and API keys
- Use StatefulSets for MySQL persistence
- Use Deployments for stateless services (frontend, backend)

## Environment Variables Reference

### Database

- `DB_HOST`: MySQL hostname (default: `mysql` in Docker)
- `DB_PORT`: MySQL port (default: `3306`)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database user password
- `DB_ROOT_PASSWORD`: MySQL root password

### Backend

- `NODE_ENV`: Set to `production`
- `PORT`: Backend port (default: `5000`)
- `JWT_SECRET`: Secure secret for JWT tokens (min 32 chars)
- `SESSION_TIMEOUT`: Session timeout in milliseconds (default: `900000` = 15 min)
- `LOG_LEVEL`: Logging level (`debug`, `info`, `warn`, `error`)
- `COOKIE_SAME_SITE`: Cookie SameSite policy (`Lax`, `Strict`, `None`)

### Frontend

- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL accessible from browser
- Can be internal (`http://backend:5000`) or external (`https://api.your-domain`)

### CORS & Security

- `FRONTEND_URL`: Primary frontend domain
- `FRONTEND_URLS`: Comma-separated additional allowed origins
- Example: `https://sadhanakalakendra.com.np,https://www.sadhanakalakendra.com.np`

### Admin

- `ADMIN_USERNAME`: Initial admin username
- `ADMIN_PASSWORD`: Initial admin password
- `ALLOWED_FILE_TYPES`: Comma-separated allowed upload types

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Port already in use: docker-compose ps to check conflicts
# 2. Missing env variables: verify .env file exists
# 3. Database not ready: wait a few seconds and retry
```

### Database connection errors

```bash
# Verify database is running
docker-compose ps mysql

# Check database logs
docker-compose logs mysql

# Test connection
docker-compose exec mysql mysql -u root -p -e "SELECT 1"
```

### Frontend can't reach backend

```bash
# Verify NEXT_PUBLIC_API_BASE_URL
docker-compose logs frontend | grep "API_BASE_URL"

# Test backend from frontend container
docker-compose exec frontend wget -O- http://backend:5000/health
```

### Permission issues with volumes

```bash
# Ensure proper ownership
docker-compose exec backend chown -R nodejs:nodejs /app/uploads /app/logs
```

## Performance Optimization

### Image Size

Backend: ~150MB (Alpine Node.js)
Frontend: ~200MB (Alpine Node.js + Next.js build)

### Memory Usage

- MySQL: ~256MB minimum (configurable)
- Backend: ~100-200MB depending on load
- Frontend: ~100-150MB depending on load

### CPU Limits (Optional)

Add to docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## Backup & Restore

### Backup Database

```bash
docker-compose exec mysql mysqldump -u root -p"$DB_ROOT_PASSWORD" dswdijkn_sadhana > backup.sql
```

### Restore Database

```bash
docker-compose exec mysql mysql -u root -p"$DB_ROOT_PASSWORD" dswdijkn_sadhana < backup.sql
```

### Backup Uploads

```bash
docker cp sadhana-backend:/app/uploads ./uploads_backup
```

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ chars, random)
- [ ] Use strong database passwords
- [ ] Set FRONTEND_URL to your domain
- [ ] Enable HTTPS/SSL (via reverse proxy like Nginx)
- [ ] Keep Docker images updated
- [ ] Don't commit .env file to Git (use .gitignore)
- [ ] Regularly backup database
- [ ] Monitor logs for errors
- [ ] Set appropriate file upload limits
- [ ] Use firewalls to restrict port access

## Support & Debugging

For issues, check:
1. Docker Compose logs: `docker-compose logs -f`
2. Individual service logs: `docker-compose logs -f backend`
3. Container health: `docker-compose ps`
4. Network connectivity: `docker network ls` and `docker network inspect`

## Next Steps

1. Customize the application for your needs
2. Set up SSL/HTTPS via Nginx reverse proxy
3. Configure automated backups
4. Set up monitoring and alerting
5. Plan for scaling (database replication, load balancing)
