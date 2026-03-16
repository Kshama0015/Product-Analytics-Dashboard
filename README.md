# Product Analytics Dashboard

An interactive, self-tracking analytics dashboard built with Flask and React. The dashboard visualizes its own usage — every filter change, chart click, and interaction is tracked and fed back into the visualization.

## Live Demo

- **Frontend:** [https://product-analytics-dashboard-taupe.vercel.app](https://product-analytics-dashboard-taupe.vercel.app)
- **Backend:** [https://product-analytics-dashboard-0vxo.onrender.com](https://product-analytics-dashboard-0vxo.onrender.com)

## Tech Stack

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| Frontend  | React 19, Vite, Tailwind CSS v4, shadcn/ui, Recharts |
| Backend   | Flask, Flask-JWT-Extended, SQLAlchemy, bcrypt    |
| Database  | PostgreSQL (Neon)                                |
| Hosting   | Vercel (frontend), Render (backend)              |

## Run Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL database (or a Neon free-tier instance)

### 1. Clone the repo

```bash
git clone https://github.com/Kshama0015/Product-Analytics-Dashboard.git
cd Product-Analytics-Dashboard
```

### 2. Backend setup

```bash
# Create a .env file in the project root
echo 'DATABASE_URL = postgresql://<user>:<password>@<host>/<db>?sslmode=require' > .env

# Install dependencies
pip install -r requirements.txt

# Seed the database with dummy data
cd backend
python3 seed.py

# Start the server
python3 app.py
```

The backend runs on `http://localhost:5001`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

### 4. Login

Use any seeded user credentials:
- **Password:** `password123`
- **Username:** check the terminal output from `seed.py`, or create a new account via the Sign Up page.

## Seed Instructions

The `backend/seed.py` script populates the database with:
- **5 users** with random usernames, ages, and genders (password: `password123`)
- **100 feature click events** spread across the last 30 days for features: `date_filter`, `gender_filter`, `age_filter`, `bar_chart_zoom`, `line_chart_hover`

Run it with:

```bash
cd backend
python3 seed.py
```

## Architecture

```
├── backend/
│   ├── app.py              # Flask app, CORS, JWT config
│   ├── config.py           # Database engine (SQLAlchemy + dotenv)
│   ├── models.py           # Users & Feature Clicks table definitions
│   ├── seed.py             # Database seeding script
│   └── routes/
│       ├── auth.py         # POST /register, POST /login
│       ├── track.py        # POST /track (JWT-protected)
│       └── analytics.py    # GET /analytics, GET /analytics/daily
│
├── frontend/
│   ├── src/
│   │   ├── api/api.js      # Axios instance with JWT interceptor
│   │   ├── pages/
│   │   │   ├── Login.jsx   # Login & Signup with shadcn Card/Input
│   │   │   └── Dashboard.jsx # Filters, Bar Chart, Line Chart
│   │   └── components/     # shadcn UI components, theme provider
│   └── ...
```

### Key Architectural Choices

- **SQLAlchemy Core (not ORM):** Lightweight table definitions with raw SQL for analytics queries — gives full control over aggregations and JOINs without ORM overhead.
- **JWT stored in localStorage:** Simple auth flow; the Axios interceptor automatically attaches the token to every request.
- **Cookie-based filter persistence:** User's last selected Date Range, Age, and Gender filters are saved to cookies (30-day expiry) and restored on page refresh.
- **Self-tracking pattern:** Every user interaction (filter change, bar click) fires a `POST /track` request that logs the event, which then appears in the analytics on the next data refresh.
- **shadcn/ui + Tailwind CSS v4:** Component library for consistent design, dark/light mode support, and accessible UI primitives.

## Scaling to 1 Million Write-Events Per Minute

If this dashboard needed to handle 1 million write-events per minute, the synchronous `POST /track → INSERT` pattern would not scale. The key changes would be:

1. **Message Queue:** Replace direct database writes with a message broker (Kafka or Redis Streams). The `/track` endpoint would publish events to a topic and return immediately, decoupling the API response time from database write latency.

2. **Batch Inserts:** Consumer workers would read events from the queue in batches (e.g., 1,000–5,000 at a time) and perform bulk `INSERT` operations, dramatically reducing per-row overhead and database round trips.

3. **TimescaleDB or ClickHouse:** Swap PostgreSQL for a time-series or columnar database optimized for high-throughput append-only writes and fast aggregation queries over time-bucketed data.

4. **Horizontal Scaling:** Run multiple stateless API instances behind a load balancer. Since the write path is now async (API → Queue → DB), each instance only needs to publish to the broker, which scales horizontally.

5. **Pre-aggregated Materialized Views:** Instead of computing `COUNT(*) GROUP BY` on every dashboard load, maintain materialized views or rollup tables that incrementally update as new events are consumed, reducing read query cost from O(n) to O(1).

This architecture shifts from a request-per-write model to an event-streaming pipeline, achieving the throughput needed while keeping the API responsive.
