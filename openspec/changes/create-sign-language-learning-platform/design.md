## Context

This change introduces an end-to-end learning experience for sign language across multiple user personas (hard-of-hearing learners, family members, and teachers). The current project has no existing capabilities, so this design establishes foundational architecture for onboarding, content delivery, camera-enabled practice, assessments, and progress analytics.

Constraints and expectations:
- Must work in modern browsers with secure camera access.
- Must support personalized dashboards based on selected user type during account creation.
- Should enable iterative rollout (MVP first, richer camera feedback later).

## Goals / Non-Goals

**Goals:**
- Provide structured module-based sign language learning flows.
- Provide browser camera-based practice sessions with reliable permission handling and capture flow.
- Provide tests/quizzes with scoring and progress persistence.
- Provide personalized dashboards seeded by onboarding role and learner activity.
- Keep architecture modular so future features (AI sign recognition, live classes) can be added without major refactors.

**Non-Goals:**
- Real-time teacher-led conferencing or video-call classrooms.
- Full AI sign-recognition grading in initial release (only practice capture + basic feedback workflow).
- Native mobile app delivery in this change.
- Multi-language curriculum authoring system in this change.

## Decisions

1. **Capability-oriented service boundaries in app layer**
   - Decision: Model features as distinct capability domains (`role-based-onboarding`, `learning-modules`, `camera-practice`, `assessments-and-tests`, `personalized-progress-dashboard`) with clear API boundaries.
   - Rationale: Aligns implementation with specs and reduces coupling.
   - Alternative considered: Single monolithic feature module. Rejected due to maintainability risks and harder evolution.

2. **Role-first onboarding as source of personalization**
   - Decision: Persist user role at account creation and use it to drive dashboard defaults and recommended module paths.
   - Rationale: Keeps personalization deterministic and explainable.
   - Alternative considered: Infer role only from behavior after sign-up. Rejected because initial experience would be generic and less useful.

3. **Camera practice as browser media workflow (MVP)**
   - Decision: Use browser media APIs for permission, preview, capture/session storage metadata; keep feedback rules-based in MVP.
   - Rationale: Fast delivery with broad compatibility and reduced ML complexity.
   - Alternative considered: Immediate AI-based gesture evaluation. Rejected for scope, cost, and model-quality risk in first version.

4. **Event-backed progress aggregation**
   - Decision: Record progress events (module completed, quiz submitted, practice session completed) and compute dashboard summaries from persisted event/state tables.
   - Rationale: Supports analytics, auditability, and future reporting flexibility.
   - Alternative considered: Dashboard-only denormalized counters. Rejected due to weak traceability and harder recalculation.

5. **Spec-driven endpoint contracts**
   - Decision: Define API contracts per capability and implement with shared auth/session middleware.
   - Rationale: Ensures consistency and easier testability across capability domains.
   - Alternative considered: Ad hoc per-feature APIs. Rejected for inconsistency and increased integration bugs.

## Risks / Trade-offs

- **[Camera permissions vary by device/browser]** → Mitigation: Implement robust permission states, fallback messaging, and compatibility checks before session start.
- **[Role-based personalization may overfit early assumptions]** → Mitigation: Allow user role updates and editable learning preferences in profile settings.
- **[Progress aggregation can become expensive at scale]** → Mitigation: Precompute summary snapshots on write events and periodically reconcile.
- **[MVP feedback may feel limited without AI evaluation]** → Mitigation: Set clear product expectations and design extension points for future AI scoring.
- **[Privacy concerns for camera usage]** → Mitigation: Capture explicit consent, minimize retained media, and document retention/deletion policy.

## Migration Plan

1. Introduce foundational data schema/entities for users, roles, modules, lessons, assessments, attempts, practice sessions, and progress summaries.
2. Deploy onboarding + authentication updates with role capture.
3. Deploy learning modules APIs/UI and completion tracking.
4. Deploy assessment APIs/UI and scoring persistence.
5. Deploy camera practice flow with permission checks and session metadata logging.
6. Deploy personalized dashboard aggregation and role-based views.
7. Backfill/initialize dashboard summaries for existing users (if any).

Rollback strategy:
- Feature-flag camera practice and personalized dashboard sections.
- Revert to generic dashboard if role-based data pipeline fails.
- Keep schema migrations backward-compatible in initial rollout (additive changes first).

## Open Questions

- Should teachers have class/group-level dashboards in this phase or a separate future change?
- What retention period should be enforced for captured practice media/metadata?
- Should onboarding allow multiple roles per user (e.g., parent + teacher), or a single primary role only?
- Which accessibility standards and captioning/transcript requirements must be mandatory at launch?
