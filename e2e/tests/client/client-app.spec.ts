import { expect, test } from '@playwright/test';

/**
 * Client App E2E Tests.
 *
 * High-impact smoke tests verifying the React SPA loads,
 * renders correctly, and has working navigation.
 * These tests run against a live client-app dev server.
 */

test.describe('Client App Loads', () => {
  test('homepage renders the React root', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // React root div should exist and have content
    const root = page.locator('#root');
    await expect(root).toBeAttached();

    // Wait for React to hydrate
    await expect(root.locator('*').first()).toBeAttached({ timeout: 10_000 });

    // No JS runtime errors
    expect(errors).toHaveLength(0);
  });

  test('homepage has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('ClientApp');
  });

  test('navigation links are rendered', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for React to render navigation
    const nav = page.locator('nav');
    await expect(nav).toBeAttached({ timeout: 10_000 });

    // Should have links
    const links = nav.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('client-side routing works (page-2)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click the page-2 link (use first() since there may be multiple matching links)
    const page2Link = page.locator('a[href="/page-2"]').first();
    await expect(page2Link).toBeAttached({ timeout: 10_000 });
    await page2Link.click();

    // URL should update without full page reload
    await expect(page).toHaveURL(/\/page-2/);
  });
});

test.describe('Client App Assets', () => {
  test('CSS is loaded (stylesheets present)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const stylesheets = await page.evaluate(
      () => document.querySelectorAll('link[rel="stylesheet"], style').length,
    );
    expect(stylesheets).toBeGreaterThan(0);
  });

  test('no failed network requests on page load (except optional config)', async ({ page }) => {
    const failedRequests: string[] = [];
    page.on('response', (response) => {
      // Ignore optional appConfig.js -- it is loaded via script tag but not required
      if (response.status() >= 400 && !response.url().includes('appConfig.js')) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(failedRequests).toHaveLength(0);
  });
});
