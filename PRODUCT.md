# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + TS (static build, no SSR). User chose Vite + TS in init round 2026-09-19. Deploy target: static host subpath (HVC/gallery compatible). No framework lock beyond Vite.

## Users

- Primary: 중·고등학생 (미술·화학·정보 수업, 15-30분 활동 + 5분 정리). Teacher-led + self-directed both must work.
- Secondary: 교사 — 30분 흐름 진행, 예측→조건→실행→근거→재검증→전이 지도.
- Situation: 교실/태블릿/데스크톱 혼합, 320/360/768/1280px 검증 필요. 한국어 UI.

## Product Purpose

가상 회화 보존 연구실. 질문: ‘색이 바랜 것과 나중에 덧칠한 것을 어떻게 구분할까?’ 층 구조·조사 선택·복원 개입의 근거 판단을 학습한다. 성공 = 증거 없는 단정 회피 + 서로 다른 조사 활용 + 불확실성·되돌림 고려한 결정 보고 작성.

## Positioning

현재 앱에는 가상 작품 12점과 가상 조사 5종(확대 관찰·측면광 관찰·층 정보 확인·적외선 관찰·자외선 관찰)이 있습니다. 학생은 제한된 조사 점수로 모형 결과를 살펴보고 가설을 비교합니다. 모든 결과는 코드로 만든 가상 설명이며 실제 작품의 측정·진단이 아닙니다. 실물 보존 처치 지침도 제공하지 않습니다.

## Operating Context

- 30분 흐름: 5분 가설 2개 제안 → 5분 조사 점수 6점 안에서 조사 선택 → 10분 학생 판단과 가상 모형 판단 비교 → 5분 유지/추가 조사/가상 미리보기 결정 → 5분 기대 효과·불확실성·되돌림 생각 기록.
- 상태머신: observing → testing → evidence → deciding → report. 조사 완료 후에만 비용 차감. 로드 실패 시 비용 미차감 + 재시도/텍스트 대체.
- 미리보기는 가상 결과, 되돌리기 제공, 실제 복원 주장 금지.

## Capabilities and Constraints

- 현행 앱: 가상 작품 12점 × 작품별 관심영역 2개, 가상 조사 5종 (확대 관찰 1점 / 측면광 관찰 2점 / 층 정보 확인 3점 / 적외선 관찰 2점 / 자외선 관찰 2점), 조사 점수 6점, 학생 판단과 가상 모형 판단을 나란히 기록, 보존 판단 + 보고.
- 엔진은 렌더러 분리 순수함수: caseModel.ts, observationRules.ts, evidenceValidator.ts, budget.ts. 각 500줄 미만. 입력 유효범위·NaN/Infinity/중복실행 차단. seed·engineVersion·scenarioVersion 저장해 재현.
- 제외: 실제 적외선·자외선 장비 관찰, 약품·농도·처리시간, 실제 작품 자동 진단, 원래 모습 자동 확정, 전문 처치 권고.
- UI 제약(공통원칙): 밝은 한국어 UI, 첫 화면 질문 1 + 시작 버튼 1. 주요 화면 미션/실험/비교/기록. gi-pulse는 중요 다음 행동 1개만. reduced-motion 정적 테두리. 색만으로 상태 구분 금지. VoiceOver 구현 제외. 업데이트 내역 버튼 상시. localStorage는 비식별 실험기록만, 불가 시 세션+JSON 내보내기.
- 이미지와 조사 표현은 가상 작품 자산 및 코드 기반 도식·설명입니다. 조사 결과를 실측값으로 표현하지 않으며 가상 자료 표기를 유지합니다.
- Undecided: HVC 등록/공개 갤러리 동기화는 별도 범위. 실제 배포 URL 미정.

## Brand Commitments

- 명칭: 그림 속 시간을 복원하는 연구실 / painting-conservation-lab. 가상 작품만 사용, 실존 화가 표방 금지.
- 톤: 근거 중심, 단정 금지 (“제거 결정 보류” 같은 보류 결정을 정답 범주로 인정).
- 바인딩 시각 제약 없음 (init에서 미수집).

## Evidence on Hand

- 설계 문서: 00-shared-design-principles.md, 09-painting-conservation-lab.md (경로: 프로젝트 루트). 예제 사건: 표면오염 vs 덧칠 유사 사건에서 층 정보 확인 전 제거 보류.
- 실측 데이터와 실물 작품 사진은 없습니다. 앱의 작품 이미지와 관찰 텍스트는 가상 사례를 위한 합성 자산이며 실측 자료가 아닙니다.
- Absence: 실 작품 사진, 화학 반응식 실측, 성취기준 공식 매핑 없음 — fabricate 금지.

## Learner terms

- 지지체: 그림을 받치는 천·나무 등의 재료.
- 바탕층: 물감이 붙도록 미리 준비한 층.
- 안료: 물감의 색을 내는 재료.
- 바니시: 투명한 코팅으로 색·표면 광택과 보호에 관련됨.
- 기준 용어 확인: [Canadian Conservation Institute, Know Your Paintings](https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/know-your-paintings-deterioration.html).

## Product Principles

1. 근거 없는 예쁨보다 보류할 수 있는 판단.
2. 예산은 탐구를 강제하는 게임 규칙이지 실제 비용이 아니다.
3. 같은 조건은 같은 관찰 — 재현 가능성이 신뢰다.
4. 불확실성과 되돌림을 말할 수 있어야 완료다.
5. 이미지가 없어도 표와 글로 과제를 수행할 수 있어야 한다.

## Accessibility & Inclusion

- 키보드: 영역 선택·다이얼로그 닫기/복귀·대체 조작(숫자입력/버튼/방향키) 필수. 드래그 단독 금지.
- 320px 가로 넘침 없음, 2D 대체 화면 제공, WebGL 실패 시 SVG/Canvas/표 유지.
- 명도대비 4.5:1, 포커스 링 가시화, prefers-reduced-motion 준수.
- VoiceOver 구현·검증 제외 (공통원칙). TTS·자동재생 오디오 없음.
