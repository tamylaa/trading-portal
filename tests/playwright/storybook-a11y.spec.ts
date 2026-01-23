import { test, expect, type Page } from '@playwright/test';

// Axe result types (minimal surface used by tests)
type AxeViolation = {
  id: string;
  impact?: string;
  nodes?: any[];
  help?: string;
  helpUrl?: string;
  description?: string;
};

type AxeResults = {
  violations?: AxeViolation[];
};

// Helper to run axe-core in the page
async function runAxe(page: Page): Promise<AxeResults> {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await (window as any).axe.run();
  });
  return results as AxeResults;
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
    const ignoredRuleIds: string[] = ['frame-title', 'meta-viewport'];
    const actionable = (results.violations ?? []).filter((v: AxeViolation) => {
      // ensure id exists and is a string before checking
      return typeof v?.id === 'string' && !ignoredRuleIds.includes(v.id);
    });
    if (actionable.length > 0) {
      // Print violations to the log for easier triage
      console.error('Accessibility violations found:', JSON.stringify(actionable, null, 2));
    }
    expect(actionable.length).toBe(0);
  });
}
