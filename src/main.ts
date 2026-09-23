import './style.css';
import type { DecisionAction, EvidenceLink, HypothesisId, Observation, Phase, RunRecord, TestId } from '../models/types.js';
import { getArtwork, getRegion, listArtworks, validatePrediction } from '../engine/caseModel.js';
import { TESTS, observe, observationKey, planCombos } from '../engine/observationRules.js';
import { BUDGET_START, canAfford, charge, createBudget, remaining, type BudgetState } from '../engine/budget.js';
import { linkEvidence, summarizeConsistency } from '../engine/evidenceValidator.js';
import { artworkThumbSVG, observationSVG } from '../views/ArtworkCompare.js';
import { decisionSummaryHTML } from '../views/DecisionReport.js';
import { evidenceRows } from '../views/EvidencePanel.js';
import { layerTable, transferPrompt } from '../views/LearningExtras.js';
import { focusWithVisibleRing } from '../views/FocusRing.js';
import { HYPOTHESIS_LABEL, hypothesisDescription } from '../views/StudentLabels.js';
import { downloadJSON, loadRecords, saveRecord } from './storage.js';

const ENGINE_VERSION = '0.1.0';
const SCENARIO_VERSION = 'p1-5tests';

interface State {
  phase: Phase;
  artworkId: string;
  regionId: string;
  hypotheses: HypothesisId[];
  note: string;
  budget: BudgetState;
  observations: Observation[];
  links: EvidenceLink[];
  decision: { action: DecisionAction | null; uncertainty: string; reversibility: string; effect: string } | null;
  error: string;
  notice: string;
  seed: number;
}

const state: State = {
  phase: 'observing',
  artworkId: 'still-night-apple',
  regionId: 'apple-shadow',
  hypotheses: [],
  note: '',
  budget: createBudget(BUDGET_START),
  observations: [],
  links: [],
  decision: null,
  error: '',
  notice: '',
  seed: 20260919
};

const app = document.getElementById('app')!;
const PHASES: { id: Phase; label: string }[] = [
  { id: 'observing', label: '관찰·가설' },
  { id: 'testing', label: '조사' },
  { id: 'evidence', label: '증거 연결' },
  { id: 'deciding', label: '결정' },
  { id: 'report', label: '보고' }
];

function setPhase(p: Phase): void {
  state.phase = p;
  state.error = '';
  state.notice = '';
  render();
  const h = document.querySelector('[data-autofocus]') as HTMLElement | null;
  h?.focus();
}

function currentRegion() {
  return getRegion(state.artworkId, state.regionId);
}

function rebuildLinks(): void {
  const previous = state.links;
  const out: EvidenceLink[] = [];
  for (const o of state.observations) {
    for (const h of state.hypotheses) {
      const next = linkEvidence(o, h);
      const old = previous.find((item) => item.observationKey === next.observationKey && item.hypothesisId === h);
      out.push(old ? { ...next, studentVerdict: old.studentVerdict } : next);
    }
  }
  state.links = out;
}

function requestTest(testId: TestId): void {
  state.error = '';
  const meta = TESTS.find((t) => t.id === testId);
  if (!meta) { state.error = '지원하지 않는 조사입니다.'; render(); return; }
  const key = `${state.artworkId}/${state.regionId}/${testId}`;
  const check = canAfford(state.budget, meta.cost, key);
  if (!check.ok) { state.error = check.reason ?? '예산 문제'; render(); focusError(); return; }
  const res = observe(state.artworkId, state.regionId, testId, state.seed);
  if ('error' in res) { state.error = `${res.error} 비용은 차감되지 않았습니다. 다시 시도하거나 텍스트 설명으로 계속하세요.`; render(); focusError(); return; }
  state.budget = charge(state.budget, meta.cost, key);
  state.observations = [...state.observations.filter((o) => observationKey(o) !== key), res];
  rebuildLinks();
  render();
}

function focusError(): void {
  requestAnimationFrame(() => (document.querySelector('[role="alert"]') as HTMLElement | null)?.focus());
}

