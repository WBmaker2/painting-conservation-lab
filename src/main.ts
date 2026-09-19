import './style.css';
import type { DecisionAction, EvidenceLink, HypothesisId, Observation, Phase, RunRecord, TestId } from '../models/types.js';
import { getArtwork, getRegion, listArtworks, validatePrediction } from '../engine/caseModel.js';
import { TESTS, observe, observationKey } from '../engine/observationRules.js';
import { BUDGET_START, canAfford, charge, createBudget, remaining, type BudgetState } from '../engine/budget.js';
import { HYPOTHESIS_META, linkEvidence, summarizeConsistency } from '../engine/evidenceValidator.js';
import { artworkThumbSVG, observationSVG } from '../views/ArtworkCompare.js';
import { decisionSummaryHTML } from '../views/DecisionReport.js';
import { downloadJSON, loadRecords, saveRecord } from './storage.js';

const ENGINE_VERSION = '0.1.0';
const SCENARIO_VERSION = 'p0-3works';

interface State {
  phase: Phase;
  artworkId: string;
  regionId: string;
  hypotheses: HypothesisId[];
  note: string;
  budget: BudgetState;
  observations: Observation[];
  links: EvidenceLink[];
  decision: { action: DecisionAction; uncertainty: string; reversibility: string; effect: string } | null;
  error: string;
  notice: string;
  seed: number;
}

