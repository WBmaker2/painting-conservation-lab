import type { Observation, TestDef, TestId } from '../models/types.js';
import { getRegion } from './caseModel.js';

export const TESTS: TestDef[] = [
  {
    id: 'visibleZoom',
    label: '확대 관찰',
    cost: 1,
    range: '관심 영역 표면 ×20, 색·입자·경계 (가상 설명)',
    limitations: '내부 층을 직접 보여주지 않음. 표면만으로 단정 금지.'
  },
  {
    id: 'rakingLight',
    label: '측면광 관찰',
    cost: 2,
    range: '옆에서 비춘 빛, 표면 요철·덧칠 단차 (가상 설명)',
    limitations: '두께 수치가 아님. 높이는 과장 표시될 수 있음.'
  },
  {
    id: 'layerDiagram',
    label: '층 정보 확인',
    cost: 3,
    range: '가상 그림 단면 (천·나무 받침, 바탕층, 물감, 표면 코팅)',
    limitations: '가상 단면 모식도. 실제 두께·재료 측정값이 아님.'
  },
  {
    id: 'infrared',
    label: '적외선 관찰 (가상 모형)',
    cost: 2,
    range: '표면 아래 밑그림·덧칠 경계 (가상 투과 모형)',
    limitations: '가상 투과 모식도. 실제 장비 측정값·침투 깊이가 아님.'
  },
  {
    id: 'ultraviolet',
    label: '자외선 관찰 (가상 모형)',
    cost: 2,
    range: '바니시(표면 보호 투명 코팅)의 빛 반응·보수 반점·오염 얼룩 (가상 모형)',
    limitations: '빛 반응을 그린 가상 모식도. 실제 색·밝기를 측정한 결과가 아님.'
  }
];

export const SCENARIO_VERSION = 'p1-5tests';

function ruleFor(hiddenStateId: string, testId: TestId): string {
  return `${hiddenStateId}::${testId}`;
}

const TEXT: Record<string, { short: string; long: string; kind: Observation['svgKind'] }> = {
  'grime-thin::visibleZoom': {
    short: '가루처럼 앉은 탁한 막',
    long: '확대: 어두운 영역에 회갈색 가루 입자가 고르게 앉아 있음. 붓결은 아래에 그대로 이어짐. 경계가 흐릿함.',
    kind: 'zoom'
  },
  'grime-thin::rakingLight': {
    short: '요철 없음, 매끈한 그림자',
    long: '측면광: 표면이 매끈하고 단차가 없음. 빛을 비스듬히 비춰도 경계 그림자가 생기지 않음. 오염막이 얇게 덮인 양상.',
    kind: 'rake'
  },
  'grime-thin::layerDiagram': {
    short: '물감 위 얇은 침적층',
    long: '층 도식: 지지체–바탕층–물감층(원래 모습 유지) 위에 얇은 먼지층이 덮임. 덧칠층 없음. 바니시는 누렇게 변하지 않고 고름.',
    kind: 'layers'
  },
  'overpaint-cover::visibleZoom': {
    short: '진하고 균일한 어두움',
    long: '확대: 어두운 영역 색이 진하고 균일함. 아래 붓결과 결이 다름. 가장자리에 날카로운 경계가 보임.',
    kind: 'zoom'
  },
  'overpaint-cover::rakingLight': {
    short: '경계에 작은 단차',
    long: '측면광: 어두운 영역 가장자리에 얇은 단차가 보임. 덧칠이 원래 물감 위를 덮으며 생긴 턱. 내부는 비교적 평평함.',
    kind: 'rake'
  },
  'overpaint-cover::layerDiagram': {
    short: '원 물감 위 덧칠층',
    long: '층 도식: 원래 물감층 위에 별도의 덧칠층이 덮여 있음. 표면침적은 거의 없음. 덧칠 아래 원래 붓결이 보존됨.',
    kind: 'layers'
  },
  'original-umber::visibleZoom': {
    short: '깊지만 투명한 어둠',
    long: '확대: 어두운 안료 자체가 깊고 투명함. 입자가 고르고 붓결이 자연스럽게 이어짐. 덮인 막이나 경계가 없음.',
    kind: 'zoom'
  },
  'original-umber::rakingLight': {
    short: '붓결 그대로, 단차 없음',
    long: '측면광: 원래 붓결의 요철만 보이고 덧칠 턱이 없음. 빛 방향을 바꿔도 경계 그림자가 생기지 않음.',
    kind: 'rake'
  },
  'original-umber::layerDiagram': {
    short: '물감층 자체가 어두움',
    long: '층 도식: 물감층 자체가 어두운 안료(엄버 계열)로 구성됨. 덧칠·침적층 없음. 바니시는 부분 황변.',
    kind: 'layers'
  },
  'grime-thin::infrared': {
    short: '막을 투과한 붓결',
    long: '적외선: 얇은 오염막을 투과해 아래 원래 붓결과 밑그림이 선명하게 보임. 덧칠 특유의 덮인 윤곽이 없음.',
    kind: 'ir'
  },
  'grime-thin::ultraviolet': {
    short: '얼룩덜룩한 막의 빛 반응',
    long: '자외선: 표면막에서 얼룩덜룩한 빛 반응이 보임. 바니시의 고른 빛 반응과도, 보수 반점과도 다른 양상.',
    kind: 'uv'
  },
  'overpaint-cover::infrared': {
    short: '덧칠 아래 밑그림',
    long: '적외선: 덧칠층을 투과해 원래 밑그림(소묘)이 드러남. 표면 색의 윤곽과 밑그림이 어긋나 후대 개입을 시사.',
    kind: 'ir'
  },
  'overpaint-cover::ultraviolet': {
    short: '어두운 보수 반점',
    long: '자외선: 덧칠 부위가 주변보다 어둡게 보임. 보수 물질은 원래 바니시와 빛 반응이 다름.',
    kind: 'uv'
  },
  'original-umber::infrared': {
    short: '안료 자체의 흡수',
    long: '적외선: 어두운 안료가 적외선을 흡수해 여전히 어둡게 보임. 밑그림 왜곡이나 덮인 윤곽이 없음.',
    kind: 'ir'
  },
  'original-umber::ultraviolet': {
    short: '고른 바니시의 빛 반응',
    long: '자외선: 바니시의 빛 반응이 고르게 보임. 덧칠 특유의 어두운 반점이나 오염 얼룩이 없음.',
    kind: 'uv'
  }
};