function hypothesisToggle(id: HypothesisId): void {
  if (!state.hypotheses.includes(id) && state.hypotheses.length === 2) { state.error = '가설은 서로 다른 두 개까지만 선택할 수 있습니다.'; render(); return; }
  state.hypotheses = state.hypotheses.includes(id)
    ? state.hypotheses.filter((h) => h !== id)
    : [...state.hypotheses, id];
  if (state.observations.length) rebuildLinks();
  render();
}

function render(): void {
  const art = getArtwork(state.artworkId);
  const region = currentRegion();
  const rem = remaining(state.budget);
  const stepIdx = PHASES.findIndex((p) => p.id === state.phase);

  app.innerHTML = `
  <a class="skip" href="#main">본문으로 건너뛰기</a>
  <header class="topbar"><div class="topbar-inner">
    <div class="brand"><span class="brand-mark" aria-hidden="true">◐</span><span>보존 연구실</span><span class="virtual-pill">가상 자료 · 실측 아님</span></div>
    <div class="top-actions">
      <span class="small muted" aria-label="남은 조사 점수, 실제 비용 아님">조사 점수 ${rem}/${state.budget.start} (실제 비용 아님)</span>
      <button class="ghost-btn" id="changelogBtn" type="button">업데이트 내역</button>
    </div>
  </div></header>
  <div class="wrap"><main id="main">
    <p class="progress-mobile" aria-live="polite">${stepIdx + 1} / ${PHASES.length}단계 · ${PHASES[stepIdx]?.label}</p>
    <ol class="rail" aria-label="진행 단계">
      ${PHASES.map((p, i) => `<li><span class="step ${i < stepIdx ? 'done' : ''}" ${p.id === state.phase ? 'aria-current="step"' : ''}>${i + 1}. ${p.label}</span></li>`).join('')}
    </ol>
    ${state.phase === 'observing' ? heroView() : ''}
    <div class="grid2 visual-first">
      <section class="card" aria-label="시각 자료">
        <h2 data-autofocus tabindex="-1">${phaseTitle()}</h2>
        <p class="muted small">${phaseDesc()}</p>
        ${visualPanel()}
      </section>
      <section class="card" aria-label="조건과 실행">
        ${controlPanel(art?.fictionalTitle ?? '', region?.label ?? '')}
        ${state.notice ? `<div class="success" role="status">${escapeHtml(state.notice)}</div>` : ''}
        ${state.error ? `<div class="error" role="alert" tabindex="-1">${escapeHtml(state.error)}</div>` : ''}
        ${navButtons()}
      </section>
    </div>
    ${state.phase === 'report' ? transferPrompt() : ''}
    <p class="footer-note">가상 작품·가상 조사 결과입니다. 실존 화가의 실제 작품이 아니며 처리 지침이 아닙니다. 문자·수치·층 경계는 코드로 합성한 설명입니다.</p>
  </main></div>
  <dialog id="changelog" aria-label="업데이트 내역">
    <h3 style="margin-top:0">업데이트 내역</h3>
    <ul class="small"><li><strong>2026-09-23</strong> — 예측·증거 판단·결정 입력을 학습자가 직접 기록하고 가상 모형과 비교하도록 개선. 모바일 작품 선택과 학습자용 설명을 정리하고, 층 정보 표는 ‘층 정보 확인’ 조사를 마친 뒤에만 표시.</li><li><strong>2026-09-19</strong> — 가상 작품 12점, 생성 이미지 연결, 적외선·자외선 조사 및 예산 조합 안내.</li><li><strong>2026-09-19</strong> — 초기 실험실 흐름·가상 조사·저장 및 인쇄 기능 추가.</li><li><strong>2026-09-15</strong> — 설계 확정.</li></ul>
    <button class="ghost-btn" id="closeLog" type="button">닫기</button>
  </dialog>`;

  wire();
}

