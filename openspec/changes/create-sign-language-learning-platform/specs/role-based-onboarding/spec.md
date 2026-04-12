## ADDED Requirements

### Requirement: Role selection during account creation
The system SHALL require users to select a primary role during account creation from supported options (hard-of-hearing learner, family member, teacher).

#### Scenario: User creates account with role
- **WHEN** a new user submits registration details with a valid role selection
- **THEN** the system SHALL create the account and persist the selected role in the user profile

### Requirement: Role-based initialization of user experience
The system SHALL initialize dashboard preferences and starter learning recommendations according to the selected role immediately after successful registration.

#### Scenario: Family member completes registration
- **WHEN** a user registers with role "family member"
- **THEN** the system SHALL initialize family-oriented dashboard defaults and recommended starting modules
