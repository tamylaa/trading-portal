Title: feat(content-hub): use shared ApiClient for sharing & shared items

Description:
Refactor `HyperContentHub.jsx` to use the shared ApiClient for sharing and shared items.

File:
- packages/content-hub/src/HyperContentHub.jsx (lines ~156, ~162)

Acceptance criteria:
- Content Hub uses the shared ApiClient module from `@tamyla/shared`.
- Request handling is consistent across hubs.

Labels: enhancement, packages
Priority: medium