function heroView(): string {
  return `<section class="hero" aria-label="시작">
    <h1>어두운 부분, 바랜 걸까 덧칠한 걸까?</h1>
    <p class="lede">표면만 보고 단정하지 마세요. 조사 점수 6점(실제 비용 아님)으로 조사를 골라 근거를 모으는 30분 가상 활동입니다. 화면의 조사 결과는 모두 가상 모형입니다.</p>
    <div class="btn-row" style="max-width:420px"><button class="btn gi-pulse" id="startBtn" type="button">연구 시작하기</button></div>
  </section>`;
}

function phaseTitle(): string {
  return { observing: '작품과 관심 영역', testing: '조사 선택', evidence: '증거와 가설', deciding: '보존 결정', report: '결정 보고서' }[state.phase];
}
function phaseDesc(): string {
  return {
    observing: '관심 영역을 고르고 서로 다른 가설 2개를 직접 선택하세요.',
    testing: '가상 조사는 이미지를 살펴보는 방법이에요. 지지체는 그림을 받치는 천·나무, 바탕층은 물감 밑 준비층, 안료는 색을 내는 재료, 바니시는 표면을 보호하는 투명 코팅입니다. 점수는 완료 뒤에만 차감됩니다.',
    evidence: '관찰마다 내가 고른 가설을 지지·반박·미정 중 하나로 판단하세요. 판단 뒤 가상 모형 결과와 이유를 비교할 수 있습니다.',
    deciding: '결정을 고르고 기대 효과·불확실성·되돌림 생각을 직접 적으세요.',
    report: '조사 점수·관찰·판단·불확실성을 저장하세요. 판단을 미루는 것도 선택입니다.'
  }[state.phase];
}

function visualPanel(): string {
  const arts = listArtworks();
  if (state.phase === 'observing') {
    const selected = getArtwork(state.artworkId);
    return `${selected ? `<div class="selected-work">${artworkThumbSVG(selected, state.regionId)}<b>${escapeHtml(selected.fictionalTitle)}</b><span>${escapeHtml(selected.story)}</span></div>` : ''}
      <details class="other-works"><summary>다른 가상 작품 선택</summary><div class="work-list" role="group" aria-label="가상 작품 선택">${arts.filter((a) => a.id !== state.artworkId).map((a) => `
      <button class="work" type="button" data-art="${a.id}" aria-pressed="${a.id === state.artworkId}">
        ${artworkThumbSVG(a, a.id === state.artworkId ? state.regionId : undefined)}
        <b>${escapeHtml(a.fictionalTitle)}</b><span>${escapeHtml(a.story)}</span>
      </button>`).join('')}</div></details>
      <p class="small muted" style="margin-top:10px">${escapeHtml(getArtwork(state.artworkId)?.rightsNote ?? '')} · 이미지 로드 실패 시 표와 글로 과제를 계속할 수 있습니다.</p>`;
  }
  if (state.phase === 'testing' || state.phase === 'evidence') {
    const region = currentRegion();
    if (state.observations.length === 0) {
      const art = getArtwork(state.artworkId);
      return `${art ? artworkThumbSVG(art, state.regionId) : ''}<p class="muted">아직 관찰이 없습니다. 오른쪽에서 조사를 요청하세요. 실패해도 비용은 나가지 않습니다.</p>`;
    }
    return `<div class="obs-grid">${state.observations.map((o) => `
      <div class="obs"><h3 class="small" style="margin:0 0 6px">${escapeHtml(testLabel(o.testId))} · ${escapeHtml(o.shortLabel)}</h3>
      ${observationSVG(o, region)}<p>${escapeHtml(o.textObservation)}</p>
      <p class="small muted">가상 모형의 결과입니다.</p></div>`).join('')}</div>`;
  }
  if (state.phase === 'deciding') {
    const art = getArtwork(state.artworkId);
    const full = art ? escapeHtml(art.images.full) : '';
    const after = art ? escapeHtml(art.images.after) : '';
    const alt = escapeHtml(art?.fictionalTitle ?? '');
    return `
    <div class="compare" style="margin-top:10px">
      <div class="obs"><img src="${full}" alt="${alt} 처리 전 — 가상 이미지" loading="lazy" style="width:100%;height:auto;border-radius:8px" /><strong>처리 전 (현재)</strong><p class="small muted">가상 관찰 상태 그대로 둡니다.</p></div>
      <div class="obs"><img src="${after}" alt="${alt} 가상 처리 후 미리보기 — 가상 이미지" loading="lazy" style="width:100%;height:auto;border-radius:8px" /><strong>가상 처리 후 (미리보기)</strong><p class="small muted">화면 효과일 뿐 실제 복원 결과가 아닙니다. 되돌리기를 제공합니다.</p></div>
    </div>`;
  }
  const d = state.decision;
  return decisionSummaryHTML(
    d?.action ? { regionId: state.regionId, artworkId: state.artworkId, action: d.action, evidenceKeys: state.observations.map(observationKey), uncertainty: d.uncertainty, reversibilityNote: d.reversibility, expectedEffect: d.effect } : null,
    state.observations, state.links
  );
}