const state: State = {
  phase: 'observing',
  artworkId: 'still-night-apple',
  regionId: 'apple-shadow',
  hypotheses: ['surface-deposit', 'overpaint'],
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
  const out: EvidenceLink[] = [];
  for (const o of state.observations) {
    for (const h of (['surface-deposit', 'overpaint', 'original-dark'] as HypothesisId[])) {
      out.push(linkEvidence(o, h));
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
  state.hypotheses = state.hypotheses.includes(id)
    ? state.hypotheses.filter((h) => h !== id)
    : [...state.hypotheses, id];
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
      <span class="small muted mono" aria-label="남은 예산">예산 ${rem}/${state.budget.start}</span>
      <button class="ghost-btn" id="changelogBtn" type="button">업데이트 내역</button>
    </div>
  </div></header>
  <div class="wrap"><main id="main">
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
    ${state.phase === 'report' ? reportExtra() : ''}
    <p class="footer-note">가상 작품·가상 조사 결과입니다. 실존 화가의 실제 작품이 아니며 처리 지침이 아닙니다. 문자·수치·층 경계는 코드로 합성한 설명입니다.</p>
  </main></div>
  <dialog id="changelog" aria-label="업데이트 내역">
    <h3 style="margin-top:0">업데이트 내역</h3>
    <ul class="small"><li><strong>2026-09-19 (공개 배포)</strong> — 공개 URL에서 자산 200 확인.</li><li><strong>2026-09-19 (승인 후 실측)</strong> — 하위 경로·4폭 렌더·전 여정 클릭 확인, 테스트 25개.</li><li><strong>2026-09-19 (배포 전 개선)</strong> — 서브패스 경로·파비콘, 입력 검증·저장 복구·인쇄.</li><li><strong>2026-09-19 (P0 스캐폴드)</strong> — 작품 3점·영역 2개씩·조사 3종·예산 6점·증거연결·보고서.</li><li><strong>2026-09-15</strong> — 설계 확정 (공통원칙·09 문서).</li></ul>
    <button class="ghost-btn" id="closeLog" type="button">닫기</button>
  </dialog>`;

  wire();
}

function heroView(): string {
  return `<section class="hero" aria-label="시작">
    <h1>어두운 부분, 바랜 걸까 덧칠한 걸까?</h1>
    <p class="lede">표면만 보고 단정하지 마세요. 예산 6점으로 서로 다른 조사를 골라 근거를 모으는 30분 가상 실험입니다.</p>
    <div class="btn-row" style="max-width:420px"><button class="btn gi-pulse" id="startBtn" type="button">연구 시작하기</button></div>
  </section>`;
}

function phaseTitle(): string {
  return { observing: '작품과 관심 영역', testing: '조사 선택', evidence: '증거와 가설', deciding: '보존 결정', report: '결정 보고서' }[state.phase];
}
function phaseDesc(): string {
  return {
    observing: '영역을 고르고 어두운 이유 2개 이상을 예측으로 기록하세요.',
    testing: '예산 안에서 조사를 요청하세요. 완료 후에만 차감됩니다.',
    evidence: '관찰을 가설과 연결하세요. ●지지 ✕반박 ■미정 — 색만이 아니라 기호+문구로 표시.',
    deciding: '유지 · 추가 조사 · 가상 처리 미리보기 중 하나를 고르세요.',
    report: '예산·증거·불확실성을 저장하세요. 보류도 정답 범주입니다.'
  }[state.phase];
}

function visualPanel(): string {
  const arts = listArtworks();
  if (state.phase === 'observing') {
    return `<div class="work-list" role="group" aria-label="가상 작품 선택">${arts.map((a) => `
      <button class="work" type="button" data-art="${a.id}" aria-pressed="${a.id === state.artworkId}">
        ${artworkThumbSVG(a, a.id === state.artworkId ? state.regionId : undefined)}
        <b>${escapeHtml(a.fictionalTitle)}</b><span>${escapeHtml(a.story)}</span>
      </button>`).join('')}</div>
      <p class="small muted" style="margin-top:10px">${escapeHtml(getArtwork(state.artworkId)?.rightsNote ?? '')} · 이미지가 없어도 아래 표와 글로 과제를 수행할 수 있습니다.</p>`;
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
      <p class="small muted mono">${escapeHtml(o.ruleId)} · ${escapeHtml(observationKey(o))}</p></div>`).join('')}</div>`;
  }
  if (state.phase === 'deciding') {
    const before = getArtwork(state.artworkId);
    return `${before ? artworkThumbSVG(before, state.regionId) : ''}
    <div class="compare" style="margin-top:10px">
      <div class="obs"><strong>처리 전 (현재)</strong><p class="small muted">가상 관찰 상태 그대로 둡니다.</p></div>
      <div class="obs"><strong>가상 처리 후 (미리보기)</strong><p class="small muted">화면 효과일 뿐 실제 복원 결과가 아닙니다. 되돌리기를 제공합니다.</p></div>
    </div>`;
  }
  const d = state.decision;
  return decisionSummaryHTML(
    d ? { regionId: state.regionId, artworkId: state.artworkId, action: d.action, evidenceKeys: state.observations.map(observationKey), uncertainty: d.uncertainty, reversibilityNote: d.reversibility, expectedEffect: d.effect } : null,
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
    <div class="field"><span class="legend">어두운 이유 예측 (2개 이상)</span>
      <div class="checks">${(['surface-deposit', 'overpaint', 'original-dark'] as HypothesisId[]).map((h) => `
        <button class="check" type="button" data-hyp="${h}" aria-pressed="${state.hypotheses.includes(h)}">${HYPOTHESIS_META[h].symbol} ${HYPOTHESIS_META[h].label}</button>`).join('')}</div>
      <p class="hint">${HYPOTHESIS_META['surface-deposit'].desc} · ${HYPOTHESIS_META['overpaint'].desc} · ${HYPOTHESIS_META['original-dark'].desc}</p>
      <label>짧은 메모 (선택, 200자 이내)<input id="noteInput" class="text" type="text" maxlength="200" value="${escapeHtml(state.note)}" placeholder="예: 경계가 흐릿해서 오염 같다" style="width:100%;border:1px solid var(--line);border-radius:10px;padding:10px" /></label>
    </div>`;
  }
  if (state.phase === 'testing') {
    return `
    <div class="budget"><span>남은 예산 (게임 단위)</span><strong>${remaining(state.budget)} / ${state.budget.start}점</strong></div>
    <p class="small muted" style="margin-top:0">${escapeHtml(artTitle)} · ${escapeHtml(regionLabel)}</p>
    <div class="test-list">${TESTS.map((t) => {
      const key = `${state.artworkId}/${state.regionId}/${t.id}`;
      const done = state.budget.usedKeys.includes(key);
      return `<div class="test"><div class="test-head"><strong>${escapeHtml(t.label)}</strong><span class="cost">${t.cost}점 · ${done ? '완료' : `남은 ${remaining(state.budget)}점`}</span></div>
      <span class="small muted">${escapeHtml(t.range)}</span><span class="small muted">한계: ${escapeHtml(t.limitations)}</span>
      <button class="btn ${done ? 'secondary' : ''}" type="button" data-test="${t.id}" ${done ? 'disabled' : ''}>${done ? '관찰 완료 — 다시 차감 안 함' : `${escapeHtml(t.label)} 요청하기`}</button></div>`;
    }).join('')}</div>
    <p class="hint">취소·로드 실패는 차감하지 않습니다. 같은 숨은 상태·검사는 같은 관찰을 반환합니다.</p>`;
  }
  if (state.phase === 'evidence') {
    const s = summarizeConsistency(state.links.filter((l) => state.hypotheses.includes(l.hypothesisId) || true));
    return `
    <h3 style="margin-top:0">호환표 — 관찰 × 가설</h3>
    <p class="small muted">${escapeHtml(s.message)}</p>
    <table class="compat"><thead><tr><th>조사</th><th>가설</th><th>판정</th><th>이유</th></tr></thead><tbody>
    ${state.links.map((l) => {
      const m = HYPOTHESIS_META[l.hypothesisId];
      const badge = l.verdict === 'compatible' ? '<span class="badge ok">● 지지</span>' : l.verdict === 'incompatible' ? '<span class="badge no">✕ 반박</span>' : '<span class="badge mid">■ 미정</span>';
      return `<tr><td class="mono">${escapeHtml(l.observationKey.split('/').pop() ?? '')}</td><td>${m.symbol} ${m.label}</td><td>${badge}</td><td>${escapeHtml(l.memo)}</td></tr>`;
    }).join('') || '<tr><td colspan="4">관찰이 없습니다. 조사 단계로 돌아가세요.</td></tr>'}
    </tbody></table>
    <h3>층 구조 표 (대체 수단)</h3>
    ${layerTable()}
    <p class="hint">구분 불가 사건은 보류 결정을 정답으로 인정합니다. 확률을 말하려면 별도 모형이 필요합니다.</p>`;
  }
  if (state.phase === 'deciding') {
    const d = state.decision ?? { action: 'keep' as DecisionAction, uncertainty: '', reversibility: '', effect: '' };
    return `
    <div class="field"><span class="legend">결정 (하나만)</span><div class="checks" role="radiogroup" aria-label="보존 결정">
      ${([['keep', '유지'], ['investigate', '추가 조사'], ['simulatedRemovalPreview', '가상 미리보기']] as [DecisionAction, string][]).map(([v, l]) => `
      <button class="check" role="radio" aria-checked="${d.action === v}" aria-pressed="${d.action === v}" type="button" data-action="${v}">${l}</button>`).join('')}
    </div></div>
    <div class="field"><label>기대 효과 (500자 이내)<textarea id="fEffect" class="text" maxlength="500">${escapeHtml(d.effect)}</textarea></label></div>
    <div class="field"><label>남은 불확실성 (500자 이내)<textarea id="fUnc" class="text" maxlength="500">${escapeHtml(d.uncertainty)}</textarea></label></div>
    <div class="field"><label>되돌릴 수 있는지 (500자 이내)<textarea id="fRev" class="text" maxlength="500">${escapeHtml(d.reversibility)}</textarea></label></div>
    <p class="hint">보기 좋아진 결과와 근거 있는 결정을 구분하세요. ‘AI가 원래 색을 알아낸다’는 오개념을 적지 마세요.</p>`;
  }
  const records = loadRecords();
  return `
    <h3 style="margin-top:0">저장</h3>
    <div class="btn-row"><button class="btn" id="saveBtn" type="button">기록 저장하기</button>
    <button class="btn secondary" id="dlBtn" type="button">JSON 내보내기</button></div>
    <div class="btn-row"><button class="btn secondary" id="printBtn" type="button">보고서 인쇄하기</button></div>
    <p class="small muted">예산 사용 ${state.budget.spent}점 · 관찰 ${state.observations.length}개 · 증거 ${state.links.length}개 · 예측 ${(state.hypotheses).join(', ')}</p>
    ${records.length ? `<h3>이 기기 기록 (${records.length})</h3><ul class="small">${records.slice(-5).reverse().map((r) => `<li class="mono">${escapeHtml(r.scenarioId)} · ${escapeHtml(r.createdAt.slice(0, 16).replace('T', ' '))}</li>`).join('')}</ul>` : '<p class="small muted">저장 불가 환경이면 현재 세션 + JSON 내보내기를 쓰세요.</p>'}
    <div class="btn-row"><button class="btn secondary" id="resetBtn" type="button">처음부터 다시</button></div>`;
}

