import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const URL = 'https://cosplaytele.com/';
const OUTPUT_DIR = 'docs/design-references/cosplay-tele';

async function captureScreenshots() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Desktop screenshot (1440px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${OUTPUT_DIR}/homepage-desktop-1440.png`,
      fullPage: true,
    });
    console.log('✓ Desktop screenshot saved');

    // Mobile screenshot (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${OUTPUT_DIR}/homepage-mobile-390.png`,
      fullPage: true,
    });
    console.log('✓ Mobile screenshot saved');
  } finally {
    await page.close();
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
