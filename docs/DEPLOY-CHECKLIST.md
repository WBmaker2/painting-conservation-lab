# 배포 전 체크리스트

승인 전 마지막 관문. 모두 체크 후 배포 요청.

## 차단 (must)

- [x] `index.html` 상대경로 (`./src/main.ts`, `./favicon.svg`) — dist에 절대 `/src` 참조 없음 확인
- [x] `tsc --noEmit` 통과
- [x] `vitest run` 22개 통과
- [x] `vite build` 통과, dist 56K
- [x] `vite preview` 200 응답 + 에셋 해시 해석 확인
- [x] 파비콘 404 없음 (`public/favicon.svg` → dist 포함)
- [x] 첫 화면 CTA 단일 (gi-pulse 1개)

## 권장 (should)

- [x] 입력 상한 (메모 200자·결정문 500자, 저장 시 절단)
- [x] 저장 실패 문구 + JSON 대체 경로
- [x] 보고서 인쇄 (`@media print`, 버튼)
- [x] 불량 레코드 필터 (`isRecord`)
- [x] 파일 500줄 이하 (최대 `src/main.ts` 444줄)
- [x] TTS·자동재생·PII 없음

## 배포 시 (승인 후 → 2026-09-19 실측)

- [x] 하위 경로(`/painting-conservation-lab/`) 5단계 클릭 확인 — 서빙 200 + happy-dom 3개 + 실브라우저 2회
- [x] 320·360·768·1280 렌더 확인 기록 — 넘침 0px·에러 0 (`tests/render-check.mjs`, `npm run verify:render`)
- [ ] Lighthouse TTI·CLS 기록 (배포 URL 확정 후)
- [ ] 배포 주소 + HVC 주소 보고서 기재 (배포처 확정 시)
