import type { Artwork, Observation, RegionState } from '../models/types.js';
import { getArtwork } from '../engine/caseModel.js';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function artworkThumbSVG(art: Artwork, selectedRegionId?: string): string {
  const regions = art.regions
    .map((r, i) => {
      const x = 18 + i * 52;
      const selected = r.id === selectedRegionId;
      return `<g>
        <rect x="${x}" y="86" width="44" height="34" rx="4" fill="rgba(15,23,42,0.28)" stroke="${selected ? '#A16207' : '#ffffff'}" stroke-width="${selected ? 3 : 1.5}" stroke-dasharray="${selected ? '5 3' : 'none'}" />
        <text x="${x + 22}" y="106" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${i === 0 ? 'A' : 'B'}</text>
      </g>`;
    })
    .join('');
  return `<svg viewBox="0 0 220 140" role="img" aria-label="${esc(art.fictionalTitle)} 전체 — 가상 생성 이미지">
    <image href="${esc(art.images.full)}" x="4" y="4" width="212" height="132" preserveAspectRatio="xMidYMid slice" />
    <rect x="4" y="4" width="212" height="132" rx="10" fill="none" stroke="rgba(255,255,255,0.25)" />
    ${regions}
    <text x="12" y="22" font-size="10" fill="#fff" opacity="0.9">가상 이미지</text>
  </svg>`;
}

