# Design — painting-conservation-lab

Mode: Operate. World: 라이트박스 + 층서 트레이 (bright lab bench).

## Tokens

- --bg #F8FAFC, --ink #0F172A, --muted #475569, --line #CBD5E1, --card #FFFFFF
- --navy #1E3A5F (primary, focus ring), --accent #A16207 (gi-pulse only)
- radius 12-14px, elevation: border OR shadow (never both heavy). Card shadow: 0 1px 2px + 0 8px 24px rgba(15,23,42,.06)
- Type: body Pretendard/system 16px/1.6, display Noto Serif KR 700 only (제목 bold만 사용), tracking -0.02em, measure ≤68ch
- State language: color + symbol + text (●지지 / ✕반박 / ■미정)

## Composition

- Topbar sticky (brand + 가상 pill + 예산 + 업데이트 내역), rail steps 1-5, grid2 (desktop 1.15/0.85 side-by-side, mobile stacked visual→conditions→execute→result)
- First viewport: question 1 + gi-pulse start 1. No kicker, no metric hero, no nested cards.
- Browser surfaces themed: selection navy/white, focus 3px ring, tabular numerals for budget/cost.

## Motion

- One authored moment: gi-pulse on single primary CTA (2.2s ring). reduced-motion → static 3px accent border, all transitions off.

## Source

- Code-led build, no generated rasters. All visuals are inline SVG + tables (2D fallback = primary path). Provenance: n/a (no raster assets).