function layerTable(): string {
  const r = currentRegion();
  if (!r) return '<p>영역 없음</p>';
  return `<table class="compat"><thead><tr><th>층</th><th>상태 (도식)</th></tr></thead><tbody>
    <tr><td>지지체</td><td>${escapeHtml(r.hidden.support)}</td></tr>
    <tr><td>바탕</td><td>${escapeHtml(r.hidden.ground)}</td></tr>
    <tr><td>물감</td><td>${escapeHtml(r.hidden.paintLayers.join(' + '))}</td></tr>
    <tr><td>표면</td><td>${escapeHtml(r.hidden.surfaceDeposit)}</td></tr>
    <tr><td>바니시</td><td>${escapeHtml(r.hidden.varnishState)}</td></tr>
  </tbody></table>`;
}

function navButtons(): string {
  if (state.phase === 'observing') return '';
  const idx = PHASES.findIndex((p) => p.id === state.phase);
  const prev = idx > 0 ? PHASES[idx - 1] : null;
  const next = idx < PHASES.length - 1 ? PHASES[idx + 1] : null;
  const nextId = next ? `goto-${next.id}` : 'done';
  const labels: Record<string, string> = { testing: '조사하러 가기', evidence: '증거 연결하기', deciding: '결정하기', report: '보고서 만들기' };
  const nextLabel = (next ? labels[next.id] : undefined) ?? '마치기';
  const pulse = state.phase === 'testing' && state.observations.length > 0;
  return `<div class="btn-row">
    ${prev ? `<button class="btn secondary" type="button" data-goto="${prev.id}">← ${prev.label}</button>` : '<span></span>'}
    ${next ? `<button class="btn ${pulse ? 'gi-pulse' : ''}" type="button" id="${nextId}" data-goto="${next.id}">${nextLabel} →</button>` : ''}
  </div>`;
}

