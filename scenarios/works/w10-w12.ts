import type { Artwork } from '../../models/types.js';

const IMG = (w: string) => ({
  full: `./works/${w}-full.webp`,
  zoom: `./works/${w}-zoom.webp`,
  rake: `./works/${w}-rake.webp`,
  layerbg: `./works/${w}-layerbg.webp`,
  after: `./works/${w}-after.webp`
});

export const WORKS_10_12: Artwork[] = [
  {
    id: 'grape-walnut',
    fictionalTitle: '가상의 정물화 〈포도와 호두〉',
    story: '포도송이가 유난히 진하다. 덧칠일까, 호두 쪽 먼지일까.',
    palette: ['#4c1d95', '#6b5a3e', '#1c1917'],
    rightsNote: '가상 작품 · 생성 이미지 사용 (Nano Banana 2)',
    expertNote: '보존 관점: 가장 어두운 부분이 가장 의심스럽다. 진함의 경계가 날카로우면 덧칠을 먼저 의심한다.',
    images: IMG('w10'),
    regions: [
      {
        id: 'grape-dark',
        label: '영역 A — 포도송이',
        hint: '중앙 포도, 진하고 균일함',
        hiddenStateId: 'overpaint-cover',
        hidden: {
          support: '캔버스',
          ground: '흑갈색 바탕',
          paintLayers: ['자주 물감', '덧칠(암자주)'],
          surfaceDeposit: 'none',
          varnishState: 'patchy',
          damageType: 'retouching-cover'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      },
      {
        id: 'walnut-dust',
        label: '영역 B — 호두 먼지',
        hint: '오른쪽 호두 위, 가루처럼 탁함',
        hiddenStateId: 'grime-thin',
        hidden: {
          support: '캔버스',
          ground: '흑갈색 바탕',
          paintLayers: ['황갈색 물감'],
          surfaceDeposit: 'thin-dust',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      }
    ]
  },
  {
    id: 'white-collar',
    fictionalTitle: '가상의 초상화 〈흰 깃〉',
    story: '외투는 어둡고 깃만 빛난다. 원래 설계일까, 깃 먼지일까.',
    palette: ['#e7e5e4', '#44403c', '#78716c'],
    rightsNote: '가상 작품 · 생성 이미지 사용 (Nano Banana 2) · 실존 인물 아님',
    expertNote: '보존 관점: 밝은 부분을 기준으로 삼으면 어두운 부분이 병적으로 보인다. 기준을 어디에 두는지부터 의심한다.',
    images: IMG('w11'),
    regions: [
      {
        id: 'coat-dark',
        label: '영역 A — 어두운 외투',
        hint: '어깨 외투, 깊지만 투명함',
        hiddenStateId: 'original-umber',
        hidden: {
          support: '캔버스',
          ground: '회색 바탕',
          paintLayers: ['엄버계 어두운 안료'],
          surfaceDeposit: 'none',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      },
      {
        id: 'collar-film',
        label: '영역 B — 깃 표면',
        hint: '흰 깃 위, 얇게 탁함',
        hiddenStateId: 'grime-thin',
        hidden: {
          support: '캔버스',
          ground: '회색 바탕',
          paintLayers: ['백색 물감'],
          surfaceDeposit: 'thin-dust',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      }
    ]
  },
  {
    id: 'sunset-bank',
    fictionalTitle: '가상의 풍경화 〈노을 강둑〉',
    story: '둑이 유난히 어둡다. 덧칠일까, 물결 원래 안료의 대비일까.',
    palette: ['#92400e', '#451a03', '#fbbf24'],
    rightsNote: '가상 작품 · 생성 이미지 사용 (Nano Banana 2)',
    expertNote: '보존 관점: 노을처럼 강한 대비는 덧칠을 숨기기 좋다. 둑과 물결을 따로 보고 같은 결론을 내리지 않는다.',
    images: IMG('w12'),
    regions: [
      {
        id: 'bank-cover',
        label: '영역 A — 둑 어둠',
        hint: '왼쪽 둑, 진하고 균일함',
        hiddenStateId: 'overpaint-cover',
        hidden: {
          support: '캔버스',
          ground: '황토 바탕',
          paintLayers: ['적갈색 물감', '덧칠(암갈색)'],
          surfaceDeposit: 'none',
          varnishState: 'yellowed',
          damageType: 'retouching-cover'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      },
      {
        id: 'ripple-umber',
        label: '영역 B — 물결 안료',
        hint: '오른쪽 물결, 깊지만 투명함',
        hiddenStateId: 'original-umber',
        hidden: {
          support: '캔버스',
          ground: '황토 바탕',
          paintLayers: ['엄버+주황 혼합'],
          surfaceDeposit: 'none',
          varnishState: 'even',
          damageType: 'none'
        },
        validHypotheses: ['surface-deposit', 'overpaint', 'original-dark']
      }
    ]
  }
];
