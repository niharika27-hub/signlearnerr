## Why

People who are hard of hearing, and their support network (family members and teachers), need a structured and practical way to learn sign language together. A web-based platform with personalized learning paths, practice, and measurable progress enables inclusive communication skills development and fills a gap between static lessons and real-world use.

## What Changes

- Create a sign language learning website with guided learning modules from beginner to advanced levels.
- Add camera-based practice sessions so learners can rehearse signs and receive practice feedback/workflow support.
- Add tests/quizzes to evaluate comprehension and retention.
- Add a personalized progress dashboard showing module completion, test scores, streaks, and improvement over time.
- Add account creation flow with user-type selection (hard of hearing learner, family member, teacher) to tailor dashboard content and learning recommendations.

## Capabilities

### New Capabilities
- `learning-modules`: Structured sign language curriculum with module/lesson progression and completion tracking.
- `camera-practice`: Browser camera-enabled practice sessions for signing exercises.
- `assessments-and-tests`: Quiz/test flows with scoring and feedback.
- `personalized-progress-dashboard`: Role-aware dashboard with progress metrics and recommendations.
- `role-based-onboarding`: Account registration that captures target user type and initializes personalized experience.

### Modified Capabilities
- None.

## Impact

- Affected systems: web frontend, authentication/profile service, learning content service, progress tracking/reporting service.
- New data dependencies: learner profile (including user type), module progress, assessment results, practice session history.
- API impacts: endpoints for modules, assessments, profile preferences, and dashboard analytics.
- Browser/platform dependencies: secure camera permission handling and media capture support.
