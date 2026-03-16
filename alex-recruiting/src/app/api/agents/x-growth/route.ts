import { NextRequest, NextResponse } from "next/server";

interface XGrowthRequest {
  handle: string;
  maxTweets?: number;
}

interface ScrapedTweet {
  text: string;
  likes: number;
  retweets: number;
  replies: number;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as XGrowthRequest;
    const { handle, maxTweets = 10 } = body;

    if (!handle) {
      return NextResponse.json(
        { error: "handle is required" },
        { status: 400 }
      );
    }

    const cleanHandle = handle.replace(/^@/, "");

    // Playwright-based scraping requires local execution.
    // In production, this returns a structured stub; locally
    // it can be extended to spawn a Playwright process.
    const isLocal =
      process.env.NODE_ENV === "development" ||
      process.env.ALLOW_PLAYWRIGHT === "true";

    if (!isLocal) {
      return NextResponse.json(
        {
          error: "X Growth Scraper requires local Playwright execution. Set ALLOW_PLAYWRIGHT=true or run in development.",
          handle: cleanHandle,
        },
        { status: 403 }
      );
    }

    // Attempt dynamic Playwright import — only available when installed locally
    let tweets: ScrapedTweet[] = [];
    try {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      await page.goto(`https://x.com/${cleanHandle}`, {
        waitUntil: "networkidle",
        timeout: 15000,
      });

      // Extract tweet data from timeline
      tweets = await page.evaluate((max: number) => {
        const tweetEls = document.querySelectorAll(
          'article[data-testid="tweet"]'
        );
        const results: ScrapedTweet[] = [];

        tweetEls.forEach((el, i) => {
          if (i >= max) return;
          const textEl = el.querySelector('[data-testid="tweetText"]');
          const text = textEl?.textContent || "";

          // Extract engagement metrics from aria labels
          const metrics = el.querySelectorAll(
            '[role="group"] button[aria-label]'
          );
          let likes = 0,
            retweets = 0,
            replies = 0;
          metrics.forEach((btn) => {
            const label = btn.getAttribute("aria-label") || "";
            const num = parseInt(label.replace(/[^\d]/g, "")) || 0;
            if (label.includes("like")) likes = num;
            else if (label.includes("repost") || label.includes("retweet"))
              retweets = num;
            else if (label.includes("repl")) replies = num;
          });

          const timeEl = el.querySelector("time");
          const timestamp = timeEl?.getAttribute("datetime") || "";

          results.push({ text, likes, retweets, replies, timestamp });
        });

        return results;
      }, maxTweets);

      await browser.close();
    } catch (playwrightError) {
      const msg =
        playwrightError instanceof Error
          ? playwrightError.message
          : String(playwrightError);

      // Playwright not installed or page load failed — return graceful error
      return NextResponse.json(
        {
          error: "Playwright scrape failed",
          detail: msg,
          handle: cleanHandle,
          hint: "Ensure playwright is installed: npx playwright install chromium",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      handle: cleanHandle,
      tweetCount: tweets.length,
      tweets,
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
