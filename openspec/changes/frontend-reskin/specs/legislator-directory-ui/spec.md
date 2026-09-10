## MODIFIED Requirements

### Requirement: Jurisdiction selection
The frontend SHALL present the 52 supported jurisdictions as a searchable grid of jurisdiction cards on a landing view, and let the user open one to view its detail page.

#### Scenario: User opens the app
- **WHEN** the user loads the application
- **THEN** the frontend fetches the list of jurisdictions from the backend and renders each as a card (showing name, classification, party-composition bar, seat counts, and sync freshness) in a grid on the landing view

#### Scenario: User searches jurisdictions
- **WHEN** the user types into the landing view's search field
- **THEN** the frontend filters the visible jurisdiction cards to those whose name matches the search text (case-insensitive), and shows an empty state if none match

#### Scenario: User opens a jurisdiction
- **WHEN** the user selects a jurisdiction card
- **THEN** the frontend navigates to that jurisdiction's detail view and fetches its legislators and party summary

#### Scenario: User returns to the landing view
- **WHEN** the user activates the back control on a jurisdiction's detail view
- **THEN** the frontend returns to the landing view, preserving the jurisdiction grid

### Requirement: Legislator list view
The frontend SHALL display the current legislators of the selected jurisdiction as a roster (a table on wider viewports, stacked cards on narrow viewports) showing each legislator's name, party, chamber, and district, filterable by party and chamber, searchable by name, and sortable by column.

#### Scenario: User opens a jurisdiction's detail view
- **WHEN** the user selects a jurisdiction from the landing view
- **THEN** the frontend fetches that jurisdiction's legislators from the backend and renders them in the roster, showing name, party, chamber (omitted for a unicameral jurisdiction), and district

#### Scenario: User filters by party
- **WHEN** the user selects a party filter control (e.g., "Democratic", "Republican", "Independent / Other")
- **THEN** the frontend requests and displays only legislators of that jurisdiction matching the selected party

#### Scenario: User filters by chamber
- **WHEN** the user selects a chamber filter control (e.g., a chamber's label, or "Both chambers")
- **THEN** the frontend requests and displays only legislators of that jurisdiction matching the selected chamber

#### Scenario: User searches the roster by name
- **WHEN** the user types into the roster's search field
- **THEN** the frontend narrows the displayed roster to legislators whose name matches the search text (case-insensitive), combined with any active party/chamber filters

#### Scenario: User sorts the roster
- **WHEN** the user activates a sortable column header (name, party, district, or chamber)
- **THEN** the frontend re-orders the displayed roster by that field, toggling ascending/descending on repeated activation of the same column

#### Scenario: No legislators match the current filters
- **WHEN** the active search/party/chamber filters match zero legislators
- **THEN** the frontend shows an empty-state message in place of the roster rather than an empty table or card list

### Requirement: Party composition summary display
The frontend SHALL display, for the selected jurisdiction, a per-chamber breakdown of seats held by each party as a proportional composition bar with a labeled seat count per party.

#### Scenario: User views a jurisdiction's party breakdown
- **WHEN** the user opens a jurisdiction's detail view
- **THEN** the frontend fetches the party-composition summary for that jurisdiction and renders one composition card per chamber, each showing a proportional bar segmented by party and a labeled seat count per party

#### Scenario: Jurisdiction has a single chamber
- **WHEN** the selected jurisdiction has only one legislative chamber (e.g., a unicameral legislature)
- **THEN** the frontend renders a single composition card and omits chamber-selection controls that would otherwise distinguish between chambers

### Requirement: Data freshness indicator
The frontend SHALL show when data was last synced, both as an overall summary across all jurisdictions and per-jurisdiction, and SHALL flag any jurisdiction whose data has not synced within 72 hours as stale.

#### Scenario: User views the landing view
- **WHEN** the user loads the landing view
- **THEN** the frontend displays a banner summarizing the most recent sync time across all jurisdictions, and lists by name any jurisdictions stale by more than 72 hours

#### Scenario: User views a jurisdiction's data
- **WHEN** the user opens a jurisdiction's detail view or its landing-view card
- **THEN** the frontend displays that jurisdiction's `last_synced_at` value in a human-readable relative form (e.g., "Synced 2 hours ago")

#### Scenario: A jurisdiction's data is stale
- **WHEN** a jurisdiction's `last_synced_at` is more than 72 hours in the past
- **THEN** the frontend visually distinguishes that jurisdiction's freshness indicator (on its landing-view card and its detail view) as overdue for re-sync

## ADDED Requirements

### Requirement: Legislator detail modal
The frontend SHALL let the user open a modal with a selected legislator's details from the roster, showing at minimum their name, party, chamber, district, and jurisdiction, and their photo when `image_url` is available (falling back to initials otherwise).

#### Scenario: User selects a legislator from the roster
- **WHEN** the user activates a roster row (table row or card)
- **THEN** the frontend opens a modal showing that legislator's name, party, chamber, district, and jurisdiction, and their photo if `image_url` is present or a two-letter initials avatar otherwise

#### Scenario: User closes the modal
- **WHEN** the user activates the modal's close control, presses Escape, or clicks outside the modal
- **THEN** the frontend closes the modal and returns keyboard focus to the roster row that opened it
