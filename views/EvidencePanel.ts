import type { EvidenceLink, HypothesisId, Observation } from '../models/types.js';
import { HYPOTHESIS_LABEL, verdictBadge } from './StudentLabels.js';

export function evidenceRows(links: EvidenceLink[], observations: Observation[]): string {
  return links.map((link, i) => {
    const observation = observations.find((o) => link.observationKey.endsWith(`/${o.testId}`));
    const student = link.studentVerdict;
    const options = ([['compatible', '지지'], ['incompatible', '반박'], ['undetermined', '미정']] as const)
      .map(([value, label]) => `<button type="button" class="verdict-btn" data-verdict="${i}:${value}" aria-pressed="${student === value}">${label}</button>`).join('');
    return `<article class="evidence-choice">
      <div><strong>${observation?.shortLabel ?? '관찰'}</strong><span class="small muted">${HYPOTHESIS_LABEL[link.hypothesisId as HypothesisId]} 가설</span></div>
      <p class="small">${observation?.textObservation ?? ''}</p>
      <div class="checks" role="group" aria-label="학생 판단: ${HYPOTHESIS_LABEL[link.hypothesisId]}">${options}</div>
      ${student ? `<div class="model-verdict"><strong>내 판단 ${verdictBadge(student)}</strong><p class="small">가상 모형 ${verdictBadge(link.verdict)} · ${link.memo}</p></div>` : '<p class="hint">판단을 고르면 가상 모형의 판정과 이유가 나타납니다.</p>'}
    </article>`;
  }).join('');
}
