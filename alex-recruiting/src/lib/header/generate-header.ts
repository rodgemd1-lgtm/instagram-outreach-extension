// ---------------------------------------------------------------------------
// Header Image Generator — HTML → Puppeteer Screenshot → PNG
// ---------------------------------------------------------------------------
// Generates a 1500x500px X/Twitter header banner for Jacob Rodgers.
// Uses Puppeteer to render styled HTML and capture a screenshot.
// ---------------------------------------------------------------------------

import puppeteer from "puppeteer-core";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const HEADER_WIDTH = 1500;
const HEADER_HEIGHT = 500;

function getHeaderHTML(): string {
  // Pewaukee Pirates official colors: Red (#CC0022) and Black (#222222)
  const PIRATE_RED = "#CC0022";
  const PIRATE_RED_RGB = "204, 0, 34";
  const PIRATE_BLACK = "#111111";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${HEADER_WIDTH}px;
    height: ${HEADER_HEIGHT}px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .container {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, ${PIRATE_BLACK} 0%, #1a1a1a 25%, #1c0a0a 50%, ${PIRATE_BLACK} 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  /* Geometric angular design — Pewaukee Red accents */
  .geo-1 {
    position: absolute;
    top: -80px;
    right: -40px;
    width: 500px;
    height: 500px;
    border: 3px solid rgba(${PIRATE_RED_RGB}, 0.18);
    transform: rotate(45deg);
  }
  .geo-2 {
    position: absolute;
    bottom: -120px;
    left: -60px;
    width: 400px;
    height: 400px;
    border: 2px solid rgba(${PIRATE_RED_RGB}, 0.12);
    transform: rotate(30deg);
  }
  .geo-3 {
    position: absolute;
    top: 40px;
    left: 120px;
    width: 200px;
    height: 200px;
    border: 2px solid rgba(255, 255, 255, 0.06);
    transform: rotate(15deg);
  }
  .geo-4 {
    position: absolute;
    bottom: 20px;
    right: 200px;
    width: 300px;
    height: 300px;
    border: 1px solid rgba(255, 255, 255, 0.04);
    transform: rotate(-20deg);
  }

  /* Diagonal accent lines — Pewaukee Red */
  .line-1 {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(135deg,
      transparent 0%, transparent 35%,
      rgba(${PIRATE_RED_RGB}, 0.07) 35.5%, rgba(${PIRATE_RED_RGB}, 0.07) 36%,
      transparent 36.5%, transparent 100%);
  }
  .line-2 {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(135deg,
      transparent 0%, transparent 60%,
      rgba(${PIRATE_RED_RGB}, 0.05) 60.5%, rgba(${PIRATE_RED_RGB}, 0.05) 61%,
      transparent 61.5%, transparent 100%);
  }

  /* Subtle grid */
  .grid-overlay {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .content {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 0 60px;
  }

  .jersey {
    font-size: 120px;
    font-weight: 900;
    color: rgba(${PIRATE_RED_RGB}, 0.08);
    position: absolute;
    top: 50%;
    left: 80px;
    transform: translateY(-50%);
    line-height: 1;
    letter-spacing: -4px;
  }

  .jersey-right {
    font-size: 120px;
    font-weight: 900;
    color: rgba(${PIRATE_RED_RGB}, 0.08);
    position: absolute;
    top: 50%;
    right: 80px;
    transform: translateY(-50%);
    line-height: 1;
    letter-spacing: -4px;
  }

  .name {
    font-size: 76px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 8px;
    text-transform: uppercase;
    line-height: 1;
    text-shadow: 0 2px 30px rgba(0, 0, 0, 0.4);
  }

  .position-tag {
    display: inline-block;
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 6px;
    text-transform: uppercase;
    margin-top: 18px;
    padding: 8px 28px;
    border: 2px solid ${PIRATE_RED};
    background: rgba(${PIRATE_RED_RGB}, 0.15);
  }

  .position-tag span {
    color: ${PIRATE_RED};
    font-weight: 900;
  }

  .details {
    font-size: 16px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 5px;
    text-transform: uppercase;
    margin-top: 14px;
  }

  .school {
    font-size: 18px;
    font-weight: 600;
    color: ${PIRATE_RED};
    letter-spacing: 6px;
    text-transform: uppercase;
    margin-top: 10px;
  }

  /* Accent bars — bold Pewaukee Red */
  .accent-bar {
    position: absolute;
    bottom: 0; left: 0;
    width: 100%; height: 5px;
    background: linear-gradient(90deg, transparent 5%, ${PIRATE_RED} 30%, ${PIRATE_RED} 70%, transparent 95%);
  }
  .accent-bar-top {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 3px;
    background: linear-gradient(90deg, transparent, rgba(${PIRATE_RED_RGB}, 0.4), transparent);
  }
</style>
</head>
<body>
<div class="container">
  <div class="geo-1"></div>
  <div class="geo-2"></div>
  <div class="geo-3"></div>
  <div class="geo-4"></div>
  <div class="line-1"></div>
  <div class="line-2"></div>
  <div class="grid-overlay"></div>

  <div class="jersey">79</div>
  <div class="jersey-right">79</div>

  <div class="content">
    <div class="name">Jacob Rodgers</div>
    <div class="position-tag"><span>DT</span> &nbsp;/&nbsp; <span>OG</span> &nbsp;&mdash;&nbsp; Defensive Tackle &amp; Offensive Guard</div>
    <div class="details">6&apos;4&quot; &nbsp;|&nbsp; 285 lbs &nbsp;|&nbsp; Class of 2029</div>
    <div class="school">Pewaukee Pirates &nbsp;|&nbsp; Wisconsin</div>
  </div>

  <div class="accent-bar"></div>
  <div class="accent-bar-top"></div>
</div>
</body>
</html>`;
}

export async function generateHeaderImage(): Promise<string> {
  const outputDir = path.join(process.cwd(), "public");
  const outputPath = path.join(outputDir, "header-image.png");

  await mkdir(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: HEADER_WIDTH, height: HEADER_HEIGHT });
    await page.setContent(getHeaderHTML(), { waitUntil: "networkidle0" });

    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: HEADER_WIDTH, height: HEADER_HEIGHT },
    });

    await writeFile(outputPath, screenshot);
    return outputPath;
  } finally {
    await browser.close();
  }
}

export async function getHeaderImageBase64(): Promise<string> {
  const puppeteerModule = await import("puppeteer-core");
  const browser = await puppeteerModule.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: HEADER_WIDTH, height: HEADER_HEIGHT });
    await page.setContent(getHeaderHTML(), { waitUntil: "networkidle0" });

    const screenshot = await page.screenshot({
      type: "png",
      encoding: "base64",
      clip: { x: 0, y: 0, width: HEADER_WIDTH, height: HEADER_HEIGHT },
    });

    return screenshot as string;
  } finally {
    await browser.close();
  }
}
