import { test, expect } from '@playwright/test';

// Helper to run axe-core in the page
async function runAxe(page) {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await (window as any).axe.run();
  });
  return results;
}

const stories = [
  { name: 'Hero (Landing)', path: '/iframe.html?id=landing-hero--default' },
  { name: 'Header', path: '/iframe.html?id=header--default' },
  { name: 'Scarcity Banner', path: '/iframe.html?id=landing-scarcitybanner--default' },
];

for (const s of stories) {
  test(`${s.name} - no accessibility violations`, async ({ page }) => {
    await page.goto(`http://localhost:6006${s.path}`);
    const results = await runAxe(page);
    // Ignore known dev tooling issues like webpack overlay frame and viewport meta in Storybook iframe
    const ignoredRuleIds = ['frame-title', 'meta-viewport'];
    const actionable = (results.violations || []).filter(v => !ignoredRuleIds.includes(v.id));
    if (actionable.length > 0) {
      // Print violations to the log for easier triage
      console.error('Accessibility violations found:', JSON.stringify(actionable, null, 2));
    }
    expect(actionable.length).toBe(0);
  });
}
