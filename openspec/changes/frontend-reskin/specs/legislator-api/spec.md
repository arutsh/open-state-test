## MODIFIED Requirements

### Requirement: List jurisdictions endpoint
The system SHALL expose a REST endpoint that lists all synced jurisdictions, including each jurisdiction's current seat count per party.

#### Scenario: Client requests jurisdiction list
- **WHEN** a client sends `GET /api/jurisdictions`
- **THEN** the system returns a JSON array of jurisdictions, each including id, name, classification, `last_synced_at`, and `party_counts` (a mapping of each party present in that jurisdiction to its current seat count)

#### Scenario: Jurisdiction has no synced legislators yet
- **WHEN** a client sends `GET /api/jurisdictions` and a returned jurisdiction has no legislators persisted yet
- **THEN** that jurisdiction's `party_counts` is an empty object rather than being omitted or causing an error
