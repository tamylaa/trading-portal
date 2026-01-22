// .eslintrc.js - Custom ESLint rules for layout consistency

module.exports = {
  // ... existing config ...

  rules: {
    // Custom rule to enforce PageLayout usage in page components
    'layout/page-layout-required': {
      create: function(context) {
        return {
          // Check that page components export a component wrapped in PageLayout
          ExportDefaultDeclaration(node) {
            const filename = context.getFilename();

            // Only apply to page components (in src/pages/)
            if (!filename.includes('/pages/')) {
              return;
            }

            // Check if the component uses PageLayout
            let usesPageLayout = false;

            // Simple check: look for PageLayout import and usage
            const sourceCode = context.getSourceCode();

            // Check imports
            const imports = sourceCode.ast.body.filter(
              stmt => stmt.type === 'ImportDeclaration'
            );

            const hasPageLayoutImport = imports.some(imp =>
              imp.source.value.includes('PageLayout')
            );

            if (hasPageLayoutImport) {
              // Check if PageLayout is used in the JSX
              usesPageLayout = sourceCode.text.includes('<PageLayout');
            }

            if (!usesPageLayout) {
              context.report({
                node,
                message: 'Page components must use PageLayout for consistent styling. ' +
                        'See docs/PAGE_LAYOUT_GUIDELINES.md for usage instructions.'
              });
            }
          }
        };
      }
    }
  }
};

/*
 * To enable this rule, add to your ESLint config:
 *
 * {
 *   "rules": {
 *     "layout/page-layout-required": "error"
 *   }
 * }
 *
 * This will catch pages that don't use PageLayout during development.
 */
