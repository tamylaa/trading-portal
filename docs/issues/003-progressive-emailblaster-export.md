Title: refactor(email): re-export ProgressiveEmailBlaster for easier imports

Description:
Re-export ProgressiveEmailBlaster centrally for other modules to import without deep paths.

File:
- src/components/ProgressiveEmailBlaster.tsx

Acceptance criteria:
- Component is exported via a main `components/index` or package barrel.
- Importers use `@/components/ProgressiveEmailBlaster` without deep relative paths.

Labels: refactor
Priority: low
