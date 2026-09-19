// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';

function $(sel: string): HTMLElement | null {
  return document.querySelector(sel);
}
function $all(sel: string): HTMLElement[] {
  return [...document.querySelectorAll(sel)] as HTMLElement[];
}
function click(sel: string): void {
  const el = $(sel);
  if (!el) throw new Error(`없음: ${sel}`);
  el.click();
}
function phase(): string {
  return $('[aria-current="step"]')?.textContent ?? '';
}

beforeEach(async () => {
  vi.resetModules();
  localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
  window.print = () => {};
  await import('../src/main.js');
});

describe('5단계 클릭 여정 (하위 경로 배포 전)', () => {
  it('관찰: 질문1+시작버튼1, 예측 미달이면 차단', () => {
    expect($('h1')?.textContent).toMatch(/바랜|덧칠/);
    expect($all('.gi-pulse')).toHaveLength(1);
    expect($all('[data-art]')).toHaveLength(12);
    // 가설 2개 사전선택 중 2개를 해제 → 시작 차단
    click('[data-hyp="surface-deposit"]');
    click('[data-hyp="overpaint"]');
    click('#startBtn');
    expect(phase()).toMatch(/관찰/);
    expect($('[role="alert"]')?.textContent).toMatch(/2개 이상/);
    // 복구 후 통과
    click('[data-hyp="surface-deposit"]');
    click('[data-hyp="overpaint"]');
    click('#startBtn');
    expect(phase()).toMatch(/조사/);
  });

  it('조사→증거→결정→보고 전 여정, 예산 6-1-2=3', () => {
    click('#startBtn');
    expect(document.body.textContent).toMatch(/6 \/ 6/);
    click('[data-test="visibleZoom"]');
    expect(document.body.textContent).toMatch(/5 \/ 6/);
    expect($('[data-test="visibleZoom"]')?.hasAttribute('disabled')).toBe(true);
    click('[data-test="rakingLight"]');
    expect(document.body.textContent).toMatch(/3 \/ 6/);

    click('[data-goto="evidence"]');
    expect(phase()).toMatch(/증거/);
    expect($all('table.compat tbody tr').length).toBeGreaterThan(0);
    expect(document.body.textContent).toMatch(/층 구조 표/);

    click('[data-goto="deciding"]');
    click('[data-action="investigate"]');
    (document.getElementById('fUnc') as HTMLTextAreaElement).value = '층 정보 없이 덧칠 확정 불가';
    (document.getElementById('fRev') as HTMLTextAreaElement).value = '조사만 하므로 되돌림 불필요';
    (document.getElementById('fEffect') as HTMLTextAreaElement).value = '가설 구별';
    click('[data-goto="report"]');
    expect(phase()).toMatch(/보고/);
    expect(document.body.textContent).toMatch(/추가 조사/);

    click('#saveBtn');
    expect(document.body.textContent).toMatch(/저장됐습니다/);
    const raw = localStorage.getItem('pclab.records.v1') ?? '[]';
    const recs = JSON.parse(raw) as Record<string, unknown>[];
    expect(recs).toHaveLength(1);
    expect(recs[0]).toMatchObject({ schemaVersion: 1, appId: 'painting-conservation-lab', seed: 20260919 });

    click('#resetBtn');
    expect(phase()).toMatch(/관찰/);
  });

  it('관찰 없이 증거 진입 시 조사 단계로 복귀', () => {
    click('#startBtn');
    click('[data-goto="evidence"]');
    expect(phase()).toMatch(/조사/);
    expect($('[role="alert"]')?.textContent).toMatch(/1개 이상/);
  });
});
