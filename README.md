# MPLADS Sentinel — National GIS & Anomaly Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Integrated-3ecf8e.svg)](https://supabase.com/)

An enterprise-grade national monitoring, geospatial tracking, and anomaly detection platform for the Member of Parliament Local Area Development Scheme (MPLADS). The platform processes over 144,000 official project records across all 543 Parliamentary Constituencies and 36 States/UTs to deliver transparent oversight, cost anomaly detection, and field officer verification workflows.

---

## Architecture Overview

MPLADS Sentinel is organized into four clearly separated layers:

```
├── frontend/             # React 18 + Vite + TypeScript web application
│   ├── public/           # Static GeoJSON boundary maps (Constituencies & States)
│   ├── src/
│   │   ├── components/   # Official administrative UI components
│   │   ├── pages/        # 12 analytical pages, dashboards, and drill-downs
│   │   ├── services/     # Decoupled database and API client services
│   │   ├── store/        # Zustand state store with real-time house isolation
│   │   ├── types/        # Domain models & TypeScript interfaces
│   │   ├── utils/        # GIS matching, duplicate detection, isolation forest
│   │   └── styles/       # Government-grade aesthetic design system
│   └── package.json
│
├── backend/              # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── api/routes/   # REST routes (/projects, /anomalies, /analytics, /gis)
│   │   ├── controllers/  # Request handlers and HTTP lifecycle
│   │   ├── services/     # Business logic & Supabase database calls
│   │   ├── ml/           # Unsupervised Isolation Forest anomaly detection
│   │   ├── risk/         # Multi-factor deterministic risk engine
│   │   ├── anomaly/      # Rule-based detection & TF-IDF duplicate matching
│   │   └── middleware/   # Validation and strict house isolation guards
│   └── package.json
│
├── database/             # PostgreSQL database schemas, functions, and policies
│   ├── schema/           # Table DDLs (Lok Sabha, Rajya Sabha, Anomaly results)
│   ├── functions/        # High-speed stored procedures (KPIs, GIS, Filters)
│   ├── policies/         # Row-Level Security (RLS) definitions
│   └── seed/             # Automated data migration and seeding pipeline
│
└── docs/                 # Engineering and operational documentation
    ├── architecture.md   # Architectural design, subsystems, and data flows
    ├── data-model.md     # Relational schemas, entity relationships, and indexes
    ├── api.md            # REST API endpoint contracts and payloads
    └── deployment.md     # Production deployment and infrastructure guide
```

---

## Key Capabilities

1. **Strict House Isolation (Constitutional Invariant)**:
   - **Lok Sabha**: 65,000 projects mapped to 543 Parliamentary Constituencies with MP allocations.
   - **Rajya Sabha**: 79,219 projects mapped to 36 States/UTs with state-level MP allocations.
   - Datasets are 100% physically and logically isolated across schemas, queries, and visualizations.

2. **Geospatial Intelligence Map (GIS)**:
   - Interactive SVG/Canvas choropleth visualization using official Survey of India boundaries.
   - Dual aggregation modes: Constituency-level and State-level.
   - Real-time drill-down into district project milestones, expenditure rates, and risk indices.

3. **Multi-Category Anomaly Detection**:
   - **Unsanctioned Works**: Recommended works pending administrative sanction for >180 days.
   - **Stale Status**: Sanctioned works stuck in early milestone phases for >365 days.
   - **Cost Anomalies**: Works with budgets exceeding 2.5× to 5× the median of their category.
   - **Disbursement Mismatches**: Released funds exceeding 100% of sanctioned limits.
   - **Duplicate Project Identification**: Scoped TF-IDF + Cosine similarity detection.

4. **Explainable AI with Feature Attribution**:
   - Ensemble of isolation trees attributing individual risk contributors (progress lag, duration, cost ratio).
   - Clear human verification framing: "Indicators requiring human verification".

5. **Performance Optimized**:
   - Zero static CSV bundling in the frontend client build, reducing initial bundle size to <1MB.
   - PostgreSQL stored procedures (RPCs) computing aggregations in milliseconds.

---

## Quick Start

### Prerequisites
- Node.js >= 18.18.0
- npm >= 9.0.0

### Installation

```bash
# 1. Install backend dependencies
cd backend && npm install

# 2. Install frontend dependencies
cd ../frontend && npm install
```

### Running Locally

```bash
# Terminal 1 — Backend API (runs on http://localhost:4000)
cd backend
npm run dev

# Terminal 2 — Frontend Application (runs on http://localhost:5173)
cd frontend
npm run dev
```

---

## Documentation

- [Architecture & Design System](docs/architecture.md)
- [Data Model & Schemas](docs/data-model.md)
- [REST API Reference](docs/api.md)
- [Deployment & Operations](docs/deployment.md)
- [Database Guide](database/README.md)
- [Backend Services Guide](backend/README.md)

---

## License

Government of India — Ministry of Statistics and Programme Implementation (MoSPI) Public Data Initiative.
