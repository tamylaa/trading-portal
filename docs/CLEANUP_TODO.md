# Repo Cleanup & Segregation Plan (Prioritized) ✅

This file contains a prioritized, actionable todo list and immediate steps taken. It was generated automatically from a repo scan and based on the `clodo-dev-site` layout patterns.

---

## High priority — Quick wins (do now) ✅
- [x] Update `.gitignore` to ignore caches and temp folders (done)
- [x] Untrack committed `build/` artifacts from git index (done)
- [ ] Add `.gitignore` rules to exclude any other generated files found in `reports/` when appropriate
- [ ] Compress `public/assets/logos/logo.png` (~1.4 MB) and `public/assets/logos/og-image.png` (~1.0 MB) and replace with WebP/AVIF variants
- [ ] Add an `optimize:images` script to automate image optimization
- [ ] Add a CI check to fail builds when new large assets (>150KB) are committed

## Short term — Next 1–3 days 🔧
- [ ] Create `data/schemas/` and move all structured data snippets there
- [ ] Seed `src/i18n/en.json` and extract translatable strings into `src/i18n/`
- [ ] Triage TODOs/FIXMEs into GitHub issues (use `reports/todos.json`)
- [ ] Add `reports/README.md` describing generated reports and how they were produced

## Medium term — 1–2 weeks 🛠️
- [ ] Reorganize `src/components/` into domain areas with one-folder-per-component convention
- [ ] Add Storybook or a component preview system
- [ ] Add schema presence tests for critical pages
- [ ] Audit and dedupe dependencies (add Dependabot or schedule audits)

## Long term — 2–8 weeks 📈
- [ ] Decide on frontend platform direction (CRA vs Next.js) and create migration plan if required
- [ ] Implement automated schema injection for product pages and FAQs
- [ ] Archive legacy content to `archive/` and remove from main tree

---

## Reports & Artifacts
- Large files report: `reports/large-files.json`
- TODOs: `reports/todos.json`
- i18n candidate files: `reports/i18n-files.json`
- Schema-like matches: `reports/schema-matches.json`

---

If you'd like, I can: (pick one)
- Run the image optimization and replace the two logos (I will add a backup and ensure references remain valid).
- Create GitHub issues from `reports/todos.json` and assign priorities.
- Start reorganizing `src/components/` by moving a small set of components into the domain-based structure as a sample.

Say which one to do next and I'll action it. 
