# Deployment & Infrastructure Guide

CineBook AI is architected for frictionless local execution as well as production-grade container orchestration.

---

## Quick Start via Docker Compose (Recommended for Production)

To spin up the complete ecosystem including PostgreSQL 16, Redis 7, FastAPI backend, and React 18 frontend:

```bash
# Clone repository and navigate to root directory
cd mediaamp

# Launch all microservices in detached mode
docker-compose up -d --build

# Inspect container status
docker-compose ps

# View application logs
docker-compose logs -f
```

### Deployed Services
| Service | Container Name | Internal Port | Host Port | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `cinebook_frontend` | 80 | `3000` | Nginx SPA Static Server & Reverse Proxy |
| **Backend** | `cinebook_backend` | 8000 | `8000` | FastAPI REST API & ML Inference Engine |
| **Database** | `cinebook_postgres` | 5432 | `5432` | PostgreSQL 16 Relational Storage |
| **Cache** | `cinebook_redis` | 6379 | `6379` | Redis 7 Distributed Cache & Ephemeral Locks |

---

## Local Development Workflow (Without Docker)

CineBook AI supports dual database engines. For lightning-fast local testing without spinning up PostgreSQL, the default configuration uses high-performance SQLite in WAL (Write-Ahead Logging) mode.

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial database with movies, theatres, screens, shows, and demo users
python -m app.seed

# Train ML recommendation engine
python -m app.ml.train

# Start FastAPI development server with auto-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory in a separate terminal
cd frontend

# Install Node dependencies
npm install

# Start Vite hot-module replacement dev server
npm run dev
```

The frontend will be accessible at: `http://localhost:5173`
The API and Swagger docs will be at: `http://localhost:8000/docs`

---

## Database Migrations (Alembic)

All schema changes are tracked via version-controlled Alembic migrations:

```bash
# Generate a new migration after modifying models in app/models/
alembic revision --autogenerate -m "add_new_audit_columns"

# Apply pending migrations to database
alembic upgrade head

# Rollback one migration revision
alembic downgrade -1
```

---

## Production Hardening & Security Checklist

1. **Database Connection Pooling**:
   - Production PostgreSQL connections are managed with `pool_size=20`, `max_overflow=10`, and `pool_pre_ping=True` to detect and drop stale connections.
2. **CORS Restrictions**:
   - Configure `CORS_ORIGINS` in `.env` to allow only authorized frontend origins (disallowing wildcard `*` in production).
3. **JWT Secret Protection**:
   - Generate a 256-bit cryptographically secure secret via:
     ```bash
     openssl rand -hex 32
     ```
4. **Password Hashing**:
   - Implements direct `bcrypt` hashing with adaptive work factor (12 rounds) and safe 72-byte UTF-8 truncation protection.
5. **Rate Limiting & DDOS Protection**:
   - Fronted by Nginx with `limit_req_zone` configured for sensitive authentication endpoints (`/auth/login`, `/seats/lock`).
