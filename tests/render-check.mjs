// 배포 전 실측: 4폭 렌더 + 5단계 클릭 (headless chromium).
// 실행: npm run build && node tests/render-check.mjs  (shots → /tmp/render-shots)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const SHOT_DIR = '/tmp/render-shots';
const WIDTHS = [320, 360, 768, 1280];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  fs.rmSync(SHOT_DIR, { recursive: true, force: true });
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const server = spawn('python3', ['-m', 'http.server', '4193', '--directory', 'dist'], { stdio: 'ignore' });
  await sleep(1500);
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const w of WIDTHS) {
      const page = await browser.newPage({ viewport: { width: w, height: 800 } });
      const errors = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('requestfailed', (r) => errors.push(`reqfail: ${r.url()} ${r.failure()?.errorText}`));
      await page.goto('http://localhost:4193/', { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const ctaCount = await page.locator('.gi-pulse').count();
      const h1 = await page.locator('h1').first().textContent();
      await page.screenshot({ path: path.join(SHOT_DIR, `observing-${w}.png`), fullPage: true });
      results.push({ width: w, phase: 'observing', overflowPx: overflow, giPulse: ctaCount, h1: h1?.trim(), errors });
      await page.close();
    }
    // 전 여정 클릭 (360 + 1280)
    for (const w of [360, 1280]) {
      const page = await browser.newPage({ viewport: { width: w, height: 800 } });
      const errors = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      await page.goto('http://localhost:4193/', { waitUntil: 'networkidle' });
      await page.click('#startBtn');
      await page.click('[data-test="visibleZoom"]');
      await page.click('[data-test="rakingLight"]');
      const budget = await page.locator('.budget strong').textContent();
      await page.click('[data-goto="evidence"]');
      const rows = await page.locator('table.compat tbody tr').count();
      await page.click('[data-goto="deciding"]');
      await page.click('[data-action="investigate"]');
      await page.fill('#fUnc', '층 정보 없이 덧칠 확정 불가');
      await page.fill('#fRev', '조사만 하므로 되돌림 불필요');
      await page.fill('#fEffect', '가설 구별');
      await page.click('[data-goto="report"]');
      await page.click('#saveBtn');
      const notice = await page.locator('[role="status"]').textContent();
      await page.screenshot({ path: path.join(SHOT_DIR, `report-${w}.png`), fullPage: true });
      results.push({ width: w, phase: 'journey', budget: budget?.trim(), evidenceRows: rows, notice: notice?.trim(), errors });
      await page.close();
    }
  } finally {
    await browser.close();
    server.kill();
  }
  console.log(JSON.stringify(results, null, 2));
  const failed = results.filter((r) => r.errors.length > 0 || (r.overflowPx ?? 0) > 1);
  if (failed.length > 0) {
    console.error('RENDER-CHECK FAIL');
    process.exitCode = 1;
  } else {
    console.log('RENDER-CHECK PASS');
  }
}

main();
