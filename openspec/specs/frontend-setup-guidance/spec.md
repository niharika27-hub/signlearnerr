## ADDED Requirements

### Requirement: Preflight compatibility checks
The system SHALL verify whether the project supports shadcn-style structure, Tailwind CSS, and TypeScript before integrating the new component.

#### Scenario: Project preflight runs on incomplete setup
- **WHEN** any prerequisite (shadcn structure, Tailwind, or TypeScript) is missing
- **THEN** the system SHALL provide explicit setup guidance prior to integration

### Requirement: Guidance for non-default component paths
The system SHALL document the default shared component path (`/components/ui`) and SHALL explain why this path is preferred if a different path is currently used.

#### Scenario: Custom component path is detected
- **WHEN** the project uses a non-default shared component directory
- **THEN** guidance SHALL explain discoverability, consistency, and reuse benefits of `/components/ui`

### Requirement: Required implementation clarification prompts
The system SHALL capture implementation clarifications for props/data, state management expectations, required assets, responsive behavior, and best integration locations.

#### Scenario: Integration planning begins
- **WHEN** implementation planning starts
- **THEN** the workflow SHALL include explicit prompts for data/props, state requirements, assets, responsiveness, and placement strategy
