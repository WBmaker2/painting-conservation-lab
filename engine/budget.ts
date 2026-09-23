export const BUDGET_START = 6;

export interface BudgetState {
  start: number;
  spent: number;
  usedKeys: string[];
}

export function createBudget(start = BUDGET_START): BudgetState {
  const s = Number.isFinite(start) && start >= 0 ? Math.floor(start) : BUDGET_START;
  return { start: s, spent: 0, usedKeys: [] };
}

export function remaining(b: BudgetState): number {
  return Math.max(0, b.start - b.spent);
}

export function canAfford(b: BudgetState, cost: number, key: string): { ok: boolean; reason?: string } {
  if (!Number.isFinite(cost) || cost < 0) return { ok: false, reason: '비용이 올바르지 않습니다.' };
  if (!key) return { ok: false, reason: '조사 키가 없습니다.' };
  if (b.usedKeys.includes(key)) return { ok: false, reason: '이미 완료한 조사는 다시 차감하지 않습니다.' };
  if (cost > remaining(b)) return { ok: false, reason: `조사 점수 부족 — 남은 ${remaining(b)}점, 필요한 점수 ${cost}점` };
  return { ok: true };
}

export function charge(b: BudgetState, cost: number, key: string): BudgetState {
  const check = canAfford(b, cost, key);
  if (!check.ok) return b;
  return { start: b.start, spent: b.spent + cost, usedKeys: [...b.usedKeys, key] };
}
