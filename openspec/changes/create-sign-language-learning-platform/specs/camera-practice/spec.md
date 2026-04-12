## ADDED Requirements

### Requirement: Browser camera practice session
The system SHALL allow authenticated users to start a camera-based sign practice session in supported browsers after explicit camera permission is granted.

#### Scenario: User grants camera permission
- **WHEN** the user starts practice and grants browser camera permission
- **THEN** the system SHALL display live camera preview and enable session recording or capture controls

### Requirement: Camera permission failure handling
The system SHALL provide accessible error handling when camera permission is denied or camera hardware is unavailable.

#### Scenario: User denies permission
- **WHEN** the user denies camera permission for a practice session
- **THEN** the system SHALL show a clear remediation message and SHALL not start the session