function controlPanel(artTitle: string, regionLabel: string): string {
  if (state.phase === 'observing') {
    const art = getArtwork(state.artworkId);
    return `
    <div class="field"><span class="legend" id="regionLegend">관심 영역 (버튼·숫자·방향키 모두 가능)</span>
      <div class="region-btns" role="group" aria-labelledby="regionLegend">
      ${art?.regions.map((r, i) => `<button class="region-btn" type="button" data-region="${r.id}" aria-pressed="${r.id === state.regionId}"><strong>${i + 1}. ${escapeHtml(r.label)}</strong><small>${escapeHtml(r.hint)}</small></button>`).join('')}
      </div>
      <p class="hint">대체 조작: <label>번호 입력 <input id="regionNum" class="mono" inputmode="numeric" min="1" max="2" value="${art?.regions.findIndex((r) => r.id === state.regionId)! + 1}" style="width:56px" aria-label="영역 번호 1 또는 2" /></label></p>
    </div>
    <div class="field"><span class="legend">어두운 이유 가설 (서로 다른 2개 선택)</span>
      <div class="checks">${(['surface-deposit', 'overpaint', 'original-dark'] as HypothesisId[]).map((h) => `
        <button class="check" type="button" data-hyp="${h}" aria-pressed="${state.hypotheses.includes(h)}">${HYPOTHESIS_LABEL[h]}</button>`).join('')}</div>
      <p class="hint">${hypothesisDescription['surface-deposit']} · ${hypothesisDescription.overpaint} · ${hypothesisDescription['original-dark']}</p>
      <label>짧은 메모 (선택, 200자 이내)<input id="noteInput" class="text" type="text" maxlength="200" value="${escapeHtml(state.note)}" placeholder="예: 경계가 흐릿해서 오염 같다" style="width:100%;border:1px solid var(--line);border-radius:10px;padding:10px" /></label>
    </div>`;
  }
  if (state.phase === 'testing') {
    return `
    <div class="budget"><span>남은 조사 점수 (실제 비용 아님)</span><strong>${remaining(state.budget)} / ${state.budget.start}점</strong></div>
    <p class="small muted" style="margin-top:0">${escapeHtml(artTitle)} · ${escapeHtml(regionLabel)}</p>
    <div class="test-list">${TESTS.map((t) => {
      const key = `${state.artworkId}/${state.regionId}/${t.id}`;
      const done = state.budget.usedKeys.includes(key);
      return `<div class="test"><div class="test-head"><strong>${escapeHtml(t.label)}</strong><span class="cost">${t.cost}점 · ${done ? '완료' : `남은 ${remaining(state.budget)}점`}</span></div>
      <span class="small muted">${escapeHtml(t.range)}</span><span class="small muted">한계: ${escapeHtml(t.limitations)}</span>
      <button class="btn ${done ? 'secondary' : ''}" type="button" data-test="${t.id}" ${done ? 'disabled' : ''}>${done ? '관찰 완료 — 다시 차감 안 함' : `${escapeHtml(t.label)} 요청하기`}</button></div>`;
    }).join('')}</div>
      <h3>남은 조사 점수로 가능한 조합</h3>
    ${strategyTable()}
    <p class="hint">취소·로드 실패는 차감하지 않습니다. 같은 숨은 상태·검사는 같은 관찰을 반환합니다.</p>`;
  }
  if (state.phase === 'evidence') {
    const s = summarizeConsistency(state.links);
    const hasLayerDiagram = state.observations.some((o) => o.testId === 'layerDiagram');
    return `
    <h3 style="margin-top:0">관찰과 가설을 비교해요</h3>
    <p class="small muted">${escapeHtml(s.message)}</p>
    ${evidenceRows(state.links, state.observations) || '<p>관찰이 없습니다. 조사 단계로 돌아가세요.</p>'}
    <h3>그림은 여러 겹으로 이루어져요</h3>
    ${hasLayerDiagram ? `<p class="small muted">아래 도식은 층을 이해하기 위한 가상 모형이며 실제 두께나 재료를 측정한 결과가 아닙니다.</p>${layerTable(currentRegion())}` : '<p class="hint">아직 층 정보를 확인하지 않았어요. 층 정보를 보려면 조사 단계로 돌아가 ‘층 정보 확인’을 요청해 주세요.</p><button class="btn secondary" type="button" data-goto="testing">조사 단계로 돌아가기</button>'}
    <p class="hint">조사만으로 구분하기 어렵다면 판단을 미루는 것도 근거 있는 선택이에요.</p>`;
  }
  if (state.phase === 'deciding') {
    const d = state.decision ?? { action: null, uncertainty: '', reversibility: '', effect: '' };
    const art = getArtwork(state.artworkId);
    return `
    <div class="expert"><strong>전문가 관점 (참고)</strong><p>${escapeHtml(art?.expertNote ?? '')}</p></div>
    <div class="field"><span class="legend">결정 (하나만)</span><div class="checks" role="radiogroup" aria-label="보존 결정">
      ${([['keep', '유지'], ['investigate', '추가 조사'], ['simulatedRemovalPreview', '가상 미리보기']] as [DecisionAction, string][]).map(([v, l]) => `
      <button class="check" role="radio" aria-checked="${d.action === v}" type="button" data-action="${v}">${l}</button>`).join('')}
    </div></div>
    <div class="field"><label>기대 효과<textarea id="fEffect" class="text" maxlength="500" placeholder="이 결정을 하면 어떤 점이 좋아질까요? 예: 표면 정보를 더 살펴볼 수 있어요.">${escapeHtml(d.effect)}</textarea></label><p class="hint">문장 시작: “이렇게 하면 …”</p></div>
    <div class="field"><label>남은 불확실성<textarea id="fUnc" class="text" maxlength="500" placeholder="아직 확실하지 않은 점은 무엇인가요? 예: 덧칠인지 더 확인해야 해요.">${escapeHtml(d.uncertainty)}</textarea></label><p class="hint">문장 시작: “아직 …은/는 알기 어려워요.”</p></div>
    <div class="field"><label>되돌림 생각<textarea id="fRev" class="text" maxlength="500" placeholder="선택을 바꾸거나 멈출 수 있나요? 이유도 적어 보세요.">${escapeHtml(d.reversibility)}</textarea></label><p class="hint">문장 시작: “필요하면 …할 수 있어요.”</p></div>`;
  }
  const records = loadRecords();
  return `
    <h3 style="margin-top:0">저장</h3>
    <div class="btn-row"><button class="btn" id="saveBtn" type="button">기록 저장하기</button>
    <button class="btn secondary" id="dlBtn" type="button">JSON 내보내기</button></div>
    <div class="btn-row"><button class="btn secondary" id="printBtn" type="button">보고서 인쇄하기</button></div>
    <p class="small muted">사용한 조사 점수 ${state.budget.spent}점 · 관찰 ${state.observations.length}개 · 판단 ${state.links.length}개 · 선택한 가설 ${state.hypotheses.map((h) => HYPOTHESIS_LABEL[h]).join(', ')}</p>
    ${records.length ? `<h3>이 기기 기록 (${records.length})</h3><ul class="small">${records.slice(-5).reverse().map((r) => `<li>${escapeHtml(getArtwork(r.parameters.artworkId)?.fictionalTitle ?? '가상 작품')} · ${escapeHtml(getRegion(r.parameters.artworkId, r.parameters.regionId)?.label ?? '관심 영역')} · ${escapeHtml(r.createdAt.slice(0, 16).replace('T', ' '))}</li>`).join('')}</ul>` : '<p class="small muted">저장 불가 환경이면 현재 세션 + JSON 내보내기를 쓰세요.</p>'}
    <div class="btn-row"><button class="btn secondary" id="resetBtn" type="button">처음부터 다시</button></div>`;
}

