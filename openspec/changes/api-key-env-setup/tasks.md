## 1. Config: key-presence detection

- [x] 1.1 Add `has_openstates_api_key` helper (on `Settings` or as a free function in `app/config.py`) that returns `False` for an empty string and for known placeholder values (`"changeme"`, `"your-api-key-here"`), `True` otherwise
- [x] 1.2 Update `backend/.env.example` so `OPENSTATES_API_KEY` ships blank (with a comment explaining "leave blank to run against mock data") instead of `changeme`
- [x] 1.3 Add unit tests for `has_openstates_api_key` covering: empty string, `changeme`, a real-looking key, whitespace-only value

## 2. Shared client interface

- [x] 2.1 Define a `SyncSource` `Protocol` in `app/services/sync_source.py` with `get_jurisdictions(classification: str = "state") -> list[dict]` and `get_people(jurisdiction_id: str) -> list[dict]`
- [x] 2.2 Confirm `OpenStatesClient` already satisfies `SyncSource` structurally (no changes expected, since `sync_service` already only calls these two methods on it)

## 3. Mock data source

- [x] 3.1 Implement `MockOpenStatesClient` in `app/services/mock_openstates_client.py` implementing `SyncSource`, with no network calls
- [x] 3.2 Seed it with a small fixed dataset (e.g. CA, TX, DC) with a handful of legislators each, matching the real API's per-item dict shape (`id`, `name`, `classification` for jurisdictions; `id`, `name`, `party`, `current_role.org_classification`, `current_role.district` for people)
- [x] 3.3 Add unit tests running `sync_service.run_full_sync()` against `MockOpenStatesClient` directly, asserting jurisdictions/legislators land in the database correctly (reuses the existing sync-service test patterns)

## 4. Client selection wiring

- [x] 4.1 Add `get_sync_source() -> SyncSource` factory in `app/services/sync_source.py`: returns `OpenStatesClient()` when `has_openstates_api_key()` is true, else `MockOpenStatesClient()`
- [x] 4.2 Update `sync_service.run_full_sync()` to use `client or get_sync_source()` instead of `client or OpenStatesClient()`
- [x] 4.3 Add tests for `get_sync_source()`: key present → returns an `OpenStatesClient` instance; key absent/placeholder → returns a `MockOpenStatesClient` instance

## 5. Observability

- [x] 5.1 Add a `data_source: "live" | "mock"` field to the `GET /health` response, derived from `has_openstates_api_key()`
- [x] 5.2 Log a one-time message at the start of `run_full_sync()` stating whether it's running against the live API or mock data
- [x] 5.3 Add a test asserting `GET /health` returns `data_source: "mock"` when no key is configured (default test env) and `"live"` when a key is set via monkeypatched settings

## 6. Documentation & verification

- [x] 6.1 Update `README.md`: explain that the app runs out of the box with mock data when no `OPENSTATES_API_KEY` is set, and that adding a real key switches to live data with no code changes — plus how to check current mode via `GET /health`
- [x] 6.2 Run the full backend test suite and confirm both the mock-mode and live-mode-selection paths are covered (25/25 passing)
- [x] 6.3 Manually run `POST /sync` with no `OPENSTATES_API_KEY` configured and confirm `GET /api/jurisdictions` and `GET /api/jurisdictions/{id}/legislators` return the mock dataset with no network errors
