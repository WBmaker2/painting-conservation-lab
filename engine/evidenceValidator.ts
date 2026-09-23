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
    'surface-deposit': { verdict: 'compatible', memo: '표면막 특유의 얼룩진 빛 반응' },
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
    'overpaint': { verdict: 'compatible', memo: '덧칠 부위의 빛 반응이 억제된 반점' },
    'original-dark': { verdict: 'incompatible', memo: '원래 바니시면 빛 반응이 고르게 보여야 함' }
  },
  'original-umber::infrared': {
    'surface-deposit': { verdict: 'undetermined', memo: '얇은 오염도 적외선을 투과해 구별 불가' },
    'overpaint': { verdict: 'incompatible', memo: '덧칠 경계·덮인 윤곽이 없음' },
    'original-dark': { verdict: 'compatible', memo: '안료 자체 흡수 + 밑그림 왜곡 없음' }
  },
  'original-umber::ultraviolet': {
    'surface-deposit': { verdict: 'undetermined', memo: '얇은 오염도 고르게 보일 수 있어 단독 판단 불가' },
    'overpaint': { verdict: 'incompatible', memo: '보수 반점이 없음' },
    'original-dark': { verdict: 'compatible', memo: '고른 바니시 빛 반응, 덧칠·오염 징후 없음' }
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
    return { blockedRash: true, message: '비교할 관찰이 아직 없어요. 먼저 가상 조사를 하나 선택해 주세요.' };
  }
  const judged = links.filter((l) => l.studentVerdict);
  if (judged.length < links.length) {
    return { blockedRash: true, message: `아직 ${links.length - judged.length}개 판단이 남았습니다. 관찰마다 가설을 지지·반박하거나 미정으로 골라 주세요.` };
  }
  const hasCompat = judged.some((l) => l.studentVerdict === 'compatible');
  const hasIncompat = judged.some((l) => l.studentVerdict === 'incompatible');
  if (!hasCompat && !hasIncompat) {
    return { blockedRash: true, message: '고른 조사만으로는 아직 구별하기 어려워요. 추가 조사를 하거나 판단을 미뤄 보세요.' };
  }
  return {
    blockedRash: false,
    message: hasIncompat
      ? '학생 판단에서 일부 가설을 반박했습니다. 아래에서 가상 모형의 판정과 이유를 비교해 보세요.'
      : '학생 판단에서 지지한 가설이 있습니다. 가상 모형의 판정과 불확실성도 비교해 보세요.'
  };
}

export const HYPOTHESIS_META: Record<HypothesisId, { label: string; symbol: string; desc: string }> = {
  'surface-deposit': { label: '표면 오염', symbol: '●', desc: '시간에 쌓인 먼지·그을음 막' },
  'overpaint': { label: '후대 덧칠', symbol: '▲', desc: '나중에 덧칠한 물감층' },
  'original-dark': { label: '원래 어두운 안료', symbol: '■', desc: '처음부터 어두웠던 물감' }
};
