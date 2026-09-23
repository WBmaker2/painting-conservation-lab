import type { RegionState } from '../models/types.js';

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function layerTable(region?: RegionState): string {
  if (!region) return '<p>관심 영역이 없습니다.</p>';
  const deposit = { none: '쌓인 것이 없음', 'thin-dust': '얇은 먼지', 'thick-grime': '두꺼운 때' }[region.hidden.surfaceDeposit];
  const varnish = { even: '고르게 발림', yellowed: '누렇게 변함', patchy: '고르지 않음' }[region.hidden.varnishState];
  return `<table class="compat"><thead><tr><th>그림의 부분</th><th>가상 모형의 모습</th></tr></thead><tbody>
    <tr><td>지지체 <span class="small muted">(그림을 받치는 천·나무)</span></td><td>${esc(region.hidden.support)}</td></tr>
    <tr><td>바탕층 <span class="small muted">(물감이 붙도록 미리 준비한 층)</span></td><td>${esc(region.hidden.ground)}</td></tr>
    <tr><td>안료 <span class="small muted">(물감의 색을 내는 재료)</span></td><td>${esc(region.hidden.paintLayers.join(' + '))}</td></tr>
    <tr><td>표면에 쌓인 것</td><td>${deposit}</td></tr>
    <tr><td>바니시 <span class="small muted">(표면을 보호하고 색·광택에 영향을 주는 투명 코팅)</span></td><td>${varnish}</td></tr>
  </tbody></table>`;
}

export function transferPrompt(): string {
  return `<section class="card transfer" style="margin-top:16px"><h3>다른 작품에도 적용해 볼까요?</h3><p>같은 기준으로 다른 가상 작품을 살펴보고, 관찰과 판단이 어떻게 달라지는지 비교해 보세요.</p><button class="btn secondary gi-pulse" id="transferBtn" type="button">다른 작품에 같은 기준 적용하기</button></section>`;
}
