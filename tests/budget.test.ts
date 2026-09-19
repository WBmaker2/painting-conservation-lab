import { describe, expect, it } from 'vitest';
import { BUDGET_START, canAfford, charge, createBudget, remaining } from '../engine/budget.js';

describe('budget', () => {
  it('초기 예산은 6점', () => {
    expect(remaining(createBudget())).toBe(BUDGET_START);
    expect(BUDGET_START).toBe(6);
  });

  it('1+2+3=6 허용', () => {
    let b = createBudget();
    b = charge(b, 1, 'a/r/visibleZoom');
    b = charge(b, 2, 'a/r/rakingLight');
    b = charge(b, 3, 'a/r/layerDiagram');
    expect(remaining(b)).toBe(0);
  });

  it('그 다음 추가 조사는 차단', () => {
    let b = createBudget();
    b = charge(b, 1, 'k1');
    b = charge(b, 2, 'k2');
    b = charge(b, 3, 'k3');
    expect(canAfford(b, 1, 'k4').ok).toBe(false);
  });

  it('같은 조사는 1회만 차감 (중복 차단)', () => {
    let b = createBudget();
    b = charge(b, 1, 'dup');
    const before = b.spent;
    b = charge(b, 1, 'dup');
    expect(b.spent).toBe(before);
    expect(canAfford(b, 1, 'dup').ok).toBe(false);
  });

  it('차단된 charge는 상태를 바꾸지 않음', () => {
    const b = createBudget();
    const full = { ...b, spent: 6, usedKeys: ['x'] };
    expect(charge(full, 1, 'y').spent).toBe(6);
  });

  it('비정상 입력 차단 (NaN·음수·빈 키)', () => {
    const b = createBudget();
    expect(canAfford(b, NaN, 'k').ok).toBe(false);
    expect(canAfford(b, -1, 'k').ok).toBe(false);
    expect(canAfford(b, 1, '').ok).toBe(false);
  });
});
