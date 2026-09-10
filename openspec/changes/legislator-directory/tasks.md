## 1. Project Setup

- [x] 1.1 Scaffold `backend/` (FastAPI, Python 3.11+, `uv`/`poetry`/`pip` + `requirements.txt`) and `frontend/` (React via Vite) project structure
- [x] 1.2 Add Open States API key handling via environment variable (e.g. `OPENSTATES_API_KEY`), never committed or exposed to the frontend
- [x] 1.3 Set up local datastore (SQLite, dev-only per project decision) via SQLAlchemy and a migration tool (Alembic)

## 2. Data Model

- [x] 2.1 Define `Jurisdiction` model/table: id, name, classification, seal_url, last_synced_at
- [x] 2.2 Define `Legislator` model/table: id, name, party, chamber, district, jurisdiction_id (FK), image_url
- [x] 2.3 Write initial Alembic migration for both tables

## 3. Open States Sync (`openstates-sync` capability)

- [x] 3.1 Implement an Open States API client wrapper (base URL, `x-api-key` header, pagination handling via `page`/`per_page`)
- [x] 3.2 Implement `sync_jurisdictions()`: fetch `GET /jurisdictions?classification=state`, paginate fully, upsert into `jurisdictions` table
- [x] 3.3 Implement `sync_legislators(jurisdiction_id)`: fetch `GET /people?jurisdiction=<id>`, paginate fully, upsert into `legislators` table with party/chamber/district
- [x] 3.4 Implement `run_full_sync()`: iterate all synced jurisdictions, call `sync_legislators` per jurisdiction, catching and logging per-jurisdiction failures without aborting the run
- [x] 3.5 Update `last_synced_at` per jurisdiction on successful sync
- [x] 3.6 Wire up scheduled sync (APScheduler job or cron-invoked script) running `run_full_sync()` on a configurable interval (default: daily)
- [x] 3.7 Add `POST /sync` admin endpoint (protected by a simple shared-secret/API-key check) that triggers `run_full_sync()` on demand
- [ ] 3.8 Verify against the live API that `/jurisdictions?classification=state` returns 52 jurisdictions; adjust docs/UI copy if the actual count differs (BLOCKED: requires a real `OPENSTATES_API_KEY` — network egress confirmed working, but the API returns 401 without a valid key. Run `curl -H "x-api-key: $OPENSTATES_API_KEY" "https://v3.openstates.org/jurisdictions?classification=state&per_page=1"` and check the `pagination.total_items` field once a key is available.)

## 4. Backend API (`legislator-api` capability)

- [x] 4.1 Implement `GET /api/jurisdictions` — list all jurisdictions with `last_synced_at`
- [x] 4.2 Implement `GET /api/jurisdictions/{jurisdiction_id}/legislators` with optional `party` and `chamber` query filters; 404 for unknown jurisdiction id
- [x] 4.3 Implement `GET /api/jurisdictions/{jurisdiction_id}/party-summary` — party-to-seat-count aggregation
- [x] 4.4 Add Pydantic response schemas for jurisdiction, legislator, and party-summary payloads
- [x] 4.5 Add CORS configuration allowing the frontend's origin
- [x] 4.6 Write API tests covering each endpoint's happy path, filters, and the 404 case

## 5. Frontend (`legislator-directory-ui` capability)

- [x] 5.1 Build jurisdiction picker component (fetches `GET /api/jurisdictions`, lists all 52)
- [x] 5.2 Build legislator list/table component showing name, party, chamber, district for the selected jurisdiction
- [x] 5.3 Add party filter and chamber filter controls wired to the API's query params
- [x] 5.4 Build party-composition summary component (seat counts per party, e.g. simple bar or badge display)
- [x] 5.5 Display `last_synced_at` as a human-readable "last updated" indicator
- [x] 5.6 Add loading and error states for all data fetches (including "no data yet — sync pending" for a jurisdiction with zero legislators)
- [x] 5.7 Add basic responsive styling for the picker, table, and summary views

## 6. Integration & Verification

- [ ] 6.1 Run a full sync locally against the real Open States API and confirm data lands correctly for a sample of jurisdictions (e.g. CA, TX, DC, PR) (BLOCKED: no real `OPENSTATES_API_KEY` available in this environment — see 3.8. Verified instead with seeded sample data: `GET /api/jurisdictions`, `/legislators` incl. party/chamber filters, and `/party-summary` all return correct shapes end-to-end.)
- [x] 6.2 Manually verify the UI end-to-end: pick a jurisdiction, view legislators, apply party/chamber filters, view party summary, view freshness indicator (verified via automated integration test in `frontend/src/App.test.jsx` simulating the full flow against a mocked API, plus a live backend smoke test with seeded data; no browser is available in this environment for a manual click-through — recommend a quick `npm run dev` check once a real API key is set)
- [x] 6.3 Document setup/run instructions (README): env vars, running the sync, starting backend and frontend
