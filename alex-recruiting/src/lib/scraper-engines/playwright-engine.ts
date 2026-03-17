/**
 * Playwright Scraping Engine
 *
 * General-purpose Playwright engine for scraping dynamic/JS-rendered pages
 * and auth-walled sites. Uses headless Chromium with a lazy shared browser
 * instance for efficiency across multiple scrape calls.
 *
 * Part of the scraper CLI engine suite.
 * All public functions return null on failure (never throw).
 */

import { chromium, type Browser, type Page } from "playwright";

// ─── Exported Types ─────────────────────────────────────────────────────────

export interface PlaywrightScrapeResult {
  url: string;
  markdown: string;
  title: string;
  wordCount: number;
  source: "playwright";
  scrapedAt: string;
}

// ─── Lazy Shared Browser ────────────────────────────────────────────────────

let _browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    _browser = await chromium.launch({ headless: true });
  }
  return _browser;
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

const REALISTIC_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * Remove non-content elements (scripts, styles, nav, footer, sidebar, ads)
 * from the page before extracting text.
 */
async function removeNoise(page: Page): Promise<void> {
  await page.evaluate(() => {
    const selectors = [
      "script",
      "style",
      "noscript",
      "nav",
      "footer",
      "aside",
      "header",
      "[role='navigation']",
      "[role='banner']",
      "[role='contentinfo']",
      ".sidebar",
      "#sidebar",
      ".ad",
      ".ads",
      ".advertisement",
      "[class*='cookie']",
      "[class*='popup']",
      "[class*='modal']",
      "[class*='banner']",
    ];
    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    }
  });
}

/**
 * Extract clean text content from a page after noise removal.
 * Returns a PlaywrightScrapeResult or null if content is too short (< 100 chars).
 */
async function extractContent(
  page: Page,
  url: string
): Promise<PlaywrightScrapeResult | null> {
  await removeNoise(page);

  const title = await page.title();
  const text = await page.evaluate(() => {
    return document.body?.innerText?.trim() ?? "";
  });

  if (text.length < 100) {
    return null;
  }

  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  return {
    url,
    markdown: text,
    title: title || url.split("/").pop() || "",
    wordCount,
    source: "playwright",
    scrapedAt: new Date().toISOString(),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Render a page in headless Chromium, wait for network idle, and extract
 * clean text content. Removes scripts, styles, nav, footer, sidebar, and ads
 * before extracting innerText.
 *
 * Returns null if content is < 100 chars or on any failure.
 */
export async function scrapeDynamicPage(
  url: string
): Promise<PlaywrightScrapeResult | null> {
  let page: Page | null = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Extra wait for lazy-loaded content
    await delay(2000);

    return await extractContent(page, url);
  } catch (err) {
    console.error(
      `[playwright] Failed to scrape dynamic page ${url}:`,
      err instanceof Error ? err.message : err
    );
    return null;
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

/**
 * Like scrapeDynamicPage but with scroll-to-load behavior (3 scrolls) and a
 * realistic user-agent for bot detection avoidance. Targets main content area
 * using common selectors (main, [role=main], .content, #content, article).
 *
 * Returns null if content is < 100 chars or on any failure.
 */
export async function scrapeForumPage(
  url: string
): Promise<PlaywrightScrapeResult | null> {
  let page: Page | null = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage({
      userAgent: REALISTIC_USER_AGENT,
    });

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Scroll 3 times with 1.5s waits to trigger lazy loading
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await delay(1500);
    }

    await removeNoise(page);

    // Try to extract from main content area first
    const title = await page.title();
    const mainContentSelectors = [
      "main",
      "[role='main']",
      ".content",
      "#content",
      "article",
    ];

    let text = "";
    for (const selector of mainContentSelectors) {
      text = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? (el as HTMLElement).innerText?.trim() ?? "" : "";
      }, selector);
      if (text.length >= 100) break;
    }

    // Fall back to full body if no main content area found
    if (text.length < 100) {
      text = await page.evaluate(() => {
        return document.body?.innerText?.trim() ?? "";
      });
    }

    if (text.length < 100) {
      return null;
    }

    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

    return {
      url,
      markdown: text,
      title: title || url.split("/").pop() || "",
      wordCount,
      source: "playwright",
      scrapedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(
      `[playwright] Failed to scrape forum page ${url}:`,
      err instanceof Error ? err.message : err
    );
    return null;
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

/**
 * Navigate to a URL, find and fill a login form if present, then extract
 * content after authentication.
 *
 * Looks for email/password input fields, fills credentials, clicks the
 * submit button, waits for navigation, then extracts clean text.
 *
 * Returns null on any failure.
 */
export async function scrapeWithAuth(
  url: string,
  credentials: { email: string; password: string }
): Promise<PlaywrightScrapeResult | null> {
  let page: Page | null = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Look for email/username input
    const emailInput = await page.$(
      'input[type="email"], input[name="email"], input[name="username"], input[name="login"], input[autocomplete="email"], input[autocomplete="username"]'
    );

    // Look for password input
    const passwordInput = await page.$('input[type="password"]');

    if (emailInput && passwordInput) {
      await emailInput.fill(credentials.email);
      await passwordInput.fill(credentials.password);

      // Look for submit button
      const submitButton = await page.$(
        'button[type="submit"], input[type="submit"], button:has-text("Log in"), button:has-text("Sign in"), button:has-text("Login"), button:has-text("Submit")'
      );

      if (submitButton) {
        await submitButton.click();
        await page
          .waitForNavigation({ waitUntil: "networkidle", timeout: 15000 })
          .catch(() => {
            // Some SPAs don't trigger traditional navigation
          });
      }

      // Extra wait for post-login content to load
      await delay(2000);
    }

    return await extractContent(page, url);
  } catch (err) {
    console.error(
      `[playwright] Failed to scrape with auth ${url}:`,
      err instanceof Error ? err.message : err
    );
    return null;
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

/**
 * Close the shared browser instance. Call this on CLI exit to clean up
 * resources.
 */
export async function closeBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close().catch(() => {});
    _browser = null;
  }
}
