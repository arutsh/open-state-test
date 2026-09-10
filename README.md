# Legislator Directory

Browse current state legislators across the 52 Open States jurisdictions
(50 states + DC + Puerto Rico), with party affiliation and a
party-composition summary per jurisdiction. Data is synced from the
[Open States v3 API](https://v3.openstates.org/docs) into a local
datastore so the app stays fast and doesn't hit Open States on every
page view.

- **Backend:** FastAPI + SQLAlchemy + SQLite (dev-only) + Alembic
- **Frontend:** React (Vite)

## What's implemented

Built in three stages, each tracked as an OpenSpec change under
`openspec/changes/` (see each one's `proposal.md`/`tasks.md` for full detail):

1. **`legislator-directory`** — the core app: a FastAPI backend that syncs
   jurisdictions and current legislators from the Open States v3 API into
   SQLite on a schedule, REST endpoints for jurisdictions / legislators
   (filterable by party & chamber) / party-summary, and a React frontend to
   browse them.
2. **`api-key-env-setup`** — makes the app runnable with zero configuration:
   with no `OPENSTATES_API_KEY` set, sync falls back to a built-in mock
   dataset (CA, TX, DC) instead of failing; a real key switches to live data
   with no code change. Active mode is visible via `GET /health`.
3. **`frontend-reskin`** — replaced the original flat picker+table UI with a
   searchable landing grid of jurisdiction cards (composition bars, freshness
   banner), a per-jurisdiction detail view (chamber composition cards,
   sortable/filterable roster, desktop table / mobile cards), and a
   legislator detail modal. Also added a `party_counts` aggregate to
   `GET /api/jurisdictions` so the landing grid renders from a single request.

A few tasks were left explicitly incomplete or blocked rather than silently
skipped — e.g. verifying jurisdiction counts against the live Open States API
(needs a real API key, tracked as `legislator-directory` 3.8/6.1) and a
manual keyboard-only navigation pass (`frontend-reskin` 8.3). Each is called
out in its change's `tasks.md`.

## Process notes & known gaps (read before relying on this)

All code in this repo was AI-generated (via Claude Code) from the OpenSpec
proposals above. What I actually did:

- Wrote/refined the OpenSpec proposals, and reviewed the resulting app
  visually — ran it, clicked through the flows, compared the reskin against
  the approved mockup.
- **I did not read the generated code line-by-line, run a manual code review
  pass, or run an AI-assisted code review on it.** Beyond what the automated
  test suites check, I have no confidence in its correctness, security, or
  edge-case handling.
- It looks right and the test suites pass, so I'd call it good enough to
  demo to a potential customer for early feedback — but it should be treated
  as an MVP prototype, not production-ready code.

What I intended to do but didn't get to, due to time constraints:

- **Code review before every commit.** Everything here landed in two large
  commits directly on `main` (see `git log`) instead of a reviewed
  branch/PR per change.
- **A branch-per-change workflow**, where each OpenSpec change ships on its
  own branch and only merges to `main` after review and a passing CI run.
- **CI/CD via GitHub Actions.** There's no `.github/workflows/` in this repo
  yet. The intent is a pipeline that runs on every push/PR: backend
  `pytest`, frontend `npm test` + lint, and end-to-end tests (once added) —
  all required to pass before merging to `main`.
- **A real, repeatable end-to-end test suite.** Frontend verification (see
  `frontend-reskin` task 8) was done via one-off scripted Playwright passes
  and manual screenshot review during development, not an e2e suite checked
  into the repo and run in CI.
- Live-API verification (`legislator-directory` 3.8, 6.1) is still blocked
  on a real `OPENSTATES_API_KEY`.

Before this goes beyond a demo: get a human (or AI) code review done on the
existing code, stand up the branch + CI workflow above, and add a checked-in
e2e suite.

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
