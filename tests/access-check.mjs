// 배포 전 접근성·인쇄 실측 (3 reduced-motion, 4 axe, 5 print).
// 실행: npm run build && node tests/access-check.mjs  (결과 /tmp/a11y-shots)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const SHOT_DIR = '/tmp/a11y-shots';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function journey(page) {
  await page.click('#startBtn');
  await page.click('[data-test="visibleZoom"]');
  await page.click('[data-test="rakingLight"]');
  await page.click('[data-goto="evidence"]');
  await page.click('[data-goto="deciding"]');
  await page.click('[data-action="investigate"]');
  await page.fill('#fUnc', '층 정보 없이 덧칠 확정 불가');
  await page.fill('#fRev', '조사만 하므로 되돌림 불필요');
  await page.fill('#fEffect', '가설 구별');
  await page.click('[data-goto="report"]');
}

async function main() {
  fs.rmSync(SHOT_DIR, { recursive: true, force: true });
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const server = spawn('python3', ['-m', 'http.server', '4194', '--directory', 'dist'], { stdio: 'ignore' });
  await sleep(1500);
  const browser = await chromium.launch();
  const out = {};
  try {
    // A. reduced-motion
    const rm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 360, height: 800 } });
    const p1 = await rm.newPage();
    const errs1 = [];
    p1.on('pageerror', (e) => errs1.push(e.message));
    await p1.goto('http://localhost:4194/', { waitUntil: 'networkidle' });
    out.motion = await p1.evaluate(() => {
      const el = document.querySelector('.gi-pulse');
      if (!el) return { found: false };
      const cs = getComputedStyle(el);
      return {
        found: true,
        animationName: cs.animationName,
        borderTopWidth: cs.borderTopWidth,
        borderTopColor: cs.borderTopColor
      };
    });
    out.motion.errors = errs1;
    await p1.screenshot({ path: path.join(SHOT_DIR, 'reduced-motion-360.png'), fullPage: true });
    await rm.close();

    // B. axe 5단계
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const phases = [];
    await page.goto('http://localhost:4194/', { waitUntil: 'networkidle' });
    for (const [name, step] of [
      ['observing', null],
      ['testing', () => page.click('#startBtn')],
      ['evidence', async () => { await page.click('[data-test="visibleZoom"]'); await page.click('[data-goto="evidence"]'); }],
      ['deciding', () => page.click('[data-goto="deciding"]')],
      ['report', async () => {
        await page.click('[data-action="keep"]');
        await page.fill('#fUnc', 'x'); await page.fill('#fRev', 'x'); await page.fill('#fEffect', 'x');
        await page.click('[data-goto="report"]');
      }]
    ]) {
      if (step) await step();
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      phases.push({
        phase: name,
        violations: res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))
      });
    }
    out.axe = phases;
    await ctx.close();

    // C. print
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const p2 = await ctx2.newPage();
    await p2.goto('http://localhost:4194/', { waitUntil: 'networkidle' });
    await journey(p2);
    await p2.emulateMedia({ media: 'print' });
    await p2.screenshot({ path: path.join(SHOT_DIR, 'print-report.png'), fullPage: true });
    let pdf = 'unsupported';
    try {
      await p2.pdf({ path: path.join(SHOT_DIR, 'report.pdf'), format: 'A4' });
      pdf = `${fs.statSync(path.join(SHOT_DIR, 'report.pdf')).size} bytes`;
    } catch (e) {
      pdf = `failed: ${String(e).split('\n')[0]}`;
    }
    out.print = { pdf, navHidden: await p2.evaluate(() => getComputedStyle(document.querySelector('.btn-row')).display) };
    await ctx2.close();
  } finally {
    await browser.close();
    server.kill();
  }
  console.log(JSON.stringify(out, null, 2));
  const axeBad = out.axe.flatMap((p) => p.violations.map((v) => ({ ...v, phase: p.phase })));
  if (axeBad.length > 0 || out.motion.animationName !== 'none') {
    console.error('ACCESS-CHECK: 조치 필요 항목 있음');
    process.exitCode = 1;
  } else {
    console.log('ACCESS-CHECK PASS');
  }
}

main();
