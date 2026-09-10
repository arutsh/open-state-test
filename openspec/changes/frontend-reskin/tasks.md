## 1. Backend: jurisdiction party-count aggregate

- [x] 1.1 Add `party_counts: dict[str, int]` to `JurisdictionOut` (`backend/app/schemas/jurisdiction.py`)
- [x] 1.2 Update `list_jurisdictions` in `backend/app/routers/jurisdictions.py` to compute per-jurisdiction party counts in a single grouped query (group legislators by `jurisdiction_id`, `party`) and attach the result to each jurisdiction response, defaulting to `{}` for a jurisdiction with no synced legislators yet
- [x] 1.3 Add/extend backend tests for `GET /api/jurisdictions` covering `party_counts` for a jurisdiction with legislators and one with none

## 2. Foundations: tokens, fonts, utilities

- [x] 2.1 Add Google Fonts `<link>` tags (Fraunces, Public Sans) to `frontend/index.html`
- [x] 2.2 Replace `frontend/src/index.css` with the mockup's design token system: `:root` color tokens, `prefers-color-scheme: dark` override block, `[data-theme]` override block, base reset (`box-sizing`, `body` font/background/color, `h1`/`h2`/`h3` using Fraunces, focus-visible outline, `::selection`, reduced-motion guard)
- [x] 2.3 Add a `bucketOf(party)` utility (e.g. `frontend/src/lib/party.js`) mapping the API's free-text `party` string to `dem` | `rep` | `ind` | `vacant`, plus a party-display-label helper ("Democratic", "Republican", "Independent / Other")
- [x] 2.4 Add a freshness utility module (e.g. `frontend/src/lib/freshness.js`): `formatRelative(iso)` (human-readable "N minutes/hours/days ago") and `isStale(iso)` (>72h threshold), unit tested directly

## 3. Landing view: jurisdiction grid

