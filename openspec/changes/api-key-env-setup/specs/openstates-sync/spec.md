## ADDED Requirements

<!--
  Note: `openstates-sync` was introduced in the still-open `legislator-directory`
  change and has not yet been archived to openspec/specs/, so there is no
  existing requirement block to copy for a MODIFIED delta. These requirements
  are additive to that pending capability and should be reconciled with its
  spec (e.g. via /opsx:sync) once both changes are implemented.
-->

### Requirement: Automatic selection between live and mock data sources
The system SHALL select its Open States data source automatically based on whether a valid `OPENSTATES_API_KEY` is configured, without requiring any code change or explicit mode flag.

#### Scenario: A real API key is configured
- **WHEN** `OPENSTATES_API_KEY` is set to a non-empty value other than a known placeholder (e.g. `changeme`)
- **THEN** the sync service uses the real Open States API client, which calls the live `GET /jurisdictions?classification=state` and `GET /people` endpoints

#### Scenario: No API key is configured
- **WHEN** `OPENSTATES_API_KEY` is unset, empty, or set to a known placeholder value
- **THEN** the sync service uses a built-in mock data source instead of making any network call to Open States

#### Scenario: Mock data source returns realistic, usable data
- **WHEN** the sync service runs against the mock data source
- **THEN** it returns a fixed set of jurisdictions and legislators shaped exactly like the real client's output (jurisdiction id/name/classification; legislator id/name/party/chamber/district), sufficient to exercise the full sync (upsert, stale-legislator removal, party-summary aggregation) end to end

### Requirement: Active data source is observable
The system SHALL expose which data source (live or mock) is currently active, so operators can distinguish real officeholder data from sample data without reading source code or logs.

#### Scenario: Health check reports the active data source
- **WHEN** a client sends `GET /health`
- **THEN** the response includes a `data_source` field whose value is `"live"` or `"mock"`, reflecting the current `OPENSTATES_API_KEY` configuration

#### Scenario: Sync run logs its data source
- **WHEN** a full sync run starts
- **THEN** the system logs whether it is running against the live Open States API or the mock data source
