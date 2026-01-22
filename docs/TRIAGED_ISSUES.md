# Triaged Issues (from TODO/FIXME scan)

This file lists TODO / FIXME occurrences found in the codebase, triaged into suggested GitHub issues with priorities and labels.

---

1. Implement remote feature flag loading & persistence
   - Files:
     - `src/contexts/FeatureFlagContext.tsx` (lines ~93, ~115)
   - Suggested issue: `feat(feature-flags): load/persist feature flags via remote config`
   - Labels: enhancement, tech-debt
   - Priority: medium

2. Fix CSS import path in ContentAccess page
   - File: `src/pages/ContentAccess.jsx` (line ~13)
   - Suggested issue: `chore(styles): fix UI component CSS import path in ContentAccess`
   - Labels: bug, frontend
   - Priority: low

3. Re-export or modularize ProgressiveEmailBlaster
   - File: `src/components/ProgressiveEmailBlaster.tsx`
   - Suggested issue: `refactor(email): re-export ProgressiveEmailBlaster for easier imports`
   - Labels: refactor
   - Priority: low

4. Implement shared ApiClient usage in Content Hub
   - File: `packages/content-hub/src/HyperContentHub.jsx` (lines ~156, ~162)
   - Suggested issue: `feat(content-hub): use shared ApiClient for sharing & shared items`
   - Labels: enhancement, packages
   - Priority: medium

5. Extract translatable strings for i18n
   - Files: scan shows no consistent app-level i18n; seed `src/i18n/en.json` and extract strings
   - Suggested issue: `feat(i18n): add i18n scaffold and extract UI strings`
   - Labels: enhancement, i18n
   - Priority: medium

6. Large asset optimization
   - Files: `public/assets/logos/logo.png`, `public/assets/logos/og-image.png`, `public/assets/images/hero-bg.jpg` (see `reports/large-files.json`)
   - Suggested issue: `perf(images): compress and add webp/avif variants for large images`
   - Labels: perf, infra
   - Priority: high

---

If you'd like I can convert these triaged items into real GitHub issues (requires a PAT with repo scope) or create internal JIRA/tickets — tell me your preference and I'll proceed.
