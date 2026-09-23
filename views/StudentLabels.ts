import type { Compat, HypothesisId } from '../models/types.js';

export const HYPOTHESIS_LABEL: Record<HypothesisId, string> = {
  'surface-deposit': '표면에 쌓인 오염',
  overpaint: '나중에 덧칠한 물감',
  'original-dark': '원래 어두운 물감'
};

export const hypothesisDescription: Record<HypothesisId, string> = {
  'surface-deposit': '표면에 먼지나 그을음이 쌓였을 수 있어요.',
  overpaint: '나중에 다른 물감으로 덧그렸을 수 있어요.',
  'original-dark': '처음 그릴 때부터 어두운 색이었을 수 있어요.'
};

export const VERDICT_LABEL: Record<Compat, string> = {
  compatible: '● 지지',
  incompatible: '✕ 반박',
  undetermined: '■ 미정'
};

export function verdictBadge(verdict: Compat, label = VERDICT_LABEL[verdict]): string {
  const style = verdict === 'compatible' ? 'ok' : verdict === 'incompatible' ? 'no' : 'mid';
  return `<span class="badge ${style}">${label}</span>`;
}
