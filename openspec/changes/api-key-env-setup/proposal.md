## Why

The sync service currently only works with a real `OPENSTATES_API_KEY`. Without one — a fresh clone, local dev, CI, or a quick demo — `POST /sync` fails against the live Open States API (confirmed: it returns `401` for `GET /jurisdictions?classification=state` with no key) and the app has no data to show. This blocked two verification tasks in the `legislator-directory` change (3.8 and 6.1) and forced a manual, throwaway data-seeding workaround just to demo the UI. The app should run out of the box with realistic sample data when no key is configured, and automatically switch to the real Open States API the moment a key is supplied — with no code change required to flip between the two.

## What Changes

- Add a single point of API-key detection: if `OPENSTATES_API_KEY` is set to a real (non-empty, non-placeholder) value, the sync service uses the existing `OpenStatesClient`, which calls the real `GET /jurisdictions?classification=state` and `GET /people` endpoints exactly as documented.
- If no key is configured, the sync service instead uses a new built-in mock client that returns a fixed, realistic sample dataset (a representative set of jurisdictions and legislators with party/chamber/district data) with the same shape the real client returns — no network call is made.
- The chosen mode is selected once (at client-construction time), not per-request, so a sync run is either fully live or fully mocked.
- Expose the active data source (`"live"` or `"mock"`) via `GET /health` so it's easy to confirm which mode is active without reading logs, and log it once at sync time.
- Update `.env.example` so the "no key configured" state is unambiguous (blank/commented value) rather than the current `changeme` placeholder, which would otherwise be mistaken for a real key.
- Update the README to document both modes and how to switch between them.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `openstates-sync`: the sync service's client-selection requirement changes — it must now choose between the real Open States API client and a built-in mock client based on whether a valid `OPENSTATES_API_KEY` is configured, and must expose which mode is active.

Note: `openstates-sync` was introduced in the still-open `legislator-directory` change (not yet archived to `openspec/specs/`), not in an archived main spec. This change's delta spec is written against that change's spec content and should be reconciled with it (e.g. via `/opsx:sync`) once both changes are implemented.

## Impact

- **Affected code**: `backend/app/services/openstates_client.py` (extract a shared interface), new `backend/app/services/mock_openstates_client.py`, `backend/app/services/sync_service.py` (client selection), `backend/app/config.py` (key-presence check), `backend/app/main.py` (`/health` data-source field), `backend/.env.example`, `README.md`.
- **Tests**: existing sync-service tests already use a fake client via dependency injection, so no test rewrite is required there; new tests cover the selection logic itself (key present → live client, key absent/placeholder → mock client) and the `/health` field.
- **No breaking changes**: existing behavior with a real key configured is unchanged; the only new behavior is what happens when no key is present (previously: failure; now: mock data).
