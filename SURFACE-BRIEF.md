# Surface brief — painting-conservation-lab P0 (Operate)

Scope: 가상 보존 연구실 첫 화면~보고 5단계. Visitor mode: Operate.
Audience/job/action: 중·고생 + 교사, 30분 수업, 예측→조사→증거연결→결정→보고. Primary action: 예산 6점 안에서 조사 선택 후 근거 있는 보존 결정.

## Direction contract

THESIS: 보존실 라이트박스 위에 놓인 트레이 — 밝은 실험대, 나란한 비교, 층 단면이 전부다. 어두운 몰입형 갤러리, 장식적 질감, 게이미피케이션 연출을 거부한다. 한 눈의 질문이 곧 작업대다.

OWN-WORLD: 제도실 밝기 — 종이 #F8FAFC ground, 잉크 네이비 #1E3A5F, 연구 황토 #A16207 accent 1개만. 12-col 스위스 그리드, 헤어라인 1px, radius 12-14px, elevation은 border 또는 shadow 중 하나. 서체: 본문 Pretendard/system, 제목 Noto Serif KR. 상태는 색+문구+모양(●▲■) 병기.

STORY: 학생은 어두운 얼룩의 원인 2개를 예측하고, 확대/측면광/층정보 중 하나를 골라 예산을 쓰고, 관찰-가설 호환표를 채운 뒤 유지/추가조사/가상미리보기 중 하나를 고른다. 성공은 예쁜 결과가 아니라 보류할 수 있는 이유다.

FIRST VIEWPORT: 첫 화면 — 상단 얇은 바(가상자료 표기+업데이트 내역), 중앙 질문 1줄 “어두운 부분, 바랜 걸까 덧칠한 걸까?”, 가상 정물 썸네일 3점(라이트박스 타일), 하단 gi-pulse 시작 버튼 1개. 데스크톱은 좌 시각(라이트박스)/우 조건 패널 병렬, 모바일은 시각→조건→실행→결과 적층.

FORM: grounded #6 ‘라이트박스 + 층서 트레이’, seed 810f0ce0 assigned 6. 선택 이유: 교실 밝기·비교 과업·표/도식 중심에 가장 정확. challenger 판정: silk-cape declined, rain-garden declined, leather-shelf declined, transit-map competitive, one-bit declined, cutting-bench competitive.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Raises (from declined challengers, donor-named)

- GOLD-CORD-DISCIPLINE (from silk cape): 한 번에 한 버튼만 gi-pulse, 나머지는 정적.
- REPLAY-DISCIPLINE (from rain garden): seed+engineVersion+scenarioVersion+입력+시행수 저장, 같은 조건 같은 관찰.
- HANDLING-DISCIPLINE (from leather shelf): 영역 선택은 만지는 것처럼 — 버튼+방향키+숫자입력 모두 동작.
- MARCHING-ANTS-DISCIPLINE (from one-bit): 선택 영역은 점선+라벨로 명확히, 색만으로 구분 금지.
- RAIL-SEQUENCE-DISCIPLINE (from cutting bench): observing→testing→evidence→deciding→report 레일을 상단에 고정, 현재 위치를 테이프 플래그처럼 표시.

## Scope / anti-goals

- P0만. IR/UV, 약품, 실제진단, 자동복원 제외. Three.js 제외, 2D SVG/표만.
- 이미지 생성 없음 — SVG 도식+표로 판단 가능해야 함.

## States

- observing/testing/evidence/deciding/report. 예산 1+2+3=6 허용, 초과 차단. 로드실패 비용 미차감. 미리보기 가상 표기+되돌리기.
- empty/loading/error/success, 320/360/768/1280, reduced-motion, 키보드 포커스 복귀.

## Constraints

- 밝은 한국어 UI, 첫 화면 질문1+버튼1. gi-pulse 1개. VoiceOver 제외. localStorage 비식별만. 파일 500줄 미만 분리. 입력 검증. 탭 숨김 시 계산 중단(해당 없음, 즉시 반환).
