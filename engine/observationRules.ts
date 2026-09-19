import type { Observation, TestDef, TestId } from '../models/types.js';
import { getRegion } from './caseModel.js';

export const TESTS: TestDef[] = [
  {
    id: 'visibleZoom',
    label: '확대 관찰',
    cost: 1,
    range: '관심 영역 표면 ×20, 색·입자·경계',
    limitations: '내부 층을 직접 보여주지 않음. 표면만으로 단정 금지.'
  },
  {
    id: 'rakingLight',
    label: '측면광 관찰',
    cost: 2,
    range: '옆에서 비춘 빛, 표면 요철·덧칠 단차',
    limitations: '두께 수치가 아님. 높이는 과장 표시될 수 있음.'
  },
  {
    id: 'layerDiagram',
    label: '층 정보 확인',
    cost: 3,
    range: '검수된 층 단면 도식 (지지체/바탕/물감/표면/바니시)',
    limitations: '가상 단면 모식도. 실제 두께·재료 측정값이 아님.'
  }
];

export const SCENARIO_VERSION = 'p0-3works';

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
    long: '층 도식: 지지체–바탕–물감층(원형 유지) 위에 얇은 표면침적층이 덮임. 덧칠층 없음. 바니시는 황변 없이 고름.',
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
