# 중·고등학생 관점 UX 점검 결과

2026-09-23 기준으로 로컬 앱을 실제 화면에서 점검했습니다. 모의 중학생·고등학생 패널이며 실제 학생 평가가 아닙니다.

## 결과

- 기준선 점수: 72/100, 수용 게이트 fail. 핵심 판단 입력 없이 완료 보고서가 만들어지는 P1 문제가 확인됐습니다.
- 구현: 가설 두 개를 직접 고르기, 증거 관계를 직접 판단하고 모형과 비교하기, 결정과 세 가지 설명을 작성하기 전에는 보고서를 만들 수 없게 했습니다.
- 후속 개선: 작품 선택을 접고 핵심 작품·조작을 먼저 보이게 했습니다. 학생 화면의 내부 키·P1·영문 enum을 숨기고 용어 풀이·전이 행동을 제공했습니다.
- 확인된 장점: 밝고 일관된 화면, 가상 자료 경계 표시, 조사별 한계 안내, 오류 alert의 구체적 회복 메시지, 작은 움직임 설정 준수, 320·375·1280px 문서 가로 넘침 없음.
- 구현 후 브라우저 점검(2026-09-23): 같은 시나리오를 320·375·1280px에서 끝까지 진행했습니다. 가설 미선택 시작, 증거 판단 누락, 결정 누락과 빈 효과 입력이 각각 차단됐고 필요한 안내·초점이 보였습니다. 수정한 학생 판단과 모형 판정, 입력한 보고서 내용이 서로 구분됐습니다.
- 추가 P1 후속 수정(EDU-UX-008): 수정 후 ego-browser에서 320·375·1280px로 재검증했습니다. `layerDiagram` 조사 전에는 층 표가 없고 미확인 안내·돌아가기 버튼이 보였으며, 조사 후에는 표와 가상 모형·실측 아님 안내가 보였습니다. 각 너비에서 가로 넘침은 0px이므로 이번 범위의 P1 UX 수용을 통과했습니다.
- 반응형/키보드: 세 너비 모두 모든 단계에서 문서 가로 넘침 0px. 재시작·전이 후 시작 버튼의 프로그램 포커스 링 3px, Tab/Shift+Tab 순서, reduced-motion에서 애니메이션 `none`/`0s`와 정적 테두리를 확인했습니다. 전이 CTA의 `gi-pulse`, 새 작품·예측 비움·조사 점수 초기화도 확인했습니다.
- 점수 처리: 72/100은 구현 전 기준선 점수입니다. 구현 후 점수를 다시 산정하지 않았습니다. UX 수용 당시에는 빌드·자동 테스트·배포 URL 검증을 범위에서 제외했습니다. 이후 승인된 릴리스 단계에서 `npm run check`, `npm test`(35개), `npm run build`가 통과했습니다. Pages 배포 결과는 아래 릴리스 기록에 추가합니다. 실제 중·고등학생 평가·교사 승인·전문가 검토는 아닙니다.

## 보고서

- 전체 근거와 기준선 점수: work/elementary-webapp-ux-audit.md
- P0–P3 개선 계획과 같은 시나리오 재검증 기준: work/elementary-webapp-ux-plan.md
- 문구별 before/after 장부: work/elementary-webapp-ux-language-audit.md
- 추가 시뮬레이션 필요성 판정: work/elementary-webapp-ux-simulation-decision.md
- 환경 점검: work/elementary-webapp-ux-bootstrap.md
- 화면 증거: work/elementary-webapp-ux-evidence/
- 모바일 320px 포커스 점검 화면: [post-implementation-320-reset-focus.png](work/elementary-webapp-ux-evidence/post-implementation-320-reset-focus.png)
- 용어 풀이 기준: [Canadian Conservation Institute — Know Your Paintings](https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/know-your-paintings-deterioration.html)

## UI/UX route contract

route=ui-ux-pro-max
observed-statuses=ui-ux-pro-max:runtime-available, design-system:runtime-available, impeccable:runtime-available, product-design:audit:missing-optional, design-review:runtime-available, qa:runtime-available, built-in:built-in
action=continue
fallback-reason=선언된 순서에서 첫 runtime-available 후보인 ui-ux-pro-max를 선택했습니다.

브라우저 사전 점검은 ready였습니다. 기본 회귀와 EDU-UX-008 후속 수정을 로컬 개발 서버에서 같은 시나리오로 수동 확인했습니다. UX 점검에는 콘솔·네트워크 전수 분석과 릴리스 작업을 포함하지 않았습니다. 승인된 릴리스 단계의 자동 검사·빌드·Pages·HTTP 결과는 아래에 기록하며, 실제 학생 평가와 전문 보존 검토는 수행하지 않았습니다.

## 승인된 릴리스 단계

- `git diff --check`, `npm run check`, `npm test`(35개), `npm run build`: 모두 통과.
- Pages Actions와 cache-bypass HTTP GET/asset 증거는 작업 최종 릴리스 보고에 기록합니다.
- 별도 브라우저 TaskSpace는 만들지 않았으므로 공개 사이트의 browser-flow·console 상태는 이번 릴리스에서 재검증하지 않았습니다.
