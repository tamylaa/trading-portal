# Accessibility: Header component

Found violations (from Playwright + axe run):

- color-contrast (serious): `.header-tagline` has contrast ratio 3.97 vs expected 4.5:1.
- landmark-one-main (moderate): document has no main landmark — ensure app pages include `<main>`.
- page-has-heading-one (moderate): page has no H1 — ensure at least one H1 on pages.

Suggested fixes:
- Update header tagline color or background to meet contrast thresholds; prefer using design tokens for colors.
- Ensure pages include a single `<main>` landmark containing primary page content.
- Ensure top-level pages have a single H1; adjust landing header to use an appropriate heading level if necessary.

See: tests/playwright/storybook-a11y.spec.ts output and story `Header` for reproduction steps.
