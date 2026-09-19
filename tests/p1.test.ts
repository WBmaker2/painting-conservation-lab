import { describe, expect, it } from 'vitest';
import type { Observation } from '../models/types.js';
import { linkEvidence } from '../engine/evidenceValidator.js';
import { observe, planCombos } from '../engine/observationRules.js';

function mustObs(artworkId: string, regionId: string, testId: 'infrared' | 'ultraviolet'): Observation {
  const r = observe(artworkId, regionId, testId, 1);
  if ('error' in r) throw new Error(`규칙 누락: ${artworkId}/${regionId}/${testId}`);
  return r;
}

describe('P1 investigations', () => {
  it('덧칠 적외선: 덧칠 지지·원래안료 반박', () => {
    const o = mustObs('still-night-apple', 'table-cloth', 'infrared');
    expect(linkEvidence(o, 'overpaint').verdict).toBe('compatible');
    expect(linkEvidence(o, 'original-dark').verdict).toBe('incompatible');
  });

  it('덧칠 자외선: 덧칠 지지·표면오염 반박', () => {
    const o = mustObs('still-night-apple', 'table-cloth', 'ultraviolet');
    expect(linkEvidence(o, 'overpaint').verdict).toBe('compatible');
    expect(linkEvidence(o, 'surface-deposit').verdict).toBe('incompatible');
  });

  it('원래안료 자외선: 원래안료만 지지', () => {
    const o = mustObs('reed-field', 'water-dark', 'ultraviolet');
    expect(linkEvidence(o, 'original-dark').verdict).toBe('compatible');
    expect(linkEvidence(o, 'overpaint').verdict).toBe('incompatible');
  });

  it('오염 적외선: 확대 한계 보완 (덧칠 반박)', () => {
    const o = mustObs('still-night-apple', 'apple-shadow', 'infrared');
    expect(linkEvidence(o, 'surface-deposit').verdict).toBe('compatible');
    expect(linkEvidence(o, 'overpaint').verdict).toBe('incompatible');
  });
});

describe('planCombos (전략 비교, 정답 비의존)', () => {
  it('남은 6점: 전체 포함 상위 조합', () => {
    const combos = planCombos(6, []);
    expect(combos.length).toBeGreaterThan(0);
    expect(combos[0].cost).toBe(6);
    for (const c of combos) expect(c.cost).toBeLessThanOrEqual(6);
  });

  it('사용한 조사 제외·예산 초과 제외', () => {
    const combos = planCombos(3, ['visibleZoom', 'rakingLight', 'layerDiagram', 'infrared']);
    expect(combos).toEqual([{ tests: ['ultraviolet'], cost: 2 }]);
  });

  it('0점·음수·NaN → 빈 목록', () => {
    expect(planCombos(0, [])).toEqual([]);
    expect(planCombos(-1, [])).toEqual([]);
    expect(planCombos(NaN, [])).toEqual([]);
  });
});