function strategyTable(): string {
  const usedIds = state.observations.map((o) => o.testId);
  const combos = planCombos(remaining(state.budget), usedIds);
  if (combos.length === 0) return '<p class="hint">남은 예산으로 새 조사를 고를 수 없습니다.</p>';
  const rows = combos
    .map((c) => `<tr><td>${c.tests.map((t) => escapeHtml(testLabel(t))).join(' + ')}</td><td class="mono">${c.cost}점</td></tr>`)
    .join('');
  return `<table class="strategy"><thead><tr><th>조합</th><th>조사 점수</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function navButtons(): string {
  if (state.phase === 'observing') return '';
  const idx = PHASES.findIndex((p) => p.id === state.phase);
  const prev = idx > 0 ? PHASES[idx - 1] : null;
  const next = idx < PHASES.length - 1 ? PHASES[idx + 1] : null;
  const nextId = next ? `goto-${next.id}` : 'done';
  const labels: Record<string, string> = { testing: '조사하러 가기', evidence: '증거 연결하기', deciding: '결정하기', report: '보고서 만들기' };
  const nextLabel = (next ? labels[next.id] : undefined) ?? '마치기';
  const pulse = (state.phase === 'testing' && state.observations.length > 0)
    || (state.phase === 'evidence' && state.links.length > 0 && state.links.every((l) => l.studentVerdict))
    || (state.phase === 'deciding' && !!state.decision?.action && !!state.decision.effect.trim() && !!state.decision.uncertainty.trim() && !!state.decision.reversibility.trim());
  return `<div class="btn-row">
    ${prev ? `<button class="btn secondary" type="button" data-goto="${prev.id}">← ${prev.label}</button>` : '<span></span>'}
    ${next ? `<button class="btn ${pulse ? 'gi-pulse' : ''}" type="button" id="${nextId}" data-goto="${next.id}">${nextLabel} →</button>` : ''}
  </div>`;
}

function testLabel(id: string): string {
  return TESTS.find((t) => t.id === id)?.label ?? id;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wire(): void {
  document.getElementById('startBtn')?.addEventListener('click', () => {
    if (!guard('testing')) return;
    setPhase('testing');
  });
  document.querySelectorAll('[data-goto]').forEach((b) =>
    b.addEventListener('click', () => {
      const target = (b as HTMLElement).dataset.goto as Phase;
      if (!guard(target)) return;
      if (target === 'report') collectDecision();
      setPhase(target);
    })
  );
  document.querySelectorAll('[data-art]').forEach((b) =>
    b.addEventListener('click', () => {
      state.artworkId = (b as HTMLElement).dataset.art!;
      const art = getArtwork(state.artworkId);
      state.regionId = art?.regions[0]?.id ?? state.regionId;
      state.observations = []; state.links = []; state.budget = createBudget(BUDGET_START); state.hypotheses = []; state.note = ''; state.decision = null;
      render();
    })
  );
  document.querySelectorAll('[data-region]').forEach((b) =>
    b.addEventListener('click', () => { state.regionId = (b as HTMLElement).dataset.region!; render(); })
  );
  document.querySelectorAll('[data-hyp]').forEach((b) =>
    b.addEventListener('click', () => hypothesisToggle((b as HTMLElement).dataset.hyp as HypothesisId))
  );
  document.querySelectorAll('[data-test]').forEach((b) =>
    b.addEventListener('click', () => requestTest((b as HTMLElement).dataset.test as TestId))
  );
  document.querySelectorAll('[data-action]').forEach((b) =>
    b.addEventListener('click', () => {
      const v = (b as HTMLElement).dataset.action as DecisionAction;
      state.decision = { ...(state.decision ?? { uncertainty: '', reversibility: '', effect: '' }), action: v };
      render();
      (document.getElementById('fEffect') as HTMLElement | null)?.focus();
    })
  );
  document.querySelectorAll('[data-verdict]').forEach((b) => b.addEventListener('click', () => {
    const [index, value] = (b as HTMLElement).dataset.verdict!.split(':');
    const link = state.links[Number(index)];
    if (link && ['compatible', 'incompatible', 'undetermined'].includes(value)) {
      link.studentVerdict = value as EvidenceLink['verdict'];
      if (state.decision) state.decision.action = null;
      render();
      (document.querySelector(`[data-verdict="${index}:${value}"]`) as HTMLElement | null)?.focus();
    }
  }));
  document.getElementById('regionNum')?.addEventListener('change', (e) => {
    const art = getArtwork(state.artworkId);
    const n = Number((e.target as HTMLInputElement).value);
    if (art && (n === 1 || n === 2) && art.regions[n - 1]) { state.regionId = art.regions[n - 1].id; render(); }
  });
  document.addEventListener('keydown', (e) => {
    if (state.phase !== 'observing') return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const art = getArtwork(state.artworkId);
    if (!art) return;
    const i = art.regions.findIndex((r) => r.id === state.regionId);
    const j = e.key === 'ArrowRight' ? Math.min(art.regions.length - 1, i + 1) : Math.max(0, i - 1);
    if (art.regions[j]) { state.regionId = art.regions[j].id; render(); }
  });
  document.getElementById('noteInput')?.addEventListener('input', (e) => {
    state.note = (e.target as HTMLInputElement).value.slice(0, 200);
  });
  [['fEffect', 'effect'], ['fUnc', 'uncertainty'], ['fRev', 'reversibility']].forEach(([id, key]) => document.getElementById(id)?.addEventListener('input', (e) => {
    if (!state.decision) state.decision = { action: null, effect: '', uncertainty: '', reversibility: '' };
    state.decision[key as 'effect' | 'uncertainty' | 'reversibility'] = (e.target as HTMLTextAreaElement).value.slice(0, 500);
    const d = state.decision;
    document.getElementById('goto-report')?.classList.toggle('gi-pulse', !!d.action && !!d.effect.trim() && !!d.uncertainty.trim() && !!d.reversibility.trim());
  }));
  const dlg = document.getElementById('changelog') as HTMLDialogElement | null;
  const opener = document.getElementById('changelogBtn') as HTMLElement | null;
  opener?.addEventListener('click', () => dlg?.showModal());
  document.getElementById('closeLog')?.addEventListener('click', () => { dlg?.close(); opener?.focus(); });
  document.getElementById('saveBtn')?.addEventListener('click', () => {
    if (!collectDecision()) return;
    const rec = buildRecord();
    const res = saveRecord(rec);
    state.error = '';
    state.notice = res.ok ? '저장됐습니다. 이 기기에서 최근 20개까지 보관됩니다.' : (res.reason ?? '저장 실패');
    render();
  });
  document.getElementById('dlBtn')?.addEventListener('click', () => { if (collectDecision()) downloadJSON(buildRecord()); });
  document.getElementById('printBtn')?.addEventListener('click', () => window.print());
  document.getElementById('resetBtn')?.addEventListener('click', () => {
    state.budget = createBudget(BUDGET_START); state.observations = []; state.links = []; state.hypotheses = []; state.note = ''; state.decision = null; setPhase('observing');
    requestAnimationFrame(() => focusWithVisibleRing('startBtn'));
  });
  document.getElementById('transferBtn')?.addEventListener('click', () => {
    const next = listArtworks().find((a) => a.id !== state.artworkId);
    if (!next) return;
    state.artworkId = next.id; state.regionId = next.regions[0].id; state.budget = createBudget(BUDGET_START);
    state.observations = []; state.links = []; state.hypotheses = []; state.decision = null; state.note = ''; state.phase = 'observing'; render();
    requestAnimationFrame(() => focusWithVisibleRing('startBtn'));
  });
}

function guard(target: Phase): boolean {
  if (state.phase === 'observing' && (target === 'testing' || target === 'evidence' || target === 'deciding' || target === 'report')) {
    const v = validatePrediction(state.hypotheses);
    if (!v.ok) { state.error = v.reason ?? '예측 확인'; render(); focusError(); return false; }
  }
  if (target === 'evidence' || target === 'deciding' || target === 'report') {
    if (state.observations.length === 0) { state.error = '조사를 1개 이상 완료하세요. 예산 안에서 확대(1점)부터 시작할 수 있습니다.'; state.phase = 'testing'; render(); focusError(); return false; }
  }
  if ((target === 'deciding' || target === 'report') && state.links.some((link) => !link.studentVerdict)) {
    state.error = '관찰마다 선택한 가설의 판단을 모두 골라 주세요.'; state.phase = 'evidence'; render(); focusError(); return false;
  }
  if (target === 'report' && !collectDecision()) return false;
  return true;
}

function collectDecision(): boolean {
  if (state.phase === 'report') {
    if (!!state.decision?.action && !!state.decision.effect.trim() && !!state.decision.uncertainty.trim() && !!state.decision.reversibility.trim()) return true;
    state.error = '보고서를 저장할 수 없습니다. 결정 입력을 다시 확인해 주세요.'; state.phase = 'deciding'; render(); focusError(); return false;
  }
  if (state.phase !== 'deciding') { state.error = '결정 입력 화면으로 돌아가 내용을 확인해 주세요.'; state.phase = 'deciding'; render(); focusError(); return false; }
  const eff = (document.getElementById('fEffect') as HTMLTextAreaElement | null)?.value;
  const unc = (document.getElementById('fUnc') as HTMLTextAreaElement | null)?.value;
  const rev = (document.getElementById('fRev') as HTMLTextAreaElement | null)?.value;
  if (eff !== undefined || unc !== undefined || rev !== undefined) state.decision = { ...(state.decision ?? { action: null, uncertainty: '', reversibility: '', effect: '' }), effect: eff ?? state.decision?.effect ?? '', uncertainty: unc ?? state.decision?.uncertainty ?? '', reversibility: rev ?? state.decision?.reversibility ?? '' };
  const d = state.decision;
  if (!d?.action) return invalidDecision('결정을 하나 선택해 주세요.', '');
  if (!d.effect.trim()) return invalidDecision('기대 효과를 적어 주세요.', 'fEffect');
  if (!d.uncertainty.trim()) return invalidDecision('남은 불확실성을 적어 주세요.', 'fUnc');
  if (!d.reversibility.trim()) return invalidDecision('되돌림 생각을 적어 주세요.', 'fRev');
  return true;
}

function invalidDecision(message: string, field: string): false {
  state.error = message; render(); focusError();
  requestAnimationFrame(() => (document.getElementById(field) as HTMLElement | null)?.focus());
  return false;
}

function buildRecord(): RunRecord {
  return {
    schemaVersion: 1,
    appId: 'painting-conservation-lab',
    createdAt: new Date().toISOString(),
    scenarioId: `${state.artworkId}/${state.regionId}`,
    parameters: { artworkId: state.artworkId, regionId: state.regionId, tests: state.observations.map((o) => o.testId), budgetStart: state.budget.start },
    seed: state.seed,
    engineVersion: ENGINE_VERSION,
    scenarioVersion: SCENARIO_VERSION,
    observations: state.observations,
    prediction: { hypotheses: state.hypotheses, note: state.note },
    explanation: {
      links: state.links,
      decision: state.decision?.action ? { regionId: state.regionId, artworkId: state.artworkId, action: state.decision.action, evidenceKeys: state.observations.map(observationKey), uncertainty: state.decision.uncertainty, reversibilityNote: state.decision.reversibility, expectedEffect: state.decision.effect } : null
    }
  };
}

render();
