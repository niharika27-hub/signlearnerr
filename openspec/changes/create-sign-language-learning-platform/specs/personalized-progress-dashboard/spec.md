## ADDED Requirements

### Requirement: Personalized dashboard metrics
The system SHALL present a personalized dashboard showing module completion, test scores, practice activity, and learning streaks for the authenticated user.

#### Scenario: Learner opens dashboard
- **WHEN** an authenticated user opens the dashboard
- **THEN** the system SHALL render metrics derived from that user’s progress records only

### Requirement: Role-aware dashboard recommendations
The system SHALL tailor recommended next actions based on the user role selected during onboarding.

#### Scenario: Teacher account views dashboard
- **WHEN** a user with role "teacher" opens the dashboard
- **THEN** the system SHALL show teacher-relevant recommendations and resources instead of default learner-only prompts
