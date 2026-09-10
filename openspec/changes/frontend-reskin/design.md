## Context

The `legislator-directory` change built a working but visually plain frontend: `App.jsx` owns all state and renders `JurisdictionPicker` (a `<select>`), `PartySummary`, `LegislatorFilters`, `LegislatorTable`, and `FreshnessIndicator` in one flat page, styled by generic `App.css`/`index.css`. `frontend/src/api/client.js` already wraps the three backend endpoints (`GET /api/jurisdictions`, `GET /api/jurisdictions/{id}/legislators?party&chamber`, `GET /api/jurisdictions/{id}/party-summary`) and is not changing.

An approved visual mockup ("Statehouse Register") exists as a static HTML/CSS/JS prototype: a landing view (searchable grid of jurisdiction cards), a per-jurisdiction detail view (chamber composition cards + a filterable/sortable/searchable roster, table on desktop and cards on mobile), and a legislator detail modal. It defines a full design token system (colors incl. dark mode, Fraunces + Public Sans type) and all interaction states (empty states, staleness warnings, focus handling). This design translates that static prototype into the existing React app's component/data architecture, using real API data instead of the mockup's hardcoded sample data.

## Goals / Non-Goals

**Goals:**
- Match the mockup's visual design (layout, color tokens, type, spacing, states) using the existing API data model.
- Introduce client-side navigation between a landing view and a per-jurisdiction detail view without adding a router dependency (the app has exactly two view states).
- Keep `api/client.js` and all backend code untouched.
- Preserve accessibility behavior already implied by the mockup: skip link, focus-visible outlines, modal focus trap/return, Escape-to-close, `aria-pressed` on filter pills.

**Non-Goals:**
- No new backend fields (contact info, committees, term dates, seal images) — the modal only surfaces what the API returns today.
- No new backend endpoints, no client-side pagination beyond what the current endpoints already return in full.
- No general component library / design system adoption beyond this app — tokens and components are local to this frontend.
- No admin "Sync now" functionality — stays a disabled, preview-only control as in the mockup, since the frontend has no admin auth.

## Decisions

**View state via local component state, not a router.** The app has exactly two views (landing, detail) plus a modal overlay. Adding `react-router` for two states would be net-new complexity for no behavioral gain. `App.jsx` keeps a `view: "landing" | "detail"` + `selectedJurisdictionId` state, mirroring the mockup's own `state.view` approach. *Alternative considered*: `react-router` with `/` and `/:jurisdictionId` routes — rejected for now since there's no requirement for deep-linking or browser back/forward yet; revisit if that requirement appears.

**Design tokens as CSS custom properties in `index.css`.** Port the mockup's `:root` token block (colors, including the `prefers-color-scheme: dark` and `[data-theme]` overrides) verbatim into `index.css`, replacing the current minimal reset. Components reference tokens (`var(--accent)`, `var(--dem)`, etc.) rather than hardcoded colors, matching the mockup's own structure. *Alternative considered*: CSS-in-JS or Tailwind — rejected to avoid a new build dependency for a one-page-worth of styling that the mockup already expresses cleanly in plain CSS.

**Fonts via Google Fonts `<link>` in `index.html`.** Matches the mockup exactly (`Fraunces` for headings, `Public Sans` for body) and is the lowest-effort path. Flagged as an open question below in case the team prefers self-hosted fonts to avoid the external request.

**Component split mirrors the mockup's structural sections, not the old component names.** Replace the old five components with: `JurisdictionGrid` (+ `JurisdictionCard`), `JurisdictionDetail` (composes `ChamberCompositionCard` and `RosterToolbar`), `LegislatorRoster` (table + card layouts, one component branching on viewport via CSS, not two components), `LegislatorModal`, and `FreshnessBanner`. `PartySummary`'s old role (seat counts) is absorbed into `ChamberCompositionCard`. *Alternative considered*: keep old component names and restyle in place — rejected because the mockup's structure (grid → detail → roster → modal) doesn't map onto the old flat picker+table shape; forcing it would produce awkward prop-drilling.

**Roster responsive behavior via CSS, not two render paths in JS.** Like the mockup, render both the `<table>` and the stacked-card markup and toggle visibility with a `min-width: 720px` media query, rather than a JS viewport check. Avoids a resize listener and layout-thrash on window resize; the cost is duplicate (but simple) markup.

**Party → visual bucket mapping stays a pure function.** Port the mockup's `bucketOf(party)` (`Democratic → dem`, `Republican → rep`, everything else including `Vacant` → `ind`/`vacant` as appropriate) as a small utility, since the API's `party` field is a free-text string (seen values include non-major-party names like Puerto Rico's "New Progressive Party") and the UI needs a bounded set of colors.

**Staleness threshold (72h) is a frontend constant.** The backend doesn't currently expose a staleness flag, only `last_synced_at`. The 72-hour threshold from the mockup is computed client-side against `Date.now()`, matching the mock exactly. *Alternative considered*: make the threshold configurable via env var — rejected as unnecessary for a single hardcoded UI constant; revisit if the backend later wants to own this logic.

**Legislator photo uses `image_url` with initials fallback.** The schema already returns `image_url` (unused by the current UI). The modal (and optionally the roster/card avatar) uses it when present, falling back to the mockup's initials-avatar treatment when null — a strict improvement over the mockup's initials-only design, using data that's already available for free.

## Risks / Trade-offs

- [Google Fonts adds an external network dependency at page load] → Acceptable for this app's context (internal/preview tool); if it becomes a concern, swap to self-hosted `@font-face` files with the same family names — no component changes needed since consumers reference the CSS variable/font-family, not the loading mechanism.
- [Hardcoding the two-view state in `App.jsx` instead of a router forecloses deep-linking] → Low risk given no current requirement for shareable jurisdiction URLs; the state shape (`view`, `selectedJurisdictionId`) maps cleanly onto route params later if needed.
- [Dropping the mockup's "Contact" and "Committees" modal sections changes the mockup's look for that one surface] → Intentional scope cut per proposal.md to avoid inventing backend data; flagged to the user so it isn't mistaken for an oversight.
- [Rewriting all components and their tests is a large, all-at-once diff] → Mitigated by tasks.md sequencing: tokens/fonts first, then landing, then detail/roster, then modal, then tests — each stage independently buildable and reviewable even though it lands as one change.

## Open Questions

- Should fonts be self-hosted instead of loaded from Google Fonts, to avoid the external request? (Defaulting to Google Fonts, matching the mockup, unless told otherwise.)
- Should `last_synced_at` staleness (72h) eventually move server-side (e.g., a `stale: bool` field from the API) so the frontend and any future consumer agree on one definition? (Out of scope here; frontend owns it for now.)
