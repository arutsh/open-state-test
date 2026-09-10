## Why

The current frontend (`legislator-directory-ui`) is a single flat page — a `<select>`-style jurisdiction picker above a legislator table — with only default browser/basic CSS styling. It has no visual identity, no distinct landing vs. detail experience, and no way to inspect a single legislator without scanning a plain table row. A polished, purpose-built design ("Statehouse Register") has been mocked up and approved, with a jurisdiction-grid landing page, a per-jurisdiction detail page with party-composition visuals and a sortable/filterable roster, and a legislator detail modal. This change reskins the existing frontend to match that mockup using the app's real API data, without touching the backend.

## What Changes

- Replace the single-page picker + table layout with two views: a landing view (searchable grid of jurisdiction cards showing party composition bar, seat counts, and sync freshness) and a per-jurisdiction detail view (chamber composition cards, filter/sort/search roster as a table on desktop and cards on mobile).
- Add a legislator detail modal opened from a roster row, showing name, party, chamber, district, and (when `image_url` is present) a photo, falling back to initials otherwise.
- Adopt the mockup's visual system: "Statehouse Register" masthead/wordmark, Fraunces (headings) + Public Sans (body) via Google Fonts, the mockup's color tokens (party colors for Democratic/Republican/Independent-Other/Vacant, light/dark theme support via `prefers-color-scheme`), and its freshness banner (overall + per-jurisdiction stale warning at >72h).
- Re-implement `JurisdictionPicker`, `LegislatorTable`, `LegislatorFilters`, `PartySummary`, and `FreshnessIndicator` as the new component set (jurisdiction grid/card, chamber composition card, roster table/cards, legislator modal), reusing the existing `api/client.js` calls unchanged.
- **BREAKING**: Removes the existing flat single-view layout and its component structure; anything relying on the current DOM/class structure (e.g. existing component tests) is replaced.
- Scope the legislator modal to fields the real API returns (`name`, `party`, `chamber`, `district`, `image_url`, jurisdiction); the mockup's sample "Contact" (office/phone/email) and "Committees" sections are omitted since the backend has no such fields, and "Sync now" stays a disabled/preview-only control as in the mockup (no admin auth in this frontend).
- Extend `GET /api/jurisdictions` to include a `party_counts` field (seat counts per party) for each jurisdiction, computed server-side in a single grouped query, so the landing grid can render every jurisdiction's composition bar and seat-count summary from one request instead of one request per jurisdiction.

## Capabilities

### New Capabilities
(none — this reskins an existing capability's UI and extends one existing endpoint's response shape; it does not add new backend-facing behavior)

### Modified Capabilities
- `legislator-directory-ui`: Replaces the picker+table layout with a jurisdiction-grid landing page, per-jurisdiction detail page (composition + roster), and legislator modal; adds party-composition visualization, roster search/sort/filter, and per-jurisdiction + overall freshness/staleness indicators. Requirements move from "a picker and a table" to "a landing grid and a detail page with a roster and a modal." Note: `legislator-directory-ui` was defined by the not-yet-archived `legislator-directory` change (`openspec/changes/legislator-directory/specs/legislator-directory-ui/spec.md`); this change's delta spec targets that same capability.
- `legislator-api`: `GET /api/jurisdictions` gains a `party_counts` field (party name → seat count) per jurisdiction, computed server-side, so the frontend can render composition bars for all jurisdictions from a single request rather than one `/party-summary` call per jurisdiction. Note: `legislator-api` was likewise defined by the not-yet-archived `legislator-directory` change (`openspec/changes/legislator-directory/specs/legislator-api/spec.md`); this change's delta spec targets that same capability.

## Impact

- **Affected code**: `frontend/src/App.jsx`, `frontend/src/App.css`, `frontend/src/index.css`, and all of `frontend/src/components/*` (rewritten/replaced); their corresponding `*.test.jsx` files are rewritten for the new structure. `backend/app/schemas/jurisdiction.py` and `backend/app/routers/jurisdictions.py` gain the `party_counts` aggregate, with corresponding backend test updates. No changes to `frontend/src/api/client.js` (it already passes through whatever the jurisdictions endpoint returns) or to any other backend endpoint.
- **New dependency**: Google Fonts (Fraunces, Public Sans) loaded via `<link>` in `frontend/index.html` (or an equivalent local font strategy if the team prefers not to depend on an external font CDN — flagged as an open question in design.md).
- **One additive, backward-compatible API change**: `GET /api/jurisdictions` response gains `party_counts` per jurisdiction; existing fields are unchanged. `GET /api/jurisdictions/{id}/legislators` and `GET /api/jurisdictions/{id}/party-summary` are consumed as-is, unchanged.
