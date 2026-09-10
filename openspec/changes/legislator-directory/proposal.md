## Why

There is no single place to see who currently represents each of the 52 US state-level jurisdictions (50 states + DC + Puerto Rico) tracked by Open States, broken down by party, and kept current as officeholders change after each election cycle. Open States' own API exposes this data but requires per-jurisdiction querying, pagination, and manual party/role parsing — not something a non-technical user can browse. This change proposes a small full-stack app (FastAPI backend, React frontend) that syncs Open States v3 data on a schedule, stores the latest post-election snapshot, and presents it as a browsable, filterable directory of legislators by jurisdiction and party.

## What Changes

- Add a backend sync job that pulls current legislators (`/people`) and jurisdiction metadata (`/jurisdictions`) from the Open States v3 API for all 52 supported jurisdictions and persists the latest snapshot (name, party, chamber, district, jurisdiction).
- Add a scheduled/on-demand refresh mechanism so that when officeholders change after an election (Open States updates `current_role` on its own schedule), the app's data is re-synced rather than served stale.
- Add a FastAPI backend exposing REST endpoints to list jurisdictions, list legislators per jurisdiction (with party/chamber/district filters), and summarize party control per jurisdiction.
- Add a React frontend with a jurisdiction picker (50 states + DC + PR), a legislator list/table view showing name, party, chamber, and district, and a per-jurisdiction party-composition summary (e.g., seats held by party).
- Add local caching/storage (database) of synced data so the app does not call Open States on every page load and stays within the API's rate limits.

## Capabilities

### New Capabilities
- `openstates-sync`: Backend job/service that fetches jurisdictions and current legislators from the Open States v3 API, normalizes party/role/district data, and persists the latest snapshot on a refresh schedule.
- `legislator-api`: FastAPI REST API that serves jurisdictions, legislators (filterable by jurisdiction/party/chamber), and per-jurisdiction party-composition summaries from the synced data store.
- `legislator-directory-ui`: React frontend that lets a user pick a jurisdiction (of the 52 supported), view its current legislators with party affiliation, and see party-composition breakdowns.

### Modified Capabilities
(none — this is a new project with no existing specs)

## Impact

- **New systems**: Python/FastAPI backend service, a relational datastore (e.g. Postgres/SQLite) for the synced snapshot, a scheduled sync job, a React SPA frontend.
- **External dependency**: Open States v3 API (`https://v3.openstates.org`) — requires an API key (`x-api-key` header), and is subject to its rate limits and pagination; sync design must batch/paginate `per_page` requests across all 52 jurisdictions.
- **No existing code affected** — this is a greenfield build in this repository.
