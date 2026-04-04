import { describe, expect, it } from 'vitest';

/**
 * Client App E2E Tests.
 *
 * HTTP-level smoke tests verifying the React SPA is served correctly,
 * returns proper HTML, assets, and response headers.
 * These tests run against a live client-app dev server.
 */

const CLIENT_BASE_URL = process.env['CLIENT_BASE_URL'] || 'http://localhost:4200';

async function fetchClient(path: string): Promise<Response> {
  return fetch(`${CLIENT_BASE_URL}${path}`);
}

describe('Client App Loads', () => {
  it('homepage returns 200 with HTML content', async () => {
    const response = await fetchClient('/');

    expect(response.status).toBe(200);

    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('text/html');
  });

  it('homepage HTML contains React root element', async () => {
    const response = await fetchClient('/');
    const html = await response.text();

    expect(html).toContain('<div id="root">');
  });

  it('homepage has correct title', async () => {
    const response = await fetchClient('/');
    const html = await response.text();

    expect(html).toMatch(/<title>ClientApp<\/title>/);
  });

  it('SPA routes return the index HTML (client-side routing)', async () => {
    const response = await fetchClient('/page-2');

    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain('<div id="root">');
  });
});

describe('Client App Assets', () => {
  it('main entry point is served as a module', async () => {
    const response = await fetchClient('/');
    const html = await response.text();

    // Vite serves the app as ES module scripts
    expect(html).toMatch(/<script type="module"/);
  });

  it('JavaScript assets are served', async () => {
    const response = await fetchClient('/');
    const html = await response.text();

    // Vite injects script tags for the app bundle
    expect(html).toMatch(/<script\b/);
  });

  it('no 404 on critical asset URLs', async () => {
    const indexResponse = await fetchClient('/');
    const html = await indexResponse.text();

    // Extract JS/CSS URLs from the HTML
    const assetUrls = [...html.matchAll(/(?:src|href)="(\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);

    for (const url of assetUrls) {
      // Skip optional config files
      if (url.includes('appConfig')) continue;

      const assetResponse = await fetchClient(url);
      expect(assetResponse.status, `Expected 200 for ${url}, got ${assetResponse.status}`).toBe(
        200,
      );
    }
  });
});
