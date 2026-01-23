Title: Replace runtime shims and fix test interop

Summary:
The recent work replaced several placeholder shims with real components and added Storybook stories and unit tests. Running the new unit tests (e.g., `EmailBlasterTest`) fails in Jest with "Element type is invalid" errors that appear to be caused by ESM/CJS interop/circular exports from the JS shim wrappers (e.g., `src/components/dashboard/EmailBlasterTest.js`).

Observed:
- Test failure: Element type is invalid: expected a string or function but got: object.
- Debugging shows the required module resolves to an object (module namespace circularity), not the component function.

Impact:
- Blocks the new unit tests from running in CI.
- Prevents safely replacing other shims until module interop is stabilized.

Suggested next steps:
1. Normalize exports for components:
   - Prefer a single `export default Component` in TSX files (avoid duplicate named + default exports) where possible.
   - Ensure JS shim wrappers export the component function at `module.exports = Component` or `module.exports.default = Component` consistently.
2. Update Jest config to map internal package aliases (`@tamyla/content-hub` etc.) to source paths using `moduleNameMapper` so tests resolve to ESM/TS files consistently.
3. Add a small compatibility test in CI that validates that requiring component modules yields a callable function/component.
4. Once interop fix is in place, re-run tests and iterate on other shim replacements.

Notes:
- The production implementation of the EmailBlaster service (via the clodo-framework) is out-of-scope for now; we use `emailApi` as a lightweight backend and will implement the clodo service later.
- Stories were added for `EmailBlasterTest` and `FAQ`. Tests were added for `EmailBlasterTest`, `FAQ`, `FeatureFlagContext`, and `SidebarContext` (tests currently failing due to the interop issue above).

Priority: P1

References:
- Tests: `src/components/dashboard/__tests__/EmailBlasterTest.test.tsx`
- Files changed: `src/components/dashboard/EmailBlasterTest.tsx`, `packages/content-hub/components/FAQ.tsx`
