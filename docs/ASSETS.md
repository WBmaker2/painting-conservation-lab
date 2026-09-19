# 자산 목록 (72종 · 12작품 × 6종)

모델: Nano Banana 2 (Google Flow, PRO). 비용: 이미지 생성 0크레딧. 화면비 4:3 고정.
라이선스: PRO 계정 생성물을 자작 교육 앱에 삽입. 가상 작품 표기 필수.
원칙: 기준 원화 고정 → 마스크별 편집. 비대상 영역 변화 시 제외. 처리 전후 동일 좌표·조명.
문자·수치·층경계는 코드 레이어로 합성 (생성 이미지에 맡기지 않음).

## 슬롯 정의 (작품당 6종)

| 슬롯 | 의미 | 제작 |
|---|---|---|
| full | 전체 (기준 원화) | 신규 생성 |
| zoom | 관심 영역 확대 | 기준 편집 (근접) |
| rake | 측면광 | 기준 편집 (좌측광) |
| layerbg | 층도 배경 | 신규 생성 (은은한 질감) |
| before | 처리 전 | full 재사용 (정렬 보장, 별도 레코드) |
| after | 가상 처리 후 | 기준 편집 (오염·덧칠 완화, 동일 구도) |

## 작품 목록

- w01 밤의 사과 (정물): A grime-thin / B overpaint-cover — 기준 확정
- w02 푸른 두건 (초상): A overpaint-cover / B original-umber
- w03 갈대밭 (풍경): A original-umber / B grime-thin
- w04 노란 모과 (정물): A original-umber / B grime-thin
- w05 붉은 숄 (초상): A grime-thin / B overpaint-cover
- w06 안개 항구 (풍경): A overpaint-cover / B original-umber
- w07 푸른 병 (정물): A grime-thin / B overpaint-cover
- w08 검은 모자 (초상): A original-umber / B overpaint-cover
- w09 겨울 들판 (풍경): A grime-thin / B original-umber
- w10 포도와 호두 (정물): A overpaint-cover / B grime-thin
- w11 흰 깃 (초상): A original-umber / B grime-thin
- w12 노을 강둑 (풍경): A overpaint-cover / B original-umber

숨은상태 균형: grime 8 / overpaint 8 / umber 8 (24영역).

## w01 레코드 (시험 배치 — 확정)

- w01-full: 기준 원화. prompt v1. 원본 `assets/works/raw/w01-full.png` (1200×896) → `public/works/w01-full.webp` 104KB. 문자 없음, 우측 사과 음영. 확정.
- w01-zoom: w01-full 편집 (우측 사과 근접, 동일 붓결·조명). webp 115KB. 확정.
- w01-rake: w01-full 편집 (좌측 측면광, 동일 구도). webp 116KB. 확정.
- w01-layerbg: 신규 (1회 정책 오탐지 후 문구 바꿔 재시도 성공). webp 16KB. 확정.
- w01-before: w01-full 재사용. 확정.
- w01-after: w01-full 편집 (먼지막 완화, 동일 구도·조명). webp 85KB. 확정.

## 프롬프트 템플릿 (고정 요소 / 변경 요소)

- 고정: same composition, same objects, same lighting direction, no text, no signature, no watermark, no people (초상 제외), fictional painting.
- 변경: 슬롯별 1개만 (근접 / 측면광 / 질감 배경 / 오염·덧칠 완화).
