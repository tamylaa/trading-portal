Title: feat(feature-flags): load/persist feature flags via remote config

Description:
Implement remote loading and persistence for feature flags.

Files:
- src/contexts/FeatureFlagContext.tsx (lines ~93, ~115)

Acceptance criteria:
- Feature flags can be loaded from a configurable remote endpoint.
- Flags are persisted to remote config store on update.
- Local fallback if remote is unavailable.

Labels: enhancement, tech-debt
Priority: medium
