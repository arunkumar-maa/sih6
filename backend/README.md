# MPLADS Sentinel — Backend API & ML Services

Enterprise Node.js/Express + TypeScript backend serving high-performance REST APIs, statistical rule engines, and machine learning anomaly detection for MPLADS Sentinel.

## Architecture

```
backend/
├── src/
│   ├── api/routes/          # Express route definitions
│   │   ├── projects.routes.ts
│   │   ├── anomalies.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── gis.routes.ts
│   ├── controllers/         # HTTP request/response handlers
│   │   ├── projects.controller.ts
│   │   ├── anomalies.controller.ts
│   │   ├── analytics.controller.ts
│   │   └── gis.controller.ts
│   ├── services/            # Business logic & Supabase database calls
│   │   ├── supabase.service.ts
│   │   ├── projects.service.ts
│   │   ├── anomalies.service.ts
│   │   ├── analytics.service.ts
│   │   └── gis.service.ts
│   ├── ml/                  # Machine learning models (Isolation Forest)
│   ├── risk/                # Deterministic multi-factor risk engine
│   ├── anomaly/             # Rule-based detection & TF-IDF duplicate matcher
│   ├── middleware/          # Validation, error handling, house guards
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Formatters, mathematical helpers
│   └── server.ts            # Application entry point
├── package.json
└── tsconfig.json
```

## Available Scripts

- `npm run dev`: Start backend in watch mode using `tsx`
- `npm run build`: Compile TypeScript to `dist/`
- `npm start`: Run compiled production server

## Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Service health status check |
| `GET` | `/api/projects` | Paginated project records with search & filters |
| `GET` | `/api/projects/filters` | Distinct filter dropdown values (states, categories, etc.) |
| `GET` | `/api/projects/:workId` | Single project details by Work ID |
| `GET` | `/api/anomalies/counts` | Dataset anomaly indicator counts across 5 categories |
| `GET` | `/api/anomalies/projects` | Ranked anomaly records for human verification |
| `POST` | `/api/anomalies/scan` | Run ML + Rule anomaly scan on dataset |
| `GET` | `/api/analytics/kpis` | Aggregated executive KPIs |
| `GET` | `/api/analytics/categories` | Category-wise project counts and amounts |
| `GET` | `/api/gis/constituency` | Constituency-level GIS risk and completion metrics |
| `GET` | `/api/gis/state` | State-level GIS metrics |
