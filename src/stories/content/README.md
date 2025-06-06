# Story Content Assets

This directory contains all static assets and media files used by stories in the application.

## Directory Structure

```
content/
├── images/               # Image assets
│   ├── spices-export/    # Images for spices export guide
│   └── github-cloudflare/ # Images for GitHub/Cloudflare guide
├── docs/                 # Document assets (PDFs, etc.)
└── data/                 # Data files used in stories
```

## Guidelines

### Adding New Assets
1. Place files in the appropriate subdirectory based on their type:
   - Images: `.png`, `.jpg`, `.svg` files in `images/`
   - Documents: `.pdf`, `.docx` files in `docs/`
   - Data: `.json`, `.csv` files in `data/`

2. Naming Conventions:
   - Use kebab-case for all filenames
   - Be descriptive but concise
   - Include content type in name (e.g., `export-flow-diagram.svg`)

### Best Practices
- Keep file sizes optimized for web
- Use appropriate formats:
  - Photos: `.jpg`
  - Icons/Diagrams: `.svg`
  - Screenshots: `.png`
- Update this README when adding new asset types

### Usage in Stories
Reference assets in your stories using the `@/stories/content/` path:

```typescript
const imagePath = '@/stories/content/images/spices-export/office-location.jpg';
```

## Maintenance
- Regularly review and clean up unused assets
- Update asset references if files are moved or renamed
- Document any special handling requirements for assets
