import { test, expect, type Page } from '@playwright/test';

async function runAxe(page: Page): Promise<any> {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await (window as any).axe.run();
  });
  return results;
}

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Stories', path: '/stories' }
];

for (const p of pages) {
  test(`${p.name} page - accessibility`, async ({ page }) => {
    await page.goto(`http://localhost:3000${p.path}`);
    const results = await runAxe(page);
    // Filter out known non-actionable violations injected by dev tooling
    const ignoredRuleIds: string[] = ['frame-title', 'meta-viewport'];
    const actionable = (results.violations || []).filter((v: any) => {
      // ensure v.id exists and is a string before checking against ignoredRuleIds
      return typeof v.id === 'string' && !ignoredRuleIds.includes(v.id);
    });
    if (actionable.length > 0) {
      console.error('Accessibility violations:', JSON.stringify(actionable, null, 2));
    }
    expect(actionable.length).toBe(0);
  });
}
