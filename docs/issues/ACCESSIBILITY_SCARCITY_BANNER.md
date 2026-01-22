# Accessibility: Scarcity Banner

Found violations (from Playwright + axe run):

- region (moderate): elements like `.scarcity-offer` and `.scarcity-message` are not contained by landmarks.
- page-has-heading-one (moderate): page lacks H1.

Suggested fixes:
- Wrap banner content in appropriate landmark (e.g., `role="region"` with accessible name or include within `<main>`).
- Ensure page-level heading structure is correct (H1 on the page).

See: tests/playwright/storybook-a11y.spec.ts output and story `Scarcity Banner` for repro.
