## ADDED Requirements

### Requirement: List jurisdictions endpoint
The system SHALL expose a REST endpoint that lists all synced jurisdictions.

#### Scenario: Client requests jurisdiction list
- **WHEN** a client sends `GET /api/jurisdictions`
- **THEN** the system returns a JSON array of jurisdictions, each including id, name, classification, and `last_synced_at`

### Requirement: List legislators by jurisdiction endpoint
The system SHALL expose a REST endpoint that lists current legislators for a given jurisdiction, with optional filters.

#### Scenario: Client requests legislators for a jurisdiction
- **WHEN** a client sends `GET /api/jurisdictions/{jurisdiction_id}/legislators`
- **THEN** the system returns a JSON array of legislators in that jurisdiction, each including name, party, chamber, and district

#### Scenario: Client filters legislators by party
- **WHEN** a client sends `GET /api/jurisdictions/{jurisdiction_id}/legislators?party=Democratic`
- **THEN** the system returns only legislators in that jurisdiction whose party matches the given value

#### Scenario: Client filters legislators by chamber
- **WHEN** a client sends `GET /api/jurisdictions/{jurisdiction_id}/legislators?chamber=upper`
- **THEN** the system returns only legislators in that jurisdiction whose chamber matches the given value

#### Scenario: Unknown jurisdiction requested
- **WHEN** a client requests legislators for a jurisdiction id that does not exist in the synced data
- **THEN** the system returns a 404 response

### Requirement: Party composition summary endpoint
The system SHALL expose a REST endpoint that returns the count of legislators per party for a given jurisdiction.

#### Scenario: Client requests party composition
- **WHEN** a client sends `GET /api/jurisdictions/{jurisdiction_id}/party-summary`
- **THEN** the system returns a JSON object mapping each party present in that jurisdiction to its current seat count

### Requirement: API serves only from synced datastore
The system SHALL answer all read requests from its own datastore and SHALL NOT call the Open States API synchronously within a client request.

#### Scenario: Client request served without external call
- **WHEN** a client sends any `GET /api/*` request
- **THEN** the system responds using only data already persisted from prior sync runs, with no live call to Open States made during that request
