import { describe, expect, it } from 'vitest';
import type { Observation } from '../models/types.js';
import { linkEvidence, summarizeConsistency } from '../engine/evidenceValidator.js';
import { observe } from '../engine/observationRules.js';

function mustObs(artworkId: string, regionId: string, testId: 'visibleZoom' | 'rakingLight' | 'layerDiagram'): Observation {
  const r = observe(artworkId, regionId, testId, 1);
  if ('error' in r) throw new Error(`규칙 누락: ${artworkId}/${regionId}/${testId}`);
  return r;
}

describe('evidenceValidator', () => {
  it('오염 사건 층정보: 오염 지지·덧칠 반박', () => {
    const o = mustObs('still-night-apple', 'apple-shadow', 'layerDiagram');
    expect(linkEvidence(o, 'surface-deposit').verdict).toBe('compatible');
    expect(linkEvidence(o, 'overpaint').verdict).toBe('incompatible');
  });

  it('덧칠 사건 측면광: 덧칠 지지·원래안료 반박', () => {
    const o = mustObs('still-night-apple', 'table-cloth', 'rakingLight');
    expect(linkEvidence(o, 'overpaint').verdict).toBe('compatible');
    expect(linkEvidence(o, 'original-dark').verdict).toBe('incompatible');
  });

  it('원래안료 사건 층정보: 원래안료만 지지', () => {
    const o = mustObs('reed-field', 'water-dark', 'layerDiagram');
    expect(linkEvidence(o, 'original-dark').verdict).toBe('compatible');
    expect(linkEvidence(o, 'surface-deposit').verdict).toBe('incompatible');
    expect(linkEvidence(o, 'overpaint').verdict).toBe('incompatible');
  });

  it('확대만으로는 확정 불가 셀이 존재 (서두른 단정 방지)', () => {
    const o = mustObs('reed-field', 'water-dark', 'visibleZoom');
    const verdicts = [
      linkEvidence(o, 'surface-deposit').verdict,
      linkEvidence(o, 'overpaint').verdict
    ];
    expect(verdicts).toContain('undetermined');
  });

  it('빈 증거는 보류 유도', () => {
    expect(summarizeConsistency([]).blockedRash).toBe(true);
  });

  it('undetermined만 있으면 보류 유도', () => {
    expect(
      summarizeConsistency([
        { observationKey: 'k', hypothesisId: 'surface-deposit', verdict: 'undetermined', memo: '' }
      ]).blockedRash
    ).toBe(true);
  });
});
