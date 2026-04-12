## ADDED Requirements

### Requirement: Timed and untimed assessments with scoring
The system SHALL provide assessments attached to learning modules, SHALL evaluate submitted answers, and SHALL store score results for each attempt.

#### Scenario: Learner submits assessment answers
- **WHEN** a learner submits answers for an assessment
- **THEN** the system SHALL calculate score, persist the attempt result, and return pass/fail feedback

### Requirement: Assessment history visibility
The system SHALL allow learners to view historical assessment attempts including date, score, and status.

#### Scenario: Learner opens assessment history
- **WHEN** a learner navigates to assessment history for a module
- **THEN** the system SHALL display previously recorded attempts sorted by most recent first
