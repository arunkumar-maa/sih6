# MPLADS Sentinel — API Specification

## Base URL

Local Development: `http://localhost:4000/api`

## General Conventions

- All requests and responses use `application/json`.
- Standard response wrapper:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- Error format:
  ```json
  {
    "success": false,
    "error": {
      "message": "Error description",
      "statusCode": 400,
      "path": "/api/projects",
      "timestamp": "2026-09-07T08:50:00.000Z"
    }
  }
  ```

---

## 1. Projects API

### `GET /api/projects`
Retrieve paginated and filtered MPLADS project records.

#### Query Parameters:
- `house` (string, optional): `"Lok Sabha"` (default) or `"Rajya Sabha"`.
- `page` (number, optional): Page index starting at 1 (default: 1).
- `pageSize` (number, optional): Number of records per page (default: 20, max: 100).
- `search` (string, optional): Search keyword matching Work ID, description, MP, or constituency.
- `state` (string, optional): State filter (e.g. `"Tamil Nadu"`).
- `district` (string, optional): District filter.
- `constituency` (string, optional): Parliamentary constituency filter.
- `category` (string, optional): Work category filter.
- `status` (string, optional): Milestone status filter (`"Work Completed"`, `"Sanction"`, etc.).
- `sortBy` (string, optional): Field name (`"sanction_amount"`, `"risk_score"`, `"days_since_sanction"`).
- `sortOrder` (string, optional): `"asc"` or `"desc"`.

#### Response:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "workId": "TN/2024-2025/10492",
        "workCategory": "Roads & Bridges",
        "state": "Tamil Nadu",
        "constituency": "Chennai Central",
        "sanctionAmount": 2500000,
        "totalPaid": 1200000,
        "workStatus": "Work In Progress",
        "risk": {
          "score": 42,
          "level": "MEDIUM"
        }
      }
    ],
    "totalCount": 65000,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3250
  }
}
```

### `GET /api/projects/:workId`
Retrieve a single project record by its Work ID.

---

## 2. Anomalies API

### `GET /api/anomalies/counts`
Retrieve aggregate counts for all 5 anomaly detection categories.

#### Query Parameters:
- `house` (string, optional): `"Lok Sabha"` (default) or `"Rajya Sabha"`.

#### Response:
```json
{
  "success": true,
  "data": {
    "pending": 45,
    "stale": 82,
    "cost": 64,
    "disbursement": 38,
    "vendor": 0
  }
}
```

### `GET /api/anomalies/projects`
Retrieve ranked projects flagged under a specific anomaly category.

#### Query Parameters:
- `house` (string): `"Lok Sabha"` or `"Rajya Sabha"`.
- `category` (string): `"stale"`, `"cost"`, `"disbursement"`, or `"pending"`.
- `limit` (number, optional): Max records (default: 25).
- `offset` (number, optional): Offset for pagination (default: 0).

### `POST /api/anomalies/scan`
Trigger an on-demand Machine Learning + Rule Engine scan across the specified house.

---

## 3. Analytics API

### `GET /api/analytics/kpis`
Retrieve executive KPIs for the active house and optional filters.

#### Response:
```json
{
  "success": true,
  "data": {
    "total": 65000,
    "totalSanctionAmount": 14258900000,
    "totalDisbursed": 9824300000,
    "completed": 41200,
    "highRisk": 1840,
    "medRisk": 7450,
    "lowRisk": 55710,
    "avgRiskScore": 24
  }
}
```

---

## 4. GIS API

### `GET /api/gis/constituency`
Retrieve aggregated risk, completion, and financial metrics grouped by Parliamentary Constituency.

### `GET /api/gis/state`
Retrieve aggregated metrics grouped by State/UT boundary.