export function observe(
  artworkId: string,
  regionId: string,
  testId: TestId,
  seed = 1
): Observation | { error: string } {
  if (!artworkId || !regionId || !testId) return { error: '작품·영역·조사를 모두 고르세요.' };
  if (!Number.isFinite(seed)) return { error: 'seed가 올바르지 않습니다.' };
  const region = getRegion(artworkId, regionId);
  if (!region) return { error: '영역을 찾을 수 없습니다.' };
  if (!TESTS.some((t) => t.id === testId)) return { error: '지원하지 않는 조사입니다.' };
  const ruleId = ruleFor(region.hiddenStateId, testId);
  const t = TEXT[ruleId];
  if (!t) return { error: '관찰 규칙이 없습니다. (검수 필요)' };
  return {
    testId,
    regionId,
    artworkId,
    textObservation: t.long,
    shortLabel: t.short,
    svgKind: t.kind,
    ruleId
  };
}

export function observationKey(o: Pick<Observation, 'artworkId' | 'regionId' | 'testId'>): string {
  return `${o.artworkId}/${o.regionId}/${o.testId}`;
}

// P1 복수 조사 전략 비교: 숨은 상태를 모르고 남은 예산으로 가능한 미사용 조사 조합.
// 반환은 비용 내림차순. 정답 유출 없음 (비용표만 사용).
export function planCombos(
  remainingPts: number,
  usedTestIds: TestId[],
  maxLen = 3
): { tests: TestId[]; cost: number }[] {
  if (!Number.isFinite(remainingPts) || remainingPts <= 0) return [];
  const pool = TESTS.filter((t) => !usedTestIds.includes(t.id));
  const out: { tests: TestId[]; cost: number }[] = [];
  const rec = (start: number, acc: TestId[], sum: number): void => {
    for (let i = start; i < pool.length; i++) {
      const next = sum + pool[i].cost;
      if (next > remainingPts) continue;
      const combo = [...acc, pool[i].id];
      if (combo.length <= maxLen) {
        out.push({ tests: combo, cost: next });
        rec(i + 1, combo, next);
      }
    }
  };
  rec(0, [], 0);
  return out.sort((a, b) => b.cost - a.cost || b.tests.length - a.tests.length).slice(0, 6);
}
