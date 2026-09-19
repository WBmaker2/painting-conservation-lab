import { describe, expect, it } from 'vitest';
import { getArtwork, getRegion, validatePrediction } from '../engine/caseModel.js';
import { CASES } from '../scenarios/cases.js';
import { TESTS, observe, observationKey } from '../engine/observationRules.js';

describe('caseModel', () => {
  it('작품 3점, 영역 각 2개', () => {
    expect(CASES).toHaveLength(3);
    for (const a of CASES) expect(a.regions).toHaveLength(2);
  });

  it('모든 region의 hiddenStateId는 규칙표에 존재', () => {
    const known = new Set(['grime-thin', 'overpaint-cover', 'original-umber']);
    for (const a of CASES)
      for (const r of a.regions) expect(known.has(r.hiddenStateId)).toBe(true);
  });

  it('텍스트·도식 없이 판단 불가 항목 없음 (rightsNote 표기)', () => {
    for (const a of CASES) expect(a.rightsNote.length).toBeGreaterThan(0);
  });

  it('작품마다 전문가 노트 존재', () => {
    for (const a of CASES) expect(a.expertNote.length).toBeGreaterThan(0);
  });

  it('getRegion 미존재 → undefined', () => {
    expect(getRegion('nope', 'x')).toBeUndefined();
    expect(getArtwork('nope')).toBeUndefined();
  });

  it('예측은 서로 다른 가설 2개 이상', () => {
    expect(validatePrediction(['surface-deposit']).ok).toBe(false);
    expect(validatePrediction(['surface-deposit', 'surface-deposit']).ok).toBe(false);
    expect(validatePrediction(['surface-deposit', 'overpaint']).ok).toBe(true);
  });
});

describe('observationRules', () => {
  it('같은 숨은 상태·검사는 같은 관찰 (seed 무관 결정론)', () => {
    const a = observe('still-night-apple', 'apple-shadow', 'visibleZoom', 1);
    const b = observe('still-night-apple', 'apple-shadow', 'visibleZoom', 999);
    expect(a).toEqual(b);
    expect((a as { ruleId: string }).ruleId).toBe('grime-thin::visibleZoom');
  });

  it('3 hidden × 5 test = 15 규칙 전수 존재', () => {
    const ids = ['grime-thin', 'overpaint-cover', 'original-umber'];
    for (const hid of ids)
      for (const t of TESTS) {
        const art = CASES.find((a) => a.regions.some((r) => r.hiddenStateId === hid))!;
        const region = art.regions.find((r) => r.hiddenStateId === hid)!;
        const res = observe(art.id, region.id, t.id, 1);
        expect('error' in (res as object)).toBe(false);
      }
  });

  it('비용표 1/2/3 + P1 2/2 고정', () => {
    expect(TESTS.find((t) => t.id === 'visibleZoom')?.cost).toBe(1);
    expect(TESTS.find((t) => t.id === 'rakingLight')?.cost).toBe(2);
    expect(TESTS.find((t) => t.id === 'layerDiagram')?.cost).toBe(3);
    expect(TESTS.find((t) => t.id === 'infrared')?.cost).toBe(2);
    expect(TESTS.find((t) => t.id === 'ultraviolet')?.cost).toBe(2);
    expect(TESTS).toHaveLength(5);
  });

  it('빈 입력·미지원 조사 → error (비용 차감 없음 전제)', () => {
    expect('error' in observe('', 'r', 'visibleZoom')).toBe(true);
    expect('error' in observe('still-night-apple', 'apple-shadow', 'xray' as never)).toBe(true);
  });

  it('observationKey 형식 artwork/region/test', () => {
    expect(observationKey({ artworkId: 'a', regionId: 'r', testId: 'visibleZoom' })).toBe('a/r/visibleZoom');
  });
});
