import type { Decision, EvidenceLink, Observation } from '../models/types.js';
import { HYPOTHESIS_LABEL, verdictBadge } from './StudentLabels.js';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function decisionSummaryHTML(
  decision: Decision | null,
  observations: Observation[],
  links: EvidenceLink[]
): string {
  if (!decision) {
    return `<div class="report-empty">
      <p><strong>아직 결정이 없습니다.</strong> 증거를 1개 이상 연결한 뒤 유지 · 추가 조사 · 가상 처리 미리보기 중 하나를 고르세요.</p>
      <p class="muted">결정은 학생이 직접 고르고, 기대 효과·불확실성·되돌림 생각을 기록합니다.</p>
    </div>`;
  }
  const actionLabel =
    decision.action === 'keep'
      ? '유지 (손대지 않고 보존)'
      : decision.action === 'investigate'
        ? '추가 조사 요청'
        : '가상 처리 미리보기 (되돌리기 가능)';
  const rows = links
    .map((l) => {
      const observation = observations.find((o) => l.observationKey.endsWith(`/${o.testId}`));
      return `<tr><td>${esc(observation?.shortLabel ?? '관찰')}</td><td>${HYPOTHESIS_LABEL[l.hypothesisId]}</td><td>${l.studentVerdict ? verdictBadge(l.studentVerdict) : '기존 기록에 학생 판단 없음'}</td><td>${verdictBadge(l.verdict)}<br>${esc(l.memo)}</td></tr>`;
    })
    .join('');
  const obsList = observations.map((o) => `<li><strong>${esc(o.shortLabel)}</strong> — ${esc(o.textObservation)}</li>`).join('');
  return `<div class="report">
    <h3>결정: ${esc(actionLabel)}</h3>
    <dl class="kv">
      <div><dt>기대 효과</dt><dd>${esc(decision.expectedEffect || '—')}</dd></div>
      <div><dt>남은 불확실성</dt><dd>${esc(decision.uncertainty || '—')}</dd></div>
      <div><dt>되돌릴 수 있는지</dt><dd>${esc(decision.reversibilityNote || '—')}</dd></div>
    </dl>
    <h4>관찰 (${observations.length})</h4>
    <ul class="obs">${obsList}</ul>
    <h4>증거-가설 연결 (${links.length})</h4>
    <table class="compat">
      <thead><tr><th>관찰</th><th>가설</th><th>내 판단</th><th>가상 모형의 판정과 이유</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="muted">이 보고서는 가상 사례의 학습용 판단이며 실제 작품 처리 지침이 아닙니다.</p>
  </div>`;
}
