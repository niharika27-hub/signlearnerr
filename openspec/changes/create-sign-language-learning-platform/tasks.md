## 1. Foundation and data model

- [ ] 1.1 Define core entities for users, roles, modules, lessons, assessments, attempts, practice sessions, and progress summaries
- [ ] 1.2 Add database migrations for onboarding role, progress events, and dashboard summary tables
- [ ] 1.3 Implement shared authentication/session middleware used by all capability endpoints

## 2. Role-based onboarding

- [ ] 2.1 Build account registration flow with required role selection (hard-of-hearing learner, family member, teacher)
- [ ] 2.2 Persist selected role in user profile and expose profile read/update endpoint
- [ ] 2.3 Initialize role-based default preferences and starter recommendations after successful signup

## 3. Learning modules and assessments

- [ ] 3.1 Implement module and lesson retrieval APIs with progression metadata
- [ ] 3.2 Implement lesson completion endpoint and module progress calculation/update
- [ ] 3.3 Enforce prerequisite rules for sequential lesson/module access
- [ ] 3.4 Implement assessment delivery, submission scoring, and attempt persistence
- [ ] 3.5 Implement assessment history endpoint sorted by most recent attempts

## 4. Camera practice capability

- [ ] 4.1 Build practice session UI flow with camera permission request and live preview
- [ ] 4.2 Implement backend/session logging for practice events and captured metadata
- [ ] 4.3 Add denial/unavailable camera fallback UX with accessible remediation messaging
- [ ] 4.4 Feature-flag camera practice for controlled rollout and rollback safety

## 5. Personalized progress dashboard

- [ ] 5.1 Implement progress event ingestion for lesson completion, assessment submissions, and practice sessions
- [ ] 5.2 Implement dashboard aggregation logic for completion metrics, scores, streaks, and activity
- [ ] 5.3 Build role-aware dashboard views and recommendation components
- [ ] 5.4 Add summary snapshot/reconciliation job to reduce expensive aggregate reads

## 6. Quality, accessibility, and release

- [ ] 6.1 Add unit/integration tests for onboarding roles, progression gating, assessments, and dashboard calculations
- [ ] 6.2 Add browser compatibility and permission-state tests for camera practice flow
- [ ] 6.3 Validate accessibility for onboarding, practice, tests, and dashboard experiences
- [ ] 6.4 Prepare rollout checklist, monitoring alerts, and rollback steps for capability flags