- [x] 3.1 Build `JurisdictionCard` component: name, classification pill, proportional party-composition bar and seat-count summary (from the jurisdiction's `party_counts` field returned by `fetchJurisdictions()`), per-jurisdiction "Synced Xh ago" footer (styled as overdue when `isStale`)
- [x] 3.2 Build `JurisdictionGrid` component: fetches/receives jurisdictions (already carrying `party_counts`), renders a responsive card grid, wires card selection to open the detail view
- [x] 3.3 Add landing-view search input filtering the grid by jurisdiction name (case-insensitive), with an empty state when no jurisdiction matches
- [x] 3.4 Add a coverage note ("Showing N of 52 jurisdictions...") reflecting the filtered count
- [x] 3.5 Build `FreshnessBanner` component: overall "most recently synced" summary plus a list of any stale jurisdictions by name, rendered above the landing grid

## 4. Detail view: header, composition, roster toolbar

- [x] 4.1 Add `view`/`selectedJurisdictionId` state to `App.jsx` (or a small state hook) to switch between landing and detail views without a router; wire the jurisdiction card and a back control to transition between them
- [x] 4.2 Build the detail view header: seal/initials badge, jurisdiction name, classification, per-jurisdiction freshness (styled as overdue when stale), disabled "Sync now" control (mirroring the mockup's preview-only treatment)
- [x] 4.3 Build `ChamberCompositionCard`: one per chamber, proportional composition bar plus a labeled seat-count row per party bucket, computed client-side from the detail view's already-fetched full legislator list (grouped by chamber then party — no new endpoint needed here since the roster fetch already returns every legislator with a `chamber` field); render a single card without chamber-selection controls when the jurisdiction is unicameral
- [x] 4.4 Build the roster toolbar: party-filter pills (`aria-pressed`), chamber-filter pills (omitted for unicameral jurisdictions), name-search input, and a result count label — all filtering client-side against the detail view's full legislator list rather than re-querying the API per filter change (see design.md's composition-card decision)

## 5. Detail view: roster and legislator modal

- [x] 5.1 Build `LegislatorRoster`: desktop `<table>` (sortable column headers for name/party/district/chamber, toggling asc/desc) and mobile stacked-card layout from the same data, visibility switched via CSS media query (no JS viewport branching); empty state when filters/search match nothing
- [x] 5.2 Wire roster row/card activation (click + Enter/Space) to open `LegislatorModal` with the selected legislator
- [x] 5.3 Build `LegislatorModal`: avatar (photo from `image_url` when present, else initials), name, party pill, chamber/district facts grid (using only fields the API returns — no term dates, since the API doesn't have them), close via close button / Escape / overlay click, returning focus to the triggering row on close
- [x] 5.4 Remove the old `JurisdictionPicker`, `PartySummary`, `LegislatorFilters`, `LegislatorTable`, `FreshnessIndicator` components and their styles once the new components fully replace their usage in `App.jsx`

## 6. Integration and cleanup

- [x] 6.1 Rewire `App.jsx` to compose the masthead/legend, `LandingView` (which composes `FreshnessBanner` + `JurisdictionGrid`), and `DetailView`, switching between landing/detail via local `selectedId` state; uses the existing `fetchJurisdictions`/`fetchLegislators` calls unchanged (see design.md — `fetchPartySummary` is no longer called from the UI since chamber composition is now derived client-side from the full roster fetch, but the function itself is left in `api/client.js` untouched); preserves loading/error states for each fetch
- [x] 6.2 Replace `frontend/src/App.css` with reskinned layout styles (masthead, shell/container widths, view switching) matching the mockup's structure; remove now-unused old styles
- [x] 6.3 Verify responsive behavior at mobile width (~400px) and desktop width for the landing grid, detail view, and roster table/card switch — confirmed via a scripted Playwright pass at 390px (roster switches to cards, no horizontal overflow) and 1280px (table shown)

## 7. Tests

- [x] 7.1 Rewrite component tests (replacing the old `JurisdictionPicker.test.jsx`, `LegislatorTable.test.jsx`, `FreshnessIndicator.test.jsx`, `PartySummary.test.jsx`) to cover the new components: `JurisdictionGrid`/`LandingView` search, selection, and composition-bar rendering from `party_counts`; `LegislatorRoster`/`DetailView` filter/search/sort behavior and empty state; `LegislatorModal` open/close/focus-return; freshness/staleness formatting (`lib/freshness.test.js`, exercised further in `LandingView.test.jsx`)
- [x] 7.2 Update `App.test.jsx` for the landing→detail navigation flow (select a jurisdiction, view its roster, apply a filter, open a legislator modal, navigate back), updating mocked `fetchJurisdictions` fixtures to include `party_counts`
- [x] 7.3 Run the full frontend test suite and linter (`npm test`, `npm run lint` per `frontend/package.json`/`.oxlintrc.json`) and fix failures — 39/39 tests pass, lint clean (pre-existing set-state-in-effect warning pattern only, same shape as the original fetch hooks)
- [x] 7.4 Run the backend test suite (`pytest`) and fix failures from the `party_counts` schema/router change — 26/26 pass

## 8. Manual verification

- [x] 8.1 Ran backend + frontend dev servers, seeded via the mock sync (`POST /sync`), and drove the app with a scripted headless-Chromium (Playwright) pass: landing search filter, opening California, chamber composition cards, party pill filter, column sort, opening a legislator modal (correct name/party/chamber/district), closing it via the × button, and back navigation to the landing grid — all confirmed working with no console/page errors; screenshots reviewed and matched the mockup (fixed a "1 seats" → "1 seat" pluralization bug found in the process)
- [x] 8.2 Verified dark mode (`prefers-color-scheme: dark`) via a Playwright context with `colorScheme: "dark"` — tokens swap correctly (surface/ink/accent all legible, party colors distinguishable)
- [x] 8.3 Verified keyboard-only navigation via a scripted Playwright pass: first Tab reveals/focuses the skip link, Enter opens a jurisdiction card, Space activates a filter pill, Enter opens the legislator modal (focus lands on the close button), and Escape closes it and returns focus to the triggering roster row
