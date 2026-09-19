import type { Compat, EvidenceLink, HypothesisId, Observation } from '../models/types.js';

type Matrix = Record<string, Record<HypothesisId, { verdict: Compat; memo: string }>>;

const MATRIX: Matrix = {
  'grime-thin::visibleZoom': {
    'surface-deposit': { verdict: 'compatible', memo: '가루 입자 + 아래 붓결 유지 = 오염막과 일치' },
    'overpaint': { verdict: 'incompatible', memo: '덧칠 특유의 날카로운 경계·균일한 진함이 없음' },
    'original-dark': { verdict: 'undetermined', memo: '원래 어두운 안료도 흐릿해 보일 수 있어 확대만으로 확정 불가' }
  },
  'grime-thin::rakingLight': {
    'surface-deposit': { verdict: 'compatible', memo: '단차 없는 매끈함 = 얇은 덮임과 일치' },
    'overpaint': { verdict: 'incompatible', memo: '덧칠 턱(단차)이 없음' },
    'original-dark': { verdict: 'undetermined', memo: '원래 안료도 단차가 없어 구별 불가' }
  },
  'grime-thin::layerDiagram': {
    'surface-deposit': { verdict: 'compatible', memo: '물감 위 침적층 확인, 덧칠층 없음' },
    'overpaint': { verdict: 'incompatible', memo: '덧칠층이 존재하지 않음' },
    'original-dark': { verdict: 'incompatible', memo: '어둠의 원인이 물감층이 아닌 표면층임' }
  },
  'overpaint-cover::visibleZoom': {
    'surface-deposit': { verdict: 'incompatible', memo: '고른 가루 막이 아닌 균일한 진함 + 날카로운 경계' },
    'overpaint': { verdict: 'compatible', memo: '균일 진함·결 어긋남·날카로운 경계 = 덧칠과 일치' },
    'original-dark': { verdict: 'undetermined', memo: '원래 진한 안료도 진하게 보일 수 있음' }
  },
  'overpaint-cover::rakingLight': {
    'surface-deposit': { verdict: 'incompatible', memo: '오염막은 단차를 만들지 않음' },
    'overpaint': { verdict: 'compatible', memo: '가장자리 단차 = 덮어칠 때 생긴 턱' },
    'original-dark': { verdict: 'incompatible', memo: '원래 붓결만 있고 덧칠 턱이 생기지 않음' }
  },
  'overpaint-cover::layerDiagram': {
    'surface-deposit': { verdict: 'incompatible', memo: '침적이 아닌 별도 덧칠층이 확인됨' },
    'overpaint': { verdict: 'compatible', memo: '원 물감 위 덧칠층 + 아래 붓결 보존' },
    'original-dark': { verdict: 'incompatible', memo: '어둠이 물감 자체가 아닌 덧칠층에 있음' }
  },
  'original-umber::visibleZoom': {
    'surface-deposit': { verdict: 'undetermined', memo: '가루 막 없이도 어둡게 보일 수 있어 오염 여부 단독 판단 불가' },
    'overpaint': { verdict: 'undetermined', memo: '진함만으로는 덧칠 확정 불가, 경계 정보 필요' },
    'original-dark': { verdict: 'compatible', memo: '투명한 깊이 + 자연스러운 붓결 = 원래 안료와 일치' }
  },
  'original-umber::rakingLight': {
    'surface-deposit': { verdict: 'undetermined', memo: '얇은 오염도 단차가 없어 구별 불가' },
    'overpaint': { verdict: 'incompatible', memo: '덧칠 턱이 없음' },
    'original-dark': { verdict: 'compatible', memo: '붓결 그대로 + 단차 없음' }
  },
  'original-umber::layerDiagram': {
    'surface-deposit': { verdict: 'incompatible', memo: '표면 침적층이 없음' },
    'overpaint': { verdict: 'incompatible', memo: '덧칠층이 없음' },
    'original-dark': { verdict: 'compatible', memo: '물감층 자체가 어두운 안료' }
  },
  'grime-thin::infrared': {
    'surface-deposit': { verdict: 'compatible', memo: '오염막 투과 + 아래 붓결·밑그림 유지' },
    'overpaint': { verdict: 'incompatible', memo: '덧칠 특유의 덮인 윤곽이 없음' },
    'original-dark': { verdict: 'undetermined', memo: '원래 안료의 붓결도 투과되어 보일 수 있음' }
  },
  'grime-thin::ultraviolet': {
    'surface-deposit': { verdict: 'compatible', memo: '표면막 특유의 얼룩 형광' },
    'overpaint': { verdict: 'incompatible', memo: '보수 반점 양상이 없음' },
    'original-dark': { verdict: 'undetermined', memo: '원래 안료 위 오염도 가능해 단독 확정 불가' }
  },
  'overpaint-cover::infrared': {
    'surface-deposit': { verdict: 'incompatible', memo: '오염막 투과가 아닌 별도 층의 윤곽 어긋남' },
    'overpaint': { verdict: 'compatible', memo: '덧칠 아래 원래 밑그림 + 표면 윤곽 어긋남' },
    'original-dark': { verdict: 'incompatible', memo: '원래 음영이면 밑그림과 표면이 어긋나지 않음' }
  },
  'overpaint-cover::ultraviolet': {
    'surface-deposit': { verdict: 'incompatible', memo: '오염 얼룩이 아닌 보수 반점 양상' },
    'overpaint': { verdict: 'compatible', memo: '덧칠 부위의 형광 억제 반점' },
    'original-dark': { verdict: 'incompatible', memo: '원래 바니시면 고른 형광이어야 함' }
  },
  'original-umber::infrared': {
    'surface-deposit': { verdict: 'undetermined', memo: '얇은 오염도 적외선을 투과해 구별 불가' },
    'overpaint': { verdict: 'incompatible', memo: '덧칠 경계·덮인 윤곽이 없음' },
    'original-dark': { verdict: 'compatible', memo: '안료 자체 흡수 + 밑그림 왜곡 없음' }
  },
  'original-umber::ultraviolet': {
    'surface-deposit': { verdict: 'undetermined', memo: '얇은 오염도 고르게 보일 수 있어 단독 판단 불가' },
    'overpaint': { verdict: 'incompatible', memo: '보수 반점이 없음' },
    'original-dark': { verdict: 'compatible', memo: '고른 바니시 형광, 덧칠·오염 징후 없음' }
  }
};

