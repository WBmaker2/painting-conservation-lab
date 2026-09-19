# 구현 로그

날짜는 UTC+9 (KST) 기준 기록. 수량·성능 수치는 측정 전이면 ‘목표’로 표기.

## 2026-09-19 — 배포 전 개선 착수

- 현황: P0 스캐폴드 빌드 통과(`tsc --noEmit && vite build`, dist 약 52K). `tests/`, `assets/` 없음. `index.html`의 `/src/main.ts` 절대경로가 저장소 하위 경로 배포를 깨뜨림(배포 차단).
- 계획: 배포차단→테스트→완성도→검증6종→최종빌드 순. 각 단계마다 본 파일에 한 줄 이상 기록.
- 공통원칙 고정: 밝은 한국어 UI, 질문1+시작버튼1, gi-pulse 1개, reduced-motion 정적 테두리, 색+기호+문구, VoiceOver 제외, TTS·자동재생 없음, PII 저장 금지.

## (아래에 단계별 추가)

## 2026-09-19 — 배포차단 수정

- `index.html`: `/src/main.ts`→`./src/main.ts`, 파비콘 `./favicon.svg`(`public/`), og·theme-color 추가. Google Fonts에서 미제공 Pretendard 제거(시스템 폴백 유지).
- `assets/favicon.svg` 원본 + `public/favicon.svg` 배포본. dist에 favicon 포함·절대경로 참조 없음 확인.

## 2026-09-19 — tests/ 신설, 22개 통과

- `vitest` devDep 추가, `npm test`= `vitest run`. `tsconfig` include에 `tests` 추가.
- `budget` 6개(6점·1+2+3·초과차단·중복차단·NaN)·`cases` 10개(3점×2영역·9규칙 전수·비용표)·`evidence` 6개(사건별 지지/반박·확대 한계·보류 유도).

## 2026-09-19 — 완성도 개선

- `storage.ts`: 저장 성공/실패 반환, 불량 레코드 필터, 파일명 살균.
- `main.ts`: 메모 200자·결정문 500자 상한(입력+수집 절단), 저장 성공/실패 문구(`role=status`), 보고서 인쇄 버튼, 첫 화면 CTA 단일화(observing 네비 제거+시작버튼 가드 적용).
- `style.css`: `.success`, `overflow-wrap`, `@media print`. `DecisionReport` esc 따옴표 보강.

## 2026-09-19 — 검증·최종빌드

- `docs/VERIFICATION.md` 6종 작성(모델·데이터 통과, UI 정적+스모크, 성능 측정, 교과는 설계반영, 배포후 미수행 명시).
- 최종: check 통과·test 22 통과·build 56K·preview 200. `docs/DEPLOY-CHECKLIST.md` 차단 7개 전부 체크.

## 2026-09-19 — 승인 후 실측 (하위 경로·4폭·전 여정)

- 하위 경로: `dist`를 `/painting-conservation-lab/`에 서빙 — 페이지·JS·CSS·파비콘 200, 상대경로만(외부는 폰트 CDN).
- 클릭: `tests/flow.test.ts` 3개 신설(happy-dom, 가드차단·전여정·복귀) — 총 25개 통과. `tests/render-check.mjs` 실브라우저 360·1280 전 여정 통과(예산 3/6·11행·저장 문구).
- 렌더: 320·360·768·1280 넘침 0px·에러 0·CTA 1개. `npm run verify:render`로 재현. 샷 `/tmp/render-shots`目视 정상.
- 미결: Lighthouse, 배포·HVC 주소 (배포처 확정 시).

## 2026-09-19 — 700 단일 웨이트 (2번 선택)

- 표시용 명조는 제목 bold(700)에서만 사용, 600은 시스템 폰트 영역 → 시각 변화 없이 폰트 260→141KB.
- 재측정: 모바일 76점·TTI 4.0s·CLS 0. `DESIGN.md`에 700 only 명기.

## 2026-09-19 — Lighthouse 실측 + 폰트 비동기화

- 공개 URL 기준 Lighthouse 12 (headless chromium): 모바일 71점·TTI 4.7s·CLS 0, 데스크톱 99점·TTI 0.8s·CLS 0.
- 병목은 Noto Serif KR woff2 7종 ≈260KB. 폰트 CSS 비동기화(0a8cc92) 시도 → lab 수치 무변화, 페이로드 자체가 문제라 디자인 변경(제거/단일 웨이트)은 선택지로 보류.

## 2026-09-19 — GitHub 배포 (공개 URL 확인)

- 레포: https://github.com/WBmaker2/painting-conservation-lab (Public, main 단일 커밋 bd85e7f).
- Pages: https://wbmaker2.github.io/painting-conservation-lab/ (Actions workflow build, workflow_dispatch 겸용).
- 초회 실패 원인: push가 Pages 활성화보다 먼저 실행 → deploy 404. `gh run rerun --failed`로 재실행 후 build·deploy success.
- 실서비스 확인: 페이지 200, JS·CSS·파비콘 200, 상대경로만. 공통원칙 §6-6 (하위 경로 자산·기능 직접 확인) 충족.
