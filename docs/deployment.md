# MPLADS Sentinel — Deployment Guide

## Prerequisites

- Node.js >= 18.18.0
- npm >= 9.0.0
- A Supabase project with PostgreSQL 15+

## Environment Setup

### Root & Frontend (`frontend/.env.local`)
```env
VITE_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<YOUR_ANON_KEY>
```

### Backend (`backend/.env`)
```env
PORT=4000
NODE_ENV=production
SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
SUPABASE_ANON_KEY=sb_publishable_<YOUR_ANON_KEY>
# Optional service role key for automated anomaly scan caching:
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>
```

---

## Local Development

From the project root:

```bash
# Install all dependencies across frontend and backend
npm run install:all

# Run both frontend and backend concurrently
npm run dev

# Or run separately in individual terminals:
# Terminal 1: Backend API (http://localhost:4000)
cd backend && npm run dev

# Terminal 2: Frontend Client (http://localhost:5173)
cd frontend && npm run dev
```

---

## Production Build

```bash
# Build backend TypeScript
cd backend && npm run build

# Build frontend production bundle
cd frontend && npm run build
```

The compiled backend is located in `backend/dist/` and runs with `node backend/dist/server.js`.
The optimized frontend assets are in `frontend/dist/` and can be served via Nginx, Vercel, Netlify, or Cloudflare Pages.

---

## Database Migration & Setup

To replicate the schema on a new Supabase instance:

1. Execute SQL schema definitions in `database/schema/`:
   - `01_lok_sabha_projects.sql`
   - `02_rajya_sabha_projects.sql`
   - `03_project_anomaly_results.sql`
2. Create PostgreSQL Stored Procedures in `database/functions/`:
   - `get_dashboard_kpis.sql`
   - `get_distinct_filter_options.sql`
   - `get_constituency_gis_metrics.sql`
   - `get_state_gis_metrics.sql`
   - `get_dataset_anomaly_counts.sql`
3. Apply Row Level Security in `database/policies/rls_policies.sql`.
4. Run dataset seed script:
   ```bash
   node database/seed/migrateToSupabase.js
   ```
