## ADDED Requirements

### Requirement: Jurisdiction and legislator sync from Open States
The system SHALL fetch the list of supported state-level jurisdictions and their current legislators from the Open States v3 API (`/jurisdictions` and `/people`) and persist them in the application's own datastore.

#### Scenario: Full sync populates all jurisdictions
- **WHEN** a sync run executes
- **THEN** the system fetches all jurisdictions returned by `GET /jurisdictions?classification=state` (paginating through all pages) and upserts each into the `jurisdictions` table

#### Scenario: Full sync populates current legislators per jurisdiction
- **WHEN** a sync run processes a given jurisdiction
- **THEN** the system fetches all current people for that jurisdiction via `GET /people?jurisdiction=<id>&include=...` (paginating through all pages) and upserts each into the `legislators` table with name, party, chamber, district, and jurisdiction reference

### Requirement: Sync resilience to per-jurisdiction failures
The system SHALL continue syncing remaining jurisdictions if one jurisdiction's fetch fails, rather than aborting the entire run.

#### Scenario: One jurisdiction's API call fails
- **WHEN** the Open States API returns an error (e.g., 5xx or timeout) for one jurisdiction during a sync run
- **THEN** the system logs the failure, skips that jurisdiction for this run, and continues syncing the remaining jurisdictions
- **AND** the previously synced data for the failed jurisdiction is left unchanged (not wiped)

### Requirement: Scheduled and on-demand sync triggers
The system SHALL support running a full sync automatically on a fixed schedule and also on demand via an authenticated trigger.

#### Scenario: Scheduled sync runs automatically
- **WHEN** the configured sync interval elapses (e.g., once daily)
- **THEN** the system automatically starts a full sync run without manual intervention

#### Scenario: Manual sync trigger
- **WHEN** an authorized caller invokes the manual sync trigger (e.g., `POST /sync`)
- **THEN** the system starts a full sync run immediately and returns a status indicating the run has started

### Requirement: Sync freshness tracking
The system SHALL record when each jurisdiction's data was last successfully synced so that data freshness can be surfaced to users.

#### Scenario: Successful sync updates freshness timestamp
- **WHEN** a jurisdiction's legislators are successfully synced
- **THEN** the system records the current timestamp as that jurisdiction's `last_synced_at` value
