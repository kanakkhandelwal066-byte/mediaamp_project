# CineBook AI — Intelligent Full-Stack Movie & Event Booking Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com)
[![Pytest](https://img.shields.io/badge/Tests-22%20Passed-44CC11.svg?logo=pytest&logoColor=white)](https://pytest.org)

**CineBook AI** is an enterprise-grade full-stack cinema reservation platform inspired by modern ticketing ecosystems (such as BookMyShow), engineered from scratch with clean architecture, strict database-level concurrency controls, an integrated Machine Learning recommendation engine, dual payment processing, and administrative business intelligence.

---

## Technical Highlights & Engineering Pillars

| Pillar | Technical Solution | Implementation Details |
| :--- | :--- | :--- |
| **Concurrency & Seat Locking** | Row-level locking with deterministic sort | `SELECT ... FOR UPDATE` on `show_seats` prevents double-booking. 5-minute atomic TTL lock window with lazy evaluation and automatic sweep. |
| **Backend Pricing Engine** | Single source of truth | Never trusts frontend numbers. Computes base price, tier multiplier (VIP: 1.8x, Premium: 1.3x), coupon discount, 5% convenience fee, and 18% GST on convenience fee. |
| **Payment Integration** | Dual Gateway + Demo Simulator | Paytm Staging Gateway integration alongside an interactive **Demo Payment Simulator** (`SUCCESS`, `FAILURE`, `PENDING`) for friction-free interview evaluations. |
| **Machine Learning Engine** | Hybrid Content + Collaborative | Blends TF-IDF vectorization across metadata (70%) with Item-Item co-occurrence (30%) + popularity fallback + real-time explainability reasons. |
| **Ticket Generation** | Base64 QR Code Boarding Passes | Generates cryptographically secure booking tokens with embedded visual QR codes using `qrcode`. |
| **Admin Dashboard** | Business Intelligence & Analytics | Real-time Recharts visualizations: daily revenue velocity, genre distribution, auditorium occupancy rates, and full booking audit logs. |

---

## Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │    React 18 + TypeScript Client SPA     │
                      │  (Obsidian Theme, Tailwind, Lucide)     │
                      └────────────────────┬────────────────────┘
                                           │ HTTPS / JSON API
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │         FastAPI Backend Server          │
                      │     (Pydantic v2, Python 3.11+)         │
                      └─────┬──────────────┬──────────────┬─────┘
                            │              │              │
           ┌────────────────┘              │              └────────────────┐
           ▼                               ▼                               ▼
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│  PostgreSQL 16 /     │        │  Hybrid ML Recommender│        │  Paytm Gateway &     │
│  SQLite (WAL Mode)   │        │  (TF-IDF + Item Collab│        │  Interactive Demo    │
│  24 Relational Tables│        │   Offline Training)  │        │  Payment Simulator   │
└──────────────────────┘        └──────────────────────┘        └──────────────────────┘
```

---

## Seeded Demo Credentials

For immediate exploration during evaluation or live technical demonstration, the database includes two pre-configured accounts:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Standard User** | `user@cinebook.ai` | `User@123` | Browsing, seat locking, reservations, tickets, recommendations |
| **Platform Admin** | `admin@cinebook.ai` | `Admin@123` | Master control: movie management, theatres, shows, revenue analytics |

*Note: The login page includes one-click autofill buttons for both demo accounts.*

---

## Quick Start (Docker Compose)

The fastest way to launch the full ecosystem (FastAPI, React, PostgreSQL 16, Redis 7):

```bash
# Clone the repository
git clone https://github.com/your-org/mediaamp.git
cd mediaamp

# Spin up all containers
docker-compose up -d --build

# View logs
docker-compose logs -f
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc API Spec**: `http://localhost:8000/redoc`

---

## Local Development Workflow

### 1. Backend Setup (FastAPI & SQLite/Postgres)
```bash
cd backend

# Create and activate Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed 12 movies, 6 cities, 12 theatres, 36 screens, 96 shows
alembic upgrade head
python -m app.seed

# Train the ML recommendation model
python -m app.ml.train

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup (React 18 & Vite)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Automated Test Suite

The backend test suite verifies authentication, movie filtering, seat locking concurrency, pricing logic, payment state transitions, and ML inference:

```bash
cd backend
python -m pytest -v
```

**Results:** `22 passed in 1.84s (100% pass rate)`

---

## Comprehensive Technical Documentation

Explore the detailed engineering documentation located in the `docs/` directory:

1. [**docs/architecture.md**](docs/architecture.md) — System design, Clean Architecture layers, transaction boundaries, and Mermaid diagrams.
2. [**docs/database-schema.md**](docs/database-schema.md) — Full 24-table Entity-Relationship diagram, foreign keys, indexes, and design decisions.
3. [**docs/api-documentation.md**](docs/api-documentation.md) — Complete REST specification covering all 36 OpenAPI endpoints with envelopes and error codes.
4. [**docs/payment-flow.md**](docs/payment-flow.md) — Backend pricing engine formulas, state machine, idempotency, and dual payment mechanics.
5. [**docs/ml-recommendation.md**](docs/ml-recommendation.md) — Hybrid recommendation engine, TF-IDF feature soup, collaborative filtering math, and explainability.
6. [**docs/deployment.md**](docs/deployment.md) — Containerization, production hardening, dual SQLite/PostgreSQL setup, and zero-downtime migrations.
7. [**docs/interview-notes.md**](docs/interview-notes.md) — Senior Architect answers to 18 critical technical interview questions with trade-off analysis.

---

## Postman API Collection

A fully configured Postman collection with 20+ categorized requests and automatic bearer token chaining is available at:
`postman/CineBook_AI.postman_collection.json`

---

## Project Directory Structure

```
mediaamp/
├── backend/                        # FastAPI Backend Application
│   ├── alembic/                    # Database migrations
│   ├── app/
│   │   ├── auth/                   # JWT & Password security, dependencies
│   │   ├── database/               # Session management, connection logic
│   │   ├── ml/                     # Machine Learning engine (TF-IDF + CF)
│   │   │   ├── artifacts/          # Serialized models (.pkl, .npy)
│   │   │   ├── content_based.py
│   │   │   ├── collaborative.py
│   │   │   ├── hybrid.py
│   │   │   └── train.py
│   │   ├── models/                 # 24 SQLAlchemy ORM models
│   │   ├── repositories/           # Clean data access layer
│   │   ├── routers/                # 36 REST API endpoints
│   │   ├── schemas/                # Strict Pydantic v2 validation models
│   │   ├── services/               # Core business & pricing logic
│   │   └── seed.py                 # Comprehensive database seeder
│   ├── tests/                      # Pytest unit and integration test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                       # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/             # Reusable UI components (Navbar, TicketCard, SeatMatrix...)
│   │   ├── hooks/                  # Context providers (useAuth, useCity)
│   │   ├── pages/                  # 22 complete application views
│   │   ├── services/               # Typed Axios API clients
│   │   ├── types/                  # Shared TypeScript interfaces
│   │   ├── App.tsx                 # Client routing & QueryClientProvider
│   │   └── index.css               # Obsidian theme tokens & neon styling
│   ├── Dockerfile
│   └── package.json
├── docs/                           # Exhaustive technical documentation
├── postman/                        # Postman test collection
├── docker-compose.yml              # Multi-container orchestration
└── README.md                       # Master project overview
```

---

## License & Credits
Built for technical interview demonstration. Designed and developed with production-grade engineering principles.
