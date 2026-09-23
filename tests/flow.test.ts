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
function choosePredictions(): void {
  click('[data-hyp="surface-deposit"]');
  click('[data-hyp="overpaint"]');
}
function judgeAllEvidence(): void {
  for (let i = 0; i < $all('.evidence-choice').length; i++) click(`[data-verdict="${i}:undetermined"]`);
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
    expect($all('[data-art]')).toHaveLength(11);
    expect($('.other-works')?.hasAttribute('open')).toBe(false);
    // 가설을 직접 고르지 않으면 시작할 수 없음
    click('#startBtn');
    expect(phase()).toMatch(/관찰/);
    expect($('[role="alert"]')?.textContent).toMatch(/정확히 2개/);
    // 복구 후 통과
    choosePredictions();
    click('#startBtn');
    expect(phase()).toMatch(/조사/);
  });

  it('조사→증거→결정→보고 전 여정, 예산 6-1-2=3', () => {
    choosePredictions();
    click('#startBtn');
    expect(document.body.textContent).toMatch(/조사 점수 6\/6/);
    click('[data-test="visibleZoom"]');
    expect(document.body.textContent).toMatch(/5 \/ 6/);
    expect($('[data-test="visibleZoom"]')?.hasAttribute('disabled')).toBe(true);
    click('[data-test="rakingLight"]');
    expect(document.body.textContent).toMatch(/3 \/ 6/);

    click('[data-goto="evidence"]');
    expect(phase()).toMatch(/증거/);
    expect(document.body.textContent).toMatch(/아직 층 정보를 확인하지 않았어요/);
    expect($('table.compat')).toBeNull();
    judgeAllEvidence();

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
    choosePredictions();
    click('#startBtn');
    click('[data-goto="evidence"]');
    expect(phase()).toMatch(/조사/);
    expect($('[role="alert"]')?.textContent).toMatch(/조사를 1개 이상/);
  });

  it('층 정보 확인 전에는 표를 숨기고 조사 후에만 가상 층 표를 표시', () => {
    choosePredictions();
    click('#startBtn');
    click('[data-test="visibleZoom"]');
    click('[data-goto="evidence"]');
    expect(document.body.textContent).toMatch(/아직 층 정보를 확인하지 않았어요/);
    expect($('table.compat')).toBeNull();

    click('#main button[data-goto="testing"]');
    click('[data-test="layerDiagram"]');
    click('[data-goto="evidence"]');
    expect($('table.compat')).not.toBeNull();
    expect(document.body.textContent).toMatch(/아래 도식은 층을 이해하기 위한 가상 모형이며 실제 두께나 재료를 측정한 결과가 아닙니다/);
  });
});
