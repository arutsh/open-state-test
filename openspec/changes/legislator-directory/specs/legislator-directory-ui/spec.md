## ADDED Requirements

### Requirement: Jurisdiction selection
The frontend SHALL let the user select one of the 52 supported jurisdictions to view.

#### Scenario: User opens the app
- **WHEN** the user loads the application
- **THEN** the frontend fetches and displays the list of jurisdictions from the backend, and the user can select one

### Requirement: Legislator list view
The frontend SHALL display the current legislators of the selected jurisdiction, including each legislator's name, party, chamber, and district.

#### Scenario: User selects a jurisdiction
- **WHEN** the user selects a jurisdiction from the picker
- **THEN** the frontend fetches that jurisdiction's legislators from the backend and renders them in a list/table showing name, party, chamber, and district

#### Scenario: User filters by party
- **WHEN** the user selects a party filter (e.g., "Democratic", "Republican", "Independent")
- **THEN** the frontend requests and displays only legislators of that jurisdiction matching the selected party

#### Scenario: User filters by chamber
- **WHEN** the user selects a chamber filter (e.g., "upper", "lower")
- **THEN** the frontend requests and displays only legislators of that jurisdiction matching the selected chamber

### Requirement: Party composition summary display
The frontend SHALL display a summary of seats held by each party for the selected jurisdiction.

#### Scenario: User views a jurisdiction's party breakdown
- **WHEN** the user selects a jurisdiction
- **THEN** the frontend fetches and displays the party-composition summary (seat counts per party) for that jurisdiction

### Requirement: Data freshness indicator
The frontend SHALL show the user when the displayed jurisdiction's data was last synced.

#### Scenario: User views a jurisdiction's data
- **WHEN** the user selects a jurisdiction
- **THEN** the frontend displays the jurisdiction's `last_synced_at` value in a human-readable form (e.g., "Last updated 2 hours ago")