export function linkEvidence(obs: Observation, hypothesisId: HypothesisId): EvidenceLink {
  const row = MATRIX[obs.ruleId];
  const fallback = { verdict: 'undetermined' as Compat, memo: '정의되지 않은 조합 — 추가 조사 필요' };
  const cell = row?.[hypothesisId] ?? fallback;
  return {
    observationKey: `${obs.artworkId}/${obs.regionId}/${obs.testId}`,
    hypothesisId,
    verdict: cell.verdict,
    memo: cell.memo
  };
}

export function summarizeConsistency(links: EvidenceLink[]): {
  blockedRash: boolean;
  message: string;
} {
  if (links.length === 0) {
    return { blockedRash: true, message: '연결된 증거가 없습니다. 단정을 보류하세요.' };
  }
  const hasCompat = links.some((l) => l.verdict === 'compatible');
  const hasIncompat = links.some((l) => l.verdict === 'incompatible');
  if (!hasCompat && !hasIncompat) {
    return { blockedRash: true, message: '아직 구별되지 않습니다 (undetermined만 존재). 추가 조사 또는 보류를 고르세요.' };
  }
  return {
    blockedRash: false,
    message: hasIncompat
      ? '일부 가설이 반박되었습니다. 남은 가설의 근거를 보고서에 적으세요.'
      : '지지 증거가 있습니다. 그래도 불확실성과 되돌림을 함께 적으세요.'
  };
}

export const HYPOTHESIS_META: Record<HypothesisId, { label: string; symbol: string; desc: string }> = {
  'surface-deposit': { label: '표면 오염', symbol: '●', desc: '시간에 쌓인 먼지·그을음 막' },
  'overpaint': { label: '후대 덧칠', symbol: '▲', desc: '나중에 덧칠한 물감층' },
  'original-dark': { label: '원래 어두운 안료', symbol: '■', desc: '처음부터 어두웠던 물감' }
};