function testLabel(id: string): string {
  return TESTS.find((t) => t.id === id)?.label ?? id;
}

function reportExtra(): string {
  return `<section class="card" style="margin-top:16px" aria-label="검증 메모">
    <h3 style="margin-top:0">완료 판정 자가점검</h3>
    <ul class="small">
      <li>같은 조건 같은 관찰 · 비용 1회만 차감 — ${state.budget.usedKeys.length === new Set(state.budget.usedKeys).size ? '통과' : '중복 있음'}</li>
      <li>1+2+3=6 허용, 초과 차단 — 남은 ${remaining(state.budget)}점</li>
      <li>구분 불가 시 보류 인정 — 결정: ${state.decision?.action ?? '미정'}</li>
    </ul></section>`;
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
      state.observations = []; state.links = []; state.budget = createBudget(BUDGET_START);
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
  const dlg = document.getElementById('changelog') as HTMLDialogElement | null;
  const opener = document.getElementById('changelogBtn') as HTMLElement | null;
  opener?.addEventListener('click', () => dlg?.showModal());
  document.getElementById('closeLog')?.addEventListener('click', () => { dlg?.close(); opener?.focus(); });
  document.getElementById('saveBtn')?.addEventListener('click', () => {
    collectDecision();
    const rec = buildRecord();
    const res = saveRecord(rec);
    state.error = '';
    state.notice = res.ok ? '저장됐습니다. 이 기기에서 최근 20개까지 보관됩니다.' : (res.reason ?? '저장 실패');
    render();
  });
  document.getElementById('dlBtn')?.addEventListener('click', () => { collectDecision(); downloadJSON(buildRecord()); });
  document.getElementById('printBtn')?.addEventListener('click', () => window.print());
  document.getElementById('resetBtn')?.addEventListener('click', () => {
    state.budget = createBudget(BUDGET_START); state.observations = []; state.links = []; state.decision = null; setPhase('observing');
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
  if (target === 'report' && !state.decision) {
    collectDecision();
    if (!state.decision) { state.error = '결정을 먼저 고르세요. 보류(추가 조사)도 결정입니다.'; state.phase = 'deciding'; render(); focusError(); return false; }
  }
  return true;
}

function collectDecision(): void {
  const eff = (document.getElementById('fEffect') as HTMLTextAreaElement | null)?.value;
  const unc = (document.getElementById('fUnc') as HTMLTextAreaElement | null)?.value;
  const rev = (document.getElementById('fRev') as HTMLTextAreaElement | null)?.value;
  if (eff !== undefined || unc !== undefined || rev !== undefined || state.phase === 'deciding') {
    const prev = state.decision ?? { action: 'keep' as DecisionAction, uncertainty: '', reversibility: '', effect: '' };
    state.decision = {
      action: prev.action,
      effect: (eff ?? prev.effect).slice(0, 500),
      uncertainty: (unc ?? prev.uncertainty).slice(0, 500),
      reversibility: (rev ?? prev.reversibility).slice(0, 500)
    };
    if (!state.decision.uncertainty) state.decision.uncertainty = '남은 불확실성을 한 줄로 적어주세요 (예: 층 정보 없이 덧칠 확정 불가).';
    if (!state.decision.reversibility) state.decision.reversibility = state.decision.action === 'keep' ? '손대지 않으므로 되돌림 문제 없음.' : '가상 미리보기는 되돌리기 가능. 실제 처리가 아님.';
    if (!state.decision.effect) state.decision.effect = '근거 있는 보존 판단 연습.';
  }
  if (state.phase === 'deciding' && !state.decision) {
    state.decision = { action: 'investigate', uncertainty: '추가 층 정보 필요', reversibility: '조사만 하므로 되돌림 불필요', effect: '가설 구별' };
  }
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
      decision: state.decision ? { regionId: state.regionId, artworkId: state.artworkId, action: state.decision.action, evidenceKeys: state.observations.map(observationKey), uncertainty: state.decision.uncertainty, reversibilityNote: state.decision.reversibility, expectedEffect: state.decision.effect } : null
    }
  };
}

render();
