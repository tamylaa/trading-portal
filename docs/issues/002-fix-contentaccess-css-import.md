Title: chore(styles): fix UI component CSS import path in ContentAccess

Description:
Fix the import path or relocation so `ContentAccess.jsx` correctly imports the UI component styles.

File:
- src/pages/ContentAccess.jsx (line ~13)

Acceptance criteria:
- Styles load correctly in development and production.
- No CSS path warnings in console.

Labels: bug, frontend
Priority: low
