## ADDED Requirements

### Requirement: Structured learning modules and lesson progression
The system SHALL provide a structured sign language curriculum organized into modules and lessons, and SHALL track lesson and module completion per authenticated user.

#### Scenario: Learner completes a lesson
- **WHEN** an authenticated learner marks a lesson as completed
- **THEN** the system SHALL persist lesson completion and update the module progress percentage for that learner

### Requirement: Module access based on progression rules
The system SHALL enforce progression rules so that lessons or modules configured as sequential cannot be accessed until prerequisite lessons are completed.

#### Scenario: Learner attempts to open locked lesson
- **WHEN** a learner opens a lesson whose prerequisite lesson is incomplete
- **THEN** the system SHALL prevent access and display the prerequisite requirement
