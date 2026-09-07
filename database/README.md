# MPLADS Sentinel — Database Architecture

This directory contains the canonical database definitions, schema migrations, stored procedures, and security policies for the MPLADS Sentinel platform hosted on Supabase PostgreSQL.

---

## 1. Table Architecture

### Strict House Isolation
- **`public.lok_sabha_projects`**: Holds 65,000 official Lok Sabha projects.
- **`public.rajya_sabha_projects`**: Holds 79,219 official Rajya Sabha projects.
- **`public.project_anomaly_results`**: Holds derived intelligence records from unsupervised machine learning and rule-based anomaly detection.

> **CRITICAL RULE**: The Lok Sabha and Rajya Sabha datasets must **NEVER** be merged into a single table without explicit partition keys, and queries must always isolate them strictly.

---

## 2. Directory Structure

```
database/
├── schema/
│   ├── 01_lok_sabha_projects.sql       # Schema for Lok Sabha works
│   ├── 02_rajya_sabha_projects.sql      # Schema for Rajya Sabha works
│   └── 03_project_anomaly_results.sql  # Schema for AI anomaly intelligence
├── functions/
│   ├── get_dashboard_kpis.sql          # Fast server-side KPI aggregations
│   ├── get_distinct_filter_options.sql # Distinct dropdown values (State, PC, MP)
│   ├── get_constituency_gis_metrics.sql# 543 PC spatial metrics for Lok Sabha
│   ├── get_state_gis_metrics.sql       # 37 State spatial metrics for Rajya Sabha
│   └── get_dataset_anomaly_counts.sql  # Instant anomaly counts across categories
├── policies/
│   └── rls_policies.sql                # Row Level Security (RLS) policies
├── seed/
│   └── migrateToSupabase.js            # Batch migration script from raw CSVs
└── README.md
```

---

## 3. High-Performance Stored Procedures (RPCs)

All heavy aggregations are computed directly inside PostgreSQL to ensure $<50\text{ms}$ latency without downloading 144,219 rows into the browser:

1. `get_dashboard_kpis(p_house, ...filters)`: Calculates total works, sanctioned sum, disbursed sum, completion rate, and risk tier distribution.
2. `get_constituency_gis_metrics(...filters)`: Pre-aggregates works across all 543 Parliamentary Constituencies for instant choropleth coloring.
3. `get_state_gis_metrics(...filters)`: Pre-aggregates works across all 37 States/UTs for Rajya Sabha representation.
4. `get_dataset_anomaly_counts(p_house)`: Computes exact anomaly counts for Unsanctioned Works, Stale Status, Cost Outliers, and Disbursement Mismatches in $<10\text{ms}$.

---

## 4. Row Level Security (RLS)

- **SELECT**: Publicly accessible using the Supabase publishable key (`anon` role).
- **UPDATE**: Officers can update verification status (`verification_status`, `verification_history`) without exposing service credentials.
- **INSERT/DELETE**: Restricted to derived intelligence tables (`project_anomaly_results`). Raw project tables are read-only to preserve dataset integrity.
