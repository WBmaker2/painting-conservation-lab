# 검증 보고서 (배포 전, 2026-09-19)

공통원칙 §6 순서 기준. ‘측정’은 실행한 것, ‘미측정’은 배포 승인 후로 표기.

## 1. 모델 검증 — 통과

- `npm test`: 3파일 22개 통과 (budget 6 / cases 10 / evidence 6).
- 결정론: 같은 hiddenStateId+testId → 같은 관찰 (seed 무관, 난수 없음). `cases.test.ts` ‘seed 무관 결정론’.
- 경계: 1+2+3=6 허용, 초과 차단, 중복 차감 차단, NaN·음수·빈키 차단 (`budget.test.ts`).
- 확률 미사용: undetermined 셀은 확률 대신 보류 유도 (`summarizeConsistency().blockedRash`).

## 2. 데이터 검증 — 통과

- 작품 3점×영역 2개, hiddenStateId 3종이 규칙표 9셀과 전수 일치 (`cases.test.ts` ‘9 규칙 전수’).
- 스키마: `RunRecord` 저장 시 `schemaVersion/appId/seed/engineVersion/scenarioVersion/입력/관찰/예측/설명` 포함. 로드 시 `isRecord` 형태로 걸러냄 (`src/storage.ts`).
- 참조 무결: 존재하지 않는 작품·영역 → `undefined` + 오류 문구, 비용 미차감.
- seed 재현: `seed: 20260919` 고정 기록. 난수 실험 없음.

## 3. UI 검증 — 통과 (정적 확인 + 프리뷰 스모크)

- 한 학습 흐름: observing(예측 2개 가드) → testing(완료 후 차감) → evidence(호환표) → deciding → report. 가드 우회(시작버튼 직접 호출) 수정済.
- 키보드: skip 링크, `data-autofocus` 포커스, 영역 버튼+번호입력+방향키, 다이얼로그 닫기 후 호출 버튼으로 복귀.
- 가로 넘침: 모바일 우선 1열, 640/700/800/860/900에서만 확장. `mono` 긴 키는 `overflow-wrap:anywhere`.
- 모션 축소: `prefers-reduced-motion`에서 gi-pulse 정적 테두리+전환 제거.
- 오류 복구: 예산 부족·관찰 실패 시 `role=alert` + 비용 미차감 문구. 저장 실패 시 사유 표시 + JSON 대체.
- 2D 대체: WebGL 미사용. SVG 도식+층 표가 주 경로라 대체화면 별도 불필요.
- gi-pulse 단일화: 첫 화면은 시작 버튼 1개만 (`navButtons` observing 제외). 이후 단계도 다음 버튼 1개만.
- 미측정 → 실측 완료 (2026-09-19 승인 후): `node tests/render-check.mjs` (headless chromium, `npm run verify:render`).
  320·360·768·1280 전부 가로 넘침 0px·콘솔/네트워크 에러 0·gi-pulse 1개·h1 정상.
  360·1280 전 여정 클릭: 예산 3/6점(1+2 사용), 호환 6행+층표 5행=11행, 저장 문구 확인.
  샷: `/tmp/render-shots` (observing 4폭 + report 2폭,目视 적층/병렬 정상).

## 4. 성능 검증 — 실측 완료 (2026-09-19, 공개 URL, Lighthouse 12)

| 조건 | Performance | FCP/LCP/TTI/SI | TBT | CLS |
|---|---|---|---|---|
| 모바일(Moto G4 시뮬) | 71 → 76 → 73 | 4.7s → 4.0s → 4.4s | 0ms | 0 |
| 데스크톱 | 99 | 0.8s | 0ms | ~0 |

- `npm run build`: 12모듈, dist 56K (js 38K/gzip 12.9K). 앱 코드는 전체 바이트의 약 7%.
- 병목: Noto Serif KR woff2 ≈260KB(600+700)가 로드 시간의 거의 전부 (구글 폰트 한글 subset 분할).
- 시도1: 폰트 CSS 비동기화(0a8cc92) → lab 무변화. 시도2: 700 단일 웨이트(8a5bfd6) → 폰트 141KB, 76점·TTI 4.0s. 표시용 명조는 제목 bold(700)에서만 쓰여 시각 변화 없음.
- 시도3: 썸네일 12장 `img loading=lazy` 전환(81dafaf) → 73점·TTI 4.4s, 유의미 변화 없음. 썸네일은 LCP 병목이 아니었음 확인. 병목은 여전히 웹폰트 페이로드.
- 판단: lab 4초대는 4x 스로틀 시뮬레이션 수치라 실기기보다 가혹하게 나옴. 추가로 줄이려면 웹폰트 제거(시스템 serif 폴백)가 필요 — 선택지로 남김.
- CLS 0·TBT 0ms: 덜컹거림·버튼 먹통 없음. gi-pulse 단일 CTA와 함께 입력 반응은 양호.

## 5. 교과 검토 — 설계 반영 (전문 검토 아님)

- 단순화 명시: 층 두께·높이는 과장 모식도, 예산은 게임 단위, 미리보기는 화면 효과.
- 오개념 방지 문구 내장: ‘AI가 원래 색을 알아낸다’ 경고, 표면 단정 금지, 보류 정답 인정.
- 테스트 통과≠수업 효과. 성취기준 공식 매핑은 별도 검토로 남김.

## 5b. 접근성·인쇄 실측 (2026-09-19, `node tests/access-check.mjs`)

- reduced-motion: `animation-name: none` + 3px 황토 테두리, 에러 0. 통과.
- axe (wcag2a·2aa, 5단계 전수): 초회 deciding에서 `aria-allowed-attr` critical 1건 — `role=radio` 버튼의 `aria-pressed`가 원인. `aria-checked`로 단일화 + 선택 스타일 CSS 이관 후 재측정 0건. 통과.
- 인쇄: print 에뮬레이션目视 정상(상단바·버튼 숨김, 호환표 유지). headless PDF 296KB 생성 확인.

## 6. 배포 승인 후 (2026-09-19 승인 — 실측 완료)

- [x] 하위 경로 서빙 확인: `dist`를 `/painting-conservation-lab/` 하위에 서빙, 페이지·JS·CSS·파비콘 전부 200, html 내 참조 전부 상대경로(`./`), 외부 절대경로는 폰트 CDN만.
- [x] 5단계 클릭 확인: happy-dom 3개(`tests/flow.test.ts`) + 실브라우저 2회(360·1280) 전 여정 통과.
- [x] 클릭 가능한 배포 주소 기재 — https://wbmaker2.github.io/painting-conservation-lab/ (레포: https://github.com/WBmaker2/painting-conservation-lab). HVC 확인용 주소는 HVC 등록 시 기재.
- [ ] Lighthouse TTI·CLS 실측 (미수행 — 배포 URL 확정 후).
- HVC 등록·갤러리 동기화는 별도 범위.