export function observationSVG(obs: Observation, region: RegionState | undefined): string {
  const label = esc(obs.shortLabel);
  const art = getArtwork(obs.artworkId);
  if (obs.svgKind === 'layers') {
    return `<svg viewBox="0 0 260 150" role="img" aria-label="층 단면 도식: ${label}">
      ${art ? `<image href="${esc(art.images.layerbg)}" x="6" y="6" width="248" height="138" preserveAspectRatio="xMidYMid slice" opacity="0.35" />` : ''}
      <rect x="6" y="6" width="248" height="138" rx="10" fill="rgba(255,255,255,0.88)" />
      <text x="16" y="24" font-size="11" font-weight="700" fill="#0F172A">층 단면 (모식도 · 과장)</text>
      ${layerRow(34, '지지체', '#94a3b8')}
      ${layerRow(54, '바탕', '#e2e8f0')}
      ${layerRow(74, paintLabel(obs.ruleId), '#1E3A5F')}
      ${extraLayer(obs.ruleId)}
      <text x="16" y="134" font-size="10" fill="#475569">${label}</text>
    </svg>`;
  }
  if (obs.svgKind === 'rake' && art) {
    return `<svg viewBox="0 0 260 150" role="img" aria-label="측면광 이미지: ${label}">
      <image href="${esc(art.images.rake)}" x="6" y="6" width="248" height="138" preserveAspectRatio="xMidYMid slice" />
      <rect x="6" y="112" width="248" height="32" fill="rgba(15,23,42,0.72)" />
      <text x="16" y="132" font-size="10" fill="#e2e8f0">측면광 · 가상 이미지 — ${label}</text>
    </svg>`;
  }
  if (obs.svgKind === 'rake') {
    const hasStep = obs.ruleId.startsWith('overpaint');
    return `<svg viewBox="0 0 260 150" role="img" aria-label="측면광 도식: ${label}">
      <rect x="6" y="6" width="248" height="138" rx="10" fill="#0f172a" />
      <text x="16" y="26" font-size="11" fill="#e2e8f0">측면광 — 왼쪽에서 빛</text>
      <rect x="30" y="60" width="200" height="38" rx="4" fill="#334155" />
      ${hasStep ? '<rect x="128" y="52" width="102" height="46" rx="4" fill="#475569" /><line x1="128" y1="52" x2="128" y2="98" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4 3" />' : '<ellipse cx="130" cy="79" rx="80" ry="10" fill="#64748b" opacity="0.7" />'}
      <text x="16" y="132" font-size="10" fill="#cbd5e1">${label}${hasStep ? ' · 경계 단차(노랑 점선)' : ' · 단차 없음'}</text>
    </svg>`;
  }
  if (obs.svgKind === 'zoom' && art) {
    return `<svg viewBox="0 0 260 150" role="img" aria-label="확대 이미지: ${label}">
      <image href="${esc(art.images.zoom)}" x="6" y="6" width="248" height="138" preserveAspectRatio="xMidYMid slice" />
      <rect x="6" y="6" width="248" height="26" fill="rgba(15,23,42,0.72)" />
      <text x="16" y="24" font-size="11" font-weight="700" fill="#fff">확대 — ${esc(region?.label ?? '')} · 가상 이미지</text>
    </svg>`;
  }
  if (obs.svgKind === 'ir') {
    const covered = obs.ruleId.startsWith('overpaint');
    return `<svg viewBox="0 0 260 150" role="img" aria-label="적외선 도식: ${label}">
      <rect x="6" y="6" width="248" height="138" rx="10" fill="#101c33" />
      <text x="16" y="26" font-size="11" fill="#bfdbfe">적외선 — 표면 투과 (가상 모식)</text>
      <path d="M30 100 Q80 60 130 95 T230 85" stroke="#93c5fd" stroke-width="2.5" fill="none" stroke-dasharray="6 3" />
      ${covered ? '<path d="M40 110 Q110 90 170 105" stroke="#f87171" stroke-width="3" fill="none" /><text x="16" y="132" font-size="10" fill="#fecaca">' + label + ' · 밑그림과 표면 어긋남(빨강)</text>' : '<text x="16" y="132" font-size="10" fill="#bfdbfe">' + label + ' · 밑그림 일치(파랑 점선)</text>'}
    </svg>`;
  }
  if (obs.svgKind === 'uv') {
    const spots = obs.ruleId.startsWith('overpaint') || obs.ruleId.startsWith('grime');
    const patches = spots
      ? '<ellipse cx="90" cy="85" rx="26" ry="14" fill="#7c3aed" opacity="0.85" /><ellipse cx="170" cy="95" rx="20" ry="11" fill="#7c3aed" opacity="0.7" />'
      : '<rect x="30" y="66" width="200" height="38" rx="6" fill="#4c1d95" opacity="0.55" />';
    return `<svg viewBox="0 0 260 150" role="img" aria-label="자외선 도식: ${label}">
      <rect x="6" y="6" width="248" height="138" rx="10" fill="#1e1033" />
      <text x="16" y="26" font-size="11" fill="#ddd6fe">자외선 — 형광 (가상 모식)</text>
      ${patches}
      <text x="16" y="132" font-size="10" fill="#ddd6fe">${label}</text>
    </svg>`;
  }
  const dusty = obs.ruleId.startsWith('grime');
  const dots = dusty
    ? Array.from({ length: 26 }, (_, i) => {
        const x = 24 + ((i * 37) % 210);
        const y = 52 + ((i * 23) % 60);
        return `<circle cx="${x}" cy="${y}" r="2.4" fill="#a8a29e" opacity="0.9" />`;
      }).join('')
    : '';
  return `<svg viewBox="0 0 260 150" role="img" aria-label="확대 도식: ${label}">
    <rect x="6" y="6" width="248" height="138" rx="10" fill="#f8fafc" stroke="#CBD5E1" />
    <circle cx="60" cy="40" r="18" fill="none" stroke="#1E3A5F" stroke-width="2" />
    <line x1="73" y1="53" x2="100" y2="80" stroke="#1E3A5F" stroke-width="2" />
    <rect x="96" y="76" width="140" height="52" rx="8" fill="#0f172a" />
    <path d="M100 100 Q130 88 160 100 T232 98" stroke="#e2e8f0" stroke-width="3" fill="none" />
    ${dots}
    <text x="16" y="30" font-size="11" font-weight="700" fill="#0F172A">확대 ×20 — ${esc(region?.label ?? '')}</text>
  </svg>`;
}

function layerRow(y: number, name: string, fill: string): string {
  return `<rect x="16" y="${y}" width="228" height="16" rx="3" fill="${fill}" /><text x="24" y="${y + 12}" font-size="10" fill="${fill === '#1E3A5F' ? '#fff' : '#0F172A'}">${esc(name)}</text>`;
}

function paintLabel(ruleId: string): string {
  if (ruleId.startsWith('original')) return '물감층 — 어두운 안료 자체';
  return '물감층 — 원래 붓결';
}

function extraLayer(ruleId: string): string {
  if (ruleId.startsWith('grime')) {
    return `<rect x="16" y="94" width="228" height="12" rx="3" fill="#a8a29e" stroke-dasharray="4 3" stroke="#78716c" /><text x="24" y="103" font-size="9" fill="#1c1917">표면침적층 (얇음) ●</text>`;
  }
  if (ruleId.startsWith('overpaint')) {
    return `<rect x="16" y="94" width="228" height="12" rx="3" fill="#A16207" /><text x="24" y="103" font-size="9" fill="#fff">덧칠층 ▲ — 아래 붓결 보존</text>`;
  }
  return `<text x="16" y="104" font-size="10" fill="#475569">덧칠·침적 없음 ■</text>`;
}
