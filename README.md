# Legislator Directory

Browse current state legislators across the 52 Open States jurisdictions
(50 states + DC + Puerto Rico), with party affiliation and a
party-composition summary per jurisdiction. Data is synced from the
[Open States v3 API](https://v3.openstates.org/docs) into a local
datastore so the app stays fast and doesn't hit Open States on every
page view.

- **Backend:** FastAPI + SQLAlchemy + SQLite (dev-only) + Alembic
- **Frontend:** React (Vite)

## Prerequisites

- Python 3.11+ and [`uv`](https://github.com/astral-sh/uv) (or `pip`)
- Node.js 18+
- An [Open States API key](https://openstates.org/account/profile/)
  (free) — optional, see below

## Backend setup

```bash
cd backend
uv venv .venv
uv pip install -r requirements.txt --python .venv/bin/python

cp .env.example .env
# leave OPENSTATES_API_KEY blank to run on mock data, or set it to a
# real key to sync live data -- see "Live data vs. mock data" below

.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

The API is now running at http://localhost:8000 (interactive docs at
`/docs`). On startup it also schedules a background sync every
`SYNC_INTERVAL_HOURS` (default 24).

### Live data vs. mock data

The app runs out of the box with **no API key required**. Whether a
sync hits the real Open States API or a small built-in mock dataset is
decided automatically from `OPENSTATES_API_KEY` — no code changes
either way:

- **Blank, unset, or left as the `.env.example` placeholder** → the
  sync uses `MockOpenStatesClient`, a fixed sample of a few
  jurisdictions (CA, TX, DC) and legislators. No network call is made.
- **Set to a real key** → the sync uses `OpenStatesClient` and calls
  the live `GET /jurisdictions` and `GET /people` endpoints.

Check which mode is active anytime:

```bash
curl http://localhost:8000/health
# -> {"status":"ok","data_source":"mock"}   (or "live")
```

The active mode is also logged once at the start of every sync run.

### Running a sync

The database starts empty. Trigger a sync manually (the scheduled job
will also run automatically at the configured interval):

```bash
curl -X POST http://localhost:8000/sync \
  -H "x-admin-token: dev-sync-token"
```

`x-admin-token` must match `SYNC_ADMIN_TOKEN` in `backend/.env`
(defaults to `dev-sync-token`). The sync runs in the background; check
`GET /api/jurisdictions` afterwards to see `last_synced_at` populate
per jurisdiction. Re-run this any time after an election to refresh
officeholders (with a real key configured).

### Backend tests

```bash
cd backend
.venv/bin/python -m pytest tests/ -v
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL defaults to http://localhost:8000
npm run dev
```

Open the printed local URL (default http://localhost:5173). Pick a
jurisdiction to see its current legislators, filter by party/chamber,
and view the party-composition summary and last-synced indicator.

### Frontend tests

```bash
cd frontend
npm run test
```

## Notes

- Dev environment only: the datastore is SQLite via
  `DATABASE_URL=sqlite:///./legislator_directory.db` in
  `backend/.env`. A production deployment would point `DATABASE_URL`
  at Postgres instead.
- Open States v3 covers state/territorial legislatures only — not the
  US Congress.
