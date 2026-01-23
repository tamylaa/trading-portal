# Issue Creation Guide

These files in `docs/issues/` contain triaged work items. Use `scripts/create-issues.mjs` to create GitHub issues from these markdown files.

Usage (PowerShell):

1. Set token for the current session:

   $env:GITHUB_TOKEN = 'ghp_XXXXXXXXXXXX'

2. Dry run to verify what will be created:

   $env:DRY_RUN = 1; node scripts/create-issues.mjs

3. Create issues for real:

   node scripts/create-issues.mjs

Notes:
- The script defaults to repo `tamylaa/trading-portal`; override with `TARGET_REPO=owner/repo`.
- The script writes created issue URLs to `reports/created-issues.json` on success.
