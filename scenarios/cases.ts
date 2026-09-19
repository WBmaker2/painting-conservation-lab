import type { Artwork } from '../models/types.js';

export const SCENARIO_VERSION = 'p0-3works';

export const CASES: Artwork[] = [
  {
    id: 'still-night-apple',
    fictionalTitle: '가상의 정물화 〈밤의 사과〉',
    story: '오른쪽 사과 그림자가 유난히 어둡다. 오염일까, 덧칠일까.',
    palette: ['#8a2f2b', '#2f4a3e', '#c9a227'],
    rightsNote: '가상 작품 · AI 생성 아님 · 코드 도식',
    regions: [
      {
        id: 'apple-shadow',
        label: '영역 A — 사과 그림자',
        hint: '오른쪽 작은 영역, 경계가 흐릿함',
        hiddenStateId: 'grime-thin',
        hidden: {
          support: '캔버스',
          ground: '백색 바탕',
          paintLayers: ['적갈색 물감'],
          surfaceDeposit: 'thin-dust',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      },
      {
        id: 'table-cloth',
        label: '영역 B — 식탁보 주름',
        hint: '아래쪽 넓은 영역, 고르게 어두움',
        hiddenStateId: 'overpaint-cover',
        hidden: {
          support: '캔버스',
          ground: '백색 바탕',
          paintLayers: ['회청색 물감', '덧칠(암회색)'],
          surfaceDeposit: 'none',
          varnishState: 'patchy',
          damageType: 'retouching-cover'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      }
    ]
  },
  {
    id: 'blue-hood',
    fictionalTitle: '가상의 초상화 〈푸른 두건〉',
    story: '두건 아래 얼굴이 어둡다. 원래 음영일까, 나중 덧칠일까.',
    palette: ['#2b3a67', '#7a8ba6', '#d8cfae'],
    rightsNote: '가상 작품 · 실존 인물 아님',
    regions: [
      {
        id: 'hood-shade',
        label: '영역 A — 두건 그늘',
        hint: '얼굴 왼쪽, 날카로운 경계',
        hiddenStateId: 'overpaint-cover',
        hidden: {
          support: '나무판',
          ground: '황토 바탕',
          paintLayers: ['청회색 물감', '덧칠(암청)'],
          surfaceDeposit: 'none',
          varnishState: 'yellowed',
          damageType: 'retouching-cover'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      },
      {
        id: 'cheek-glow',
        label: '영역 B — 뺨의 빛',
        hint: '오른쪽 뺨, 깊지만 투명함',
        hiddenStateId: 'original-umber',
        hidden: {
          support: '나무판',
          ground: '황토 바탕',
          paintLayers: ['엄버계 어두운 안료'],
          surfaceDeposit: 'none',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      }
    ]
  },
  {
    id: 'reed-field',
    fictionalTitle: '가상의 풍경화 〈갈대밭〉',
    story: '갈대 사이 물가가 검다. 오염·덧칠·원래 안료 중 무엇일까.',
    palette: ['#3e5a3a', '#1e3a5f', '#8c7a4b'],
    rightsNote: '가상 작품 · 관측 도식용',
    regions: [
      {
        id: 'water-dark',
        label: '영역 A — 검은 물가',
        hint: '중앙 수면, 붓결이 이어짐',
        hiddenStateId: 'original-umber',
        hidden: {
          support: '캔버스',
          ground: '회색 바탕',
          paintLayers: ['엄버+남색 혼합'],
          surfaceDeposit: 'none',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      },
      {
        id: 'reed-edge',
        label: '영역 B — 갈대 끝',
        hint: '오른쪽 가장자리, 가루처럼 탁함',
        hiddenStateId: 'grime-thin',
        hidden: {
          support: '캔버스',
          ground: '회색 바탕',
          paintLayers: ['황록색 물감'],
          surfaceDeposit: 'thin-dust',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      }
    ]
  }
];
