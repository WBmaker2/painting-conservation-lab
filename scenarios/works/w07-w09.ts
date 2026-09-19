import type { Artwork } from '../../models/types.js';

const IMG = (w: string) => ({
  full: `./works/${w}-full.webp`,
  zoom: `./works/${w}-zoom.webp`,
  rake: `./works/${w}-rake.webp`,
  layerbg: `./works/${w}-layerbg.webp`,
  after: `./works/${w}-after.webp`
});

export const WORKS_07_09: Artwork[] = [
  {
    id: 'blue-bottle',
    fictionalTitle: '가상의 정물화 〈푸른 병〉',
    story: '병 표면이 뿌옇다. 유리 먼지일까, 뒤 덧칠일까.',
    palette: ['#2b3a67', '#6b5a3e', '#d8cfae'],
    rightsNote: '가상 작품 · 생성 이미지 사용 (Nano Banana 2)',
    expertNote: '보존 관점: 유리·금속의 뿌연 광택은 오염처럼 보여 원래 기법일 수 있다. 재질 표현과 손상을 구분한다.',
    images: IMG('w07'),
    regions: [
      {
        id: 'bottle-film',
        label: '영역 A — 병 표면',
        hint: '왼쪽 유리병, 뿌옇게 탁함',
        hiddenStateId: 'grime-thin',
        hidden: {
          support: '캔버스',
          ground: '암갈색 바탕',
          paintLayers: ['군청 물감'],
          surfaceDeposit: 'thin-dust',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      },
      {
        id: 'backdrop-over',
        label: '영역 B — 뒤 배경',
        hint: '오른쪽 배경, 균일하고 진함',
        hiddenStateId: 'overpaint-cover',
        hidden: {
          support: '캔버스',
          ground: '암갈색 바탕',
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
    id: 'black-hat',
    fictionalTitle: '가상의 초상화 〈검은 모자〉',
    story: '모자 그늘이 깊다. 원래 음영일까, 덧칠일까.',
    palette: ['#1c1917', '#57534e', '#a8a29e'],
    rightsNote: '가상 작품 · 생성 이미지 사용 (Nano Banana 2) · 실존 인물 아님',
    expertNote: '보존 관점: 얼굴 그늘은 화가의 핵심 의도인 경우가 많다. 그늘을 밝히는 순간 표정이 바뀐다.',
    images: IMG('w08'),
    regions: [
      {
        id: 'eye-shade',
        label: '영역 A — 눈 그늘',
        hint: '모자 아래, 깊지만 투명함',
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
        id: 'coat-retouch',
        label: '영역 B — 외투 손질',
        hint: '아래 외투, 고르게 어두움',
        hiddenStateId: 'overpaint-cover',
        hidden: {
          support: '캔버스',
          ground: '황토 바탕',
          paintLayers: ['흑갈색 물감', '덧칠(먹색)'],
          surfaceDeposit: 'none',
          varnishState: 'yellowed',
          damageType: 'retouching-cover'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      }
    ]
  },
  {
    id: 'winter-field',
    fictionalTitle: '가상의 풍경화 〈겨울 들판〉',
    story: '얼음이 탁하다. 서리 먼지일까, 원래 탁한 안료일까.',
    palette: ['#cbd5e1', '#475569', '#78716c'],
    rightsNote: '가상 작품 · 생성 이미지 사용 (Nano Banana 2)',
    expertNote: '보존 관점: 흰색·얼음은 황변·먼지가 가장 먼저 드러나는 자리. 탁함의 위치를 보면 원인이 보인다.',
    images: IMG('w09'),
    regions: [
      {
        id: 'ice-film',
        label: '영역 A — 얼음 막',
        hint: '왼쪽 얼음, 가루처럼 탁함',
        hiddenStateId: 'grime-thin',
        hidden: {
          support: '캔버스',
          ground: '백색 바탕',
          paintLayers: ['회청색 물감'],
          surfaceDeposit: 'thin-dust',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      },
      {
        id: 'branch-shade',
        label: '영역 B — 가지 그림자',
        hint: '오른쪽 나무, 깊지만 투명함',
        hiddenStateId: 'original-umber',
        hidden: {
          support: '캔버스',
          ground: '백색 바탕',
          paintLayers: ['엄버+회색 혼합'],
          surfaceDeposit: 'none',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      }
    ]
  }
];
