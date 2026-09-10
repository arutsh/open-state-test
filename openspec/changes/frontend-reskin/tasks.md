## 1. Foundations: tokens, fonts, utilities

- [ ] 1.1 Add Google Fonts `<link>` tags (Fraunces, Public Sans) to `frontend/index.html`
- [ ] 1.2 Replace `frontend/src/index.css` with the mockup's design token system: `:root` color tokens, `prefers-color-scheme: dark` override block, `[data-theme]` override block, base reset (`box-sizing`, `body` font/background/color, `h1`/`h2`/`h3` using Fraunces, focus-visible outline, `::selection`, reduced-motion guard)
- [ ] 1.3 Add a `bucketOf(party)` utility (e.g. `frontend/src/lib/party.js`) mapping the API's free-text `party` string to `dem` | `rep` | `ind` | `vacant`, plus a party-display-label helper ("Democratic", "Republican", "Independent / Other")
- [ ] 1.4 Add a freshness utility module (e.g. `frontend/src/lib/freshness.js`): `formatRelative(iso)` (human-readable "N minutes/hours/days ago") and `isStale(iso)` (>72h threshold), unit tested directly

## 2. Landing view: jurisdiction grid

- [ ] 2.1 Build `JurisdictionCard` component: name, classification pill, proportional party-composition bar, seat-count summary, per-jurisdiction "Synced Xh ago" footer (styled as overdue when `isStale`)
- [ ] 2.2 Build `JurisdictionGrid` component: fetches/receives jurisdictions, renders a responsive card grid, wires card selection to open the detail view
- [ ] 2.3 Add landing-view search input filtering the grid by jurisdiction name (case-insensitive), with an empty state when no jurisdiction matches
- [ ] 2.4 Add a coverage note ("Showing N of 52 jurisdictions...") reflecting the filtered count
- [ ] 2.5 Build `FreshnessBanner` component: overall "most recently synced" summary plus a list of any stale jurisdictions by name, rendered above the landing grid

## 3. Detail view: header, composition, roster toolbar

- [ ] 3.1 Add `view`/`selectedJurisdictionId` state to `App.jsx` (or a small state hook) to switch between landing and detail views without a router; wire the jurisdiction card and a back control to transition between them
- [ ] 3.2 Build the detail view header: seal/initials badge, jurisdiction name, classification, per-jurisdiction freshness (styled as overdue when stale), disabled "Sync now" control (mirroring the mockup's preview-only treatment)
- [ ] 3.3 Build `ChamberCompositionCard`: one per chamber, proportional composition bar plus a labeled seat-count row per party bucket; render a single card without chamber-selection controls when the jurisdiction is unicameral
- [ ] 3.4 Build the roster toolbar: party-filter pills (`aria-pressed`, wired to the existing `party` query param), chamber-filter pills (omitted for unicameral jurisdictions, wired to the existing `chamber` query param), name-search input (client-side filter), and a result count label

## 4. Detail view: roster and legislator modal

- [ ] 4.1 Build `LegislatorRoster`: desktop `<table>` (sortable column headers for name/party/district/chamber, toggling asc/desc) and mobile stacked-card layout from the same data, visibility switched via CSS media query (no JS viewport branching); empty state when filters/search match nothing
- [ ] 4.2 Wire roster row/card activation (click + Enter/Space) to open `LegislatorModal` with the selected legislator
- [ ] 4.3 Build `LegislatorModal`: avatar (photo from `image_url` when present, else initials), name, party pill, chamber/district/term-adjacent facts grid (using only fields the API returns), close via close button / Escape / overlay click, returning focus to the triggering row on close
- [ ] 4.4 Remove the old `JurisdictionPicker`, `PartySummary`, `LegislatorFilters`, `LegislatorTable`, `FreshnessIndicator` components and their styles once the new components fully replace their usage in `App.jsx`

## 5. Integration and cleanup

- [ ] 5.1 Rewire `App.jsx` to compose `FreshnessBanner` + `JurisdictionGrid` (landing) and the detail-view components, using the existing `fetchJurisdictions`/`fetchLegislators`/`fetchPartySummary` calls unchanged; preserve existing loading/error states for each fetch
- [ ] 5.2 Replace `frontend/src/App.css` with reskinned layout styles (masthead, shell/container widths, view switching) matching the mockup's structure; remove now-unused old styles
- [ ] 5.3 Verify responsive behavior at mobile width (~400px) and desktop width for the landing grid, detail view, and roster table/card switch

## 6. Tests

- [ ] 6.1 Rewrite component tests (replacing the old `JurisdictionPicker.test.jsx`, `LegislatorTable.test.jsx`, `FreshnessIndicator.test.jsx`, `PartySummary.test.jsx`) to cover the new components: `JurisdictionGrid`/`JurisdictionCard` search and selection, `LegislatorRoster` filter/search/sort behavior and empty state, `LegislatorModal` open/close/focus-return, `FreshnessBanner`/staleness formatting
- [ ] 6.2 Update `App.test.jsx` for the landing→detail navigation flow (select a jurisdiction, view its roster, apply a filter, open a legislator modal, navigate back)
- [ ] 6.3 Run the full frontend test suite and linter (`npm test`, `npm run lint` per `frontend/package.json`/`.oxlintrc.json`) and fix failures

## 7. Manual verification

- [ ] 7.1 Run `npm run dev`, click through: landing search, opening a jurisdiction, party/chamber filters, roster search, column sort, opening/closing the legislator modal, back navigation
- [ ] 7.2 Verify dark mode (`prefers-color-scheme: dark`) renders correctly by toggling OS/browser theme
- [ ] 7.3 Verify keyboard-only navigation: skip link, tabbing through filter pills and roster rows, opening/closing the modal with keyboard only
