import type { Artwork } from '../../models/types.js';

const IMG = (w: string) => ({
  full: `./works/${w}-full.webp`,
  zoom: `./works/${w}-zoom.webp`,
  rake: `./works/${w}-rake.webp`,
  layerbg: `./works/${w}-layerbg.webp`,
  after: `./works/${w}-after.webp`
});

export const WORKS_04_06: Artwork[] = [
  {
    id: 'yellow-quince',
    fictionalTitle: '가상의 정물화 〈노란 모과〉',
    story: '모과 그림자가 깊다. 원래 안료일까, 쟁반 먼지일까.',
    palette: ['#c9a227', '#5a4a2b', '#8a6f3c'],
    rightsNote: '가상 작품 · 생성 이미지 사용 (Nano Banana 2)',
    expertNote: '보존 관점: 아침광의 깊은 그림자는 원래 설계일 수 있다. 밝게 보이게 하려는 욕심이 과잉 개입을 부른다.',
    images: IMG('w04'),
    regions: [
      {
        id: 'quince-shadow',
        label: '영역 A — 모과 그림자',
        hint: '중앙 과일 아래, 깊지만 투명함',
        hiddenStateId: 'original-umber',
        hidden: {
          support: '캔버스',
          ground: '황토 바탕',
          paintLayers: ['엄버계 어두운 안료'],
          surfaceDeposit: 'none',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      },
      {
        id: 'tray-dust',
        label: '영역 B — 쟁반 먼지',
        hint: '아래 쟁반 위, 가루처럼 탁함',
        hiddenStateId: 'grime-thin',
        hidden: {
          support: '캔버스',
          ground: '황토 바탕',
          paintLayers: ['회갈색 물감'],
          surfaceDeposit: 'thin-dust',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      }
    ]
  },
  {
    id: 'red-shawl',
    fictionalTitle: '가상의 초상화 〈붉은 숄〉',
    story: '어깨 숄이 탁하다. 먼지일까, 배경 덧칠의 영향일까.',
    palette: ['#8a2f2b', '#3a2b28', '#d8cfae'],
    rightsNote: '가상 작품 · 생성 이미지 사용 (Nano Banana 2) · 실존 인물 아님',
    expertNote: '보존 관점: 인물 주변 배경은 후대에 손본 경우가 많다. 얼굴과 배경을 같은 잣대로 판단하지 않는다.',
    images: IMG('w05'),
    regions: [
      {
        id: 'shawl-dust',
        label: '영역 A — 어깨 먼지',
        hint: '왼쪽 어깨, 고르게 탁함',
        hiddenStateId: 'grime-thin',
        hidden: {
          support: '캔버스',
          ground: '적갈색 바탕',
          paintLayers: ['진홍 물감'],
          surfaceDeposit: 'thin-dust',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      },
      {
        id: 'backdrop-retouch',
        label: '영역 B — 배경 손질',
        hint: '오른쪽 배경, 균일하고 진함',
        hiddenStateId: 'overpaint-cover',
        hidden: {
          support: '캔버스',
          ground: '적갈색 바탕',
          paintLayers: ['암갈색 물감', '덧칠(흑갈색)'],
          surfaceDeposit: 'none',
          varnishState: 'patchy',
          damageType: 'retouching-cover'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      }
    ]
  },
  {
    id: 'fog-harbor',
    fictionalTitle: '가상의 풍경화 〈안개 항구〉',
    story: '하늘 띠가 유난히 평평하다. 덧칠일까, 원래 안개일까.',
    palette: ['#7a8ba6', '#4a5568', '#d8d4c8'],
    rightsNote: '가상 작품 · 생성 이미지 사용 (Nano Banana 2)',
    expertNote: '보존 관점: 넓게 깔린 하늘·바다는 덧칠이 숨기 좋은 자리. 측면광의 단차가 정직한 증인이다.',
    images: IMG('w06'),
    regions: [
      {
        id: 'sky-band',
        label: '영역 A — 하늘 띠',
        hint: '위쪽 하늘, 평평하고 균일함',
        hiddenStateId: 'overpaint-cover',
        hidden: {
          support: '캔버스',
          ground: '회색 바탕',
          paintLayers: ['창백한 청회 물감', '덧칠(연회색)'],
          surfaceDeposit: 'none',
          varnishState: 'yellowed',
          damageType: 'retouching-cover'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      },
      {
        id: 'water-glow',
        label: '영역 B — 물결 빛',
        hint: '중앙 수면, 깊지만 투명함',
        hiddenStateId: 'original-umber',
        hidden: {
          support: '캔버스',
          ground: '회색 바탕',
          paintLayers: ['엄버+청회 혼합'],
          surfaceDeposit: 'none',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      }
    ]
  }
];
