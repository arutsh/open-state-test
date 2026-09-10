## Context

`backend/app/services/openstates_client.py` (`OpenStatesClient`) calls the real Open States v3 API — `GET /jurisdictions?classification=state` and `GET /people?jurisdiction=<id>` — and `sync_service.run_full_sync()` constructs one directly (`client = client or OpenStatesClient()`) when no client is injected. This works, but only with a real `OPENSTATES_API_KEY`; confirmed via `curl` that the live endpoint returns `401` with no key. `backend/.env.example` currently ships `OPENSTATES_API_KEY=changeme`, which is truthy but not a real key — so a naive "is it set" check would misreport mock-vs-live status for anyone who just copies the example file.

Tests already avoid this problem by injecting a `FakeOpenStatesClient` test double directly into `sync_jurisdictions`/`sync_legislators`/`run_full_sync`. This change reuses that same seam for a *runtime* (not just test-time) mock, so the app is self-sufficient without secrets and the switch to live data requires zero code changes — only setting a real key.

## Goals / Non-Goals

**Goals:**
- Zero-config runnable app: with no `OPENSTATES_API_KEY` set (or left as an obvious placeholder), sync produces a small, realistic, stable sample dataset instead of failing.
- Zero-code-change promotion to live data: setting a real key and restarting the backend is sufficient to start hitting the real Open States API — same code path, same `sync_service` logic, only the client implementation differs.
- Make the active mode observable (`GET /health`, and a log line at sync time) so nobody mistakes mock data for real officeholders.

**Non-Goals:**
- Validating that a *configured* key is actually correct/authorized. If a key is present but wrong, the existing per-jurisdiction failure handling in `run_full_sync` already logs and continues — this change does not add key-validity probing or auto-fallback from a bad live key to mock mode.
- Making the mock dataset configurable/extensible (custom fixtures, per-test overrides) — it's a fixed, small, illustrative dataset, distinct from the `FakeOpenStatesClient` test double which stays test-only.
- Changing anything about the scheduled sync's cadence, the `/sync` admin endpoint's auth, or the data model.

## Decisions

**1. Extract a `SyncSource` protocol; `OpenStatesClient` and a new `MockOpenStatesClient` both implement it.** `sync_service` already only calls `.get_jurisdictions()` and `.get_people(jurisdiction_id)` on whatever client it's given (that's exactly the seam the tests use). Formalize that as a `typing.Protocol` in `app/services/sync_source.py` with those two methods, so the two implementations are interchangeable and the type is explicit rather than implicit/duck-typed.
- Alternative considered: subclass `OpenStatesClient` and override the HTTP calls — rejected, since a subclass implies shared behavior/state the mock doesn't need (base URL, headers, pagination), and a plain sibling class implementing the same protocol is simpler.

**2. A factory function decides live vs. mock: `get_sync_source() -> SyncSource`.** Lives in `app/services/sync_source.py` next to the protocol. Checks `Settings.openstates_api_key`: a real key (see decision 3) → `OpenStatesClient()`; otherwise → `MockOpenStatesClient()`. `sync_service.run_full_sync()` calls this factory when no client is injected (`client = client or get_sync_source()`), replacing the current `client or OpenStatesClient()`. The `POST /sync` route and the scheduler both go through `run_full_sync()` unchanged, so they automatically pick up whichever mode is active — no call-site changes needed there.
- Alternative considered: an environment-variable feature flag (`SYNC_MODE=mock|live`) independent of key presence — rejected as redundant complexity; the key's presence is already the natural, single signal, and a separate flag creates a state (`SYNC_MODE=live` with no key) that would just fail anyway.

**3. "No key" means empty/placeholder, not just falsy.** `Settings` gets a small helper, `has_openstates_api_key`, that returns `False` for `""` and for a fixed set of obvious placeholder strings (`"changeme"`, `"your-api-key-here"`), `True` otherwise. `.env.example`'s `OPENSTATES_API_KEY=changeme` is replaced with `OPENSTATES_API_KEY=` (blank, commented above) so the common case — copy the example, don't edit it — reads as "no key" both to a human skimming the file and to this check.
- Alternative considered: treat any non-empty string as "has a key" — rejected because it silently misclassifies the current `.env.example` default as live mode, which is the exact confusion this change exists to remove.

**4. Mock dataset: small, fixed, and shaped exactly like the real API's parsed output.** `MockOpenStatesClient.get_jurisdictions()`/`.get_people(jurisdiction_id)` return the same `list[dict]` shapes `sync_service` already expects from `OpenStatesClient` (i.e. the per-item dict shape documented in the Open States v3 schema: `id`, `name`, `classification` for jurisdictions; `id`, `name`, `party`, `current_role.{org_classification,district}` for people) — not the raw paginated envelope, since `_get_all_pages` already unwraps that for the real client and callers only ever see the flat list. Ship a handful of jurisdictions (e.g. CA, TX, DC) with a few legislators each, matching the sample data already used for manual verification in the `legislator-directory` change, so `run_full_sync()` against mock mode exercises the same code paths (upsert, stale-legislator removal, party-summary aggregation) as a real sync would.
- Alternative considered: generate a full 52-jurisdiction mock dataset — rejected as unnecessary bulk for a fallback whose only job is "prove the app works and let someone click around"; a small set already exercises every code path.

**5. Expose the mode via `GET /health`, not a separate endpoint.** Add a `data_source: "live" | "mock"` field to the existing health response rather than introducing a new route, since it's a single cheap fact and `/health` is already the place a caller checks "is this thing up and in what state."
- Alternative considered: only log it — rejected, since the whole point is to make the mode checkable without reading server logs (e.g. from the frontend, or a quick `curl`).

## Risks / Trade-offs

- [Someone mistakes mock data for real officeholders] → `GET /health`'s `data_source` field plus a one-time log line ("Sync running in MOCK mode — no OPENSTATES_API_KEY configured") at the start of `run_full_sync()`; documented prominently in the README.
- [Placeholder-string detection is a hardcoded list and could miss a new placeholder convention] → Keep the list short and specific to what this repo's own `.env.example` ships, not an attempt at general secret-detection; revisit only if a real placeholder string starts slipping through in practice.
- [Mock dataset drifts from the real API's actual shape over time if Open States changes its schema] → It mirrors the same dict shape `sync_service` already consumes (verified against the live OpenAPI schema during the `legislator-directory` change), so a schema change would surface as a test failure in the shared `sync_service` tests, not a silent mismatch.

## Migration Plan

No data migration. Deploy order: ship the `SyncSource` protocol + `MockOpenStatesClient` + factory, switch `sync_service`'s default client construction to the factory, update `.env.example`. Existing deployments with a real key already set are unaffected (same live path, same `OpenStatesClient`); anyone with no key or the old `changeme` placeholder will start getting mock data on their next sync instead of a `401` failure. Rollback is a plain revert — no schema or persisted-state changes involved.

## Open Questions

- None outstanding — scope is deliberately narrow (client selection + visibility), leaving key-validity checking and a richer/configurable mock dataset as explicit non-goals above.
