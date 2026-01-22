# Design System (Seed)

This document captures the initial design tokens and guidance for establishing a consistent design system across the repo.

## Goal
- Provide a single source of truth for colors, typography, spacing, radii, motion and elevation.
- Make it easy to migrate components to use tokens and to ship a `packages/design-system` in future.

## Tokens (seeded in `src/styles/design-tokens.css`)
- Colors: `--color-primary`, `--color-heading`, `--color-text-muted`, `--color-surface`, `--color-surface-alt`, `--color-accent-1`, `--color-accent-2`
- Typography: `--font-family-sans`, `--font-size-h1`, `--font-size-lead`, `--font-size-lg`, `--font-size-md`, `--font-size-sm`
- Radii: `--radius-sm`, `--radius-md`, `--radius-lg`, `--landing-section-radius`
- Elevation: `--elevation-1`, `--elevation-2`, `--elevation-3`
- Motion: `--motion-fast`, `--motion-medium`, `--motion-slow`
- Component tokens: `--badge-height`, `--feature-card-max-width`

## How to use
- Prefer variables over hardcoded values in component CSS.
- Add new tokens to `src/styles/design-tokens.css` and document them here.
- Add Storybook stories for components when migrating to tokens.

## Next steps
- Create `packages/design-system` to publish primitives and shared CSS-in-JS components.
- Add visual regression and accessibility checks for Storybook.
- Migrate remaining components to tokens in small PRs.
