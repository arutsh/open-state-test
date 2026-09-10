## Context

Open States (`https://v3.openstates.org`) is the external source of truth for current state-level legislators across 50 states, DC, and Puerto Rico (52 jurisdictions total). Its `/people` endpoint reflects `current_role` as Open States' own scrapers update it after elections and swearing-in, so "latest data after elections" means: sync frequently enough, and re-sync on demand, rather than relying on a one-time import. The API requires an `x-api-key`, is paginated (`page`/`per_page`), and returns bills/committees/events data we don't need — this design scopes usage to `/jurisdictions` and `/people` only.

This is a greenfield build: FastAPI backend, React frontend, no existing code in this repo.

## Goals / Non-Goals

**Goals:**
- Show, per jurisdiction (of the 52 supported), the current legislators with name, party, chamber, and district.
- Show a party-composition summary per jurisdiction (seats by party, e.g. "R: 22, D: 18").
- Keep data reasonably fresh after elections without hitting Open States on every page view.
- Ship a working FastAPI + React vertical slice that can be extended later (bill tracking, committees, etc. are out of scope now).

**Non-Goals:**
- Bills, committees, events, or historical/past-term legislators — only current officeholders.
- Federal Congress members — Open States v3 covers state/territorial legislatures only, not the US House/Senate. "52 jurisdictions" here = 50 states + DC + Puerto Rico as returned by `/jurisdictions?classification=state`.
- Real-time push updates — periodic + manual refresh is sufficient; election results don't change minute-to-minute.
- User accounts, auth, or write operations — this is a read-only public data viewer.

## Decisions

**1. Sync-and-cache, not live proxy.** The backend syncs Open States data into its own database rather than calling Open States on every frontend request. Scope for this project is dev-only, so the datastore is SQLite (via SQLAlchemy); a production deployment would swap the `DATABASE_URL` to Postgres, but that migration is out of scope here.
- Why: Open States rate-limits API keys; a live proxy would multiply request volume by every page view and add external latency to every user interaction.
- Alternative considered: proxy + short-lived in-memory cache — rejected because it doesn't survive restarts and still risks rate-limit bursts during traffic spikes.

**2. Full re-sync per run, not incremental diffing.** Each sync pulls all current people for all 52 jurisdictions and upserts by Open States person `id`, rather than tracking deltas via `updated_since`-style filters (which `/people` doesn't actually support — only `/bills` has `updated_since`).
- Why: `/people` has no `updated_since` filter, so incremental sync isn't available from the API itself; a full re-sync (52 jurisdictions × ~1-2 pages each at `per_page=50`) is small enough to run in minutes.
- Alternative considered: scrape `current_role` change timestamps — not exposed; not viable.

**3. Sync trigger: scheduled job + manual admin endpoint.** A background scheduler (APScheduler, or a simple cron-triggered script) runs the full sync on a fixed interval (e.g., daily), plus a protected `POST /sync` endpoint to trigger an immediate re-sync after a known election-results update.
- Why: elections are infrequent and their result-certification timing is unpredictable, so a human-triggered refresh right after certification is more useful than trying to guess an update cadence purely from polling.
- Alternative considered: webhook from Open States — not offered by their API.

**4. Data model mirrors Open States' shape, denormalized for query speed.** Store `jurisdictions` (id, name, classification, seal_url) and `legislators` (id, name, party, jurisdiction_id, chamber, district, image_url, last_synced_at) as two tables; party and chamber stored as plain strings (not enums) since Open States' own vocabulary can include third parties and independents.
- Why: keeps the read API simple (`GET /jurisdictions/{id}/legislators?party=&chamber=`) and avoids brittle enum mismatches when a new minor party appears.
- Alternative considered: normalize party into its own table — rejected as unnecessary complexity for a read-mostly directory.

**5. Frontend fetches from our FastAPI backend only, never Open States directly.** React never holds the Open States API key; all data comes from our own REST endpoints.
- Why: keeps the API key server-side and secret, and lets the backend own caching/rate-limit behavior.

## Risks / Trade-offs

- [Open States' own data lags real-world election results by however long their scrapers take to update] → Mitigate by exposing `last_synced_at` per jurisdiction in the UI so users know data freshness, and by supporting a manual re-sync trigger.
- [Sync job partially fails mid-run (e.g., Open States 5xx on jurisdiction #30 of 52)] → Sync per-jurisdiction with independent try/catch and partial commit; log failures and retry only the failed jurisdictions on next run, rather than failing the whole batch.
- [Open States rate limits (free tier is limited requests/day)] → Batch at `per_page=50` (or max allowed), sync once daily by default, and surface a clear error if the sync job hits a 429.
- [51st/52nd jurisdiction definition assumption] → Confirm at implementation time via `GET /jurisdictions?classification=state` that the returned count is exactly 52; if Open States' coverage differs (e.g., excludes PR or includes additional territories), adjust the proposal's scope accordingly rather than hardcoding "52" in code.

## Migration Plan

Not applicable — greenfield build, no existing data or deployed service to migrate. Initial rollout is: stand up backend + DB, run first full sync, deploy frontend pointed at backend.

## Open Questions

- Confirm exact jurisdiction count/list returned by Open States today (validate the "52" assumption against the live `/jurisdictions` response before finalizing the UI's jurisdiction picker).
- Confirm Open States free-tier rate limit numbers to size the sync interval correctly (their published limits should be checked at implementation time via their API key dashboard).
- Decide hosting for the scheduler (in-process APScheduler within the FastAPI app vs. a separate cron/worker process) — deferred to tasks/implementation.
