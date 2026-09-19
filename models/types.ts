export type HypothesisId = 'surface-deposit' | 'overpaint' | 'original-dark';
export type TestId = 'visibleZoom' | 'rakingLight' | 'layerDiagram' | 'infrared' | 'ultraviolet';
export type DecisionAction = 'keep' | 'investigate' | 'simulatedRemovalPreview';
export type Phase = 'observing' | 'testing' | 'evidence' | 'deciding' | 'report';
export type Compat = 'compatible' | 'incompatible' | 'undetermined';

export interface HiddenState {
  support: string;
  ground: string;
  paintLayers: string[];
  surfaceDeposit: 'none' | 'thin-dust' | 'thick-grime';
  varnishState: 'even' | 'yellowed' | 'patchy';
  damageType: 'none' | 'abrasion' | 'retouching-cover';
}

export interface RegionState {
  id: string;
  label: string;
  hint: string;
  hiddenStateId: string;
  hidden: HiddenState;
  validHypotheses: HypothesisId[];
}

export interface Artwork {
  id: string;
  fictionalTitle: string;
  story: string;
  palette: [string, string, string];
  regions: RegionState[];
  rightsNote: string;
  expertNote: string;
}

export interface TestDef {
  id: TestId;
  label: string;
  cost: number;
  range: string;
  limitations: string;
}

export interface Observation {
  testId: TestId;
  regionId: string;
  artworkId: string;
  textObservation: string;
  shortLabel: string;
  svgKind: 'zoom' | 'rake' | 'layers' | 'ir' | 'uv';
  ruleId: string;
}

export interface EvidenceLink {
  observationKey: string;
  hypothesisId: HypothesisId;
  verdict: Compat;
  memo: string;
}

export interface Decision {
  regionId: string;
  artworkId: string;
  action: DecisionAction;
  evidenceKeys: string[];
  uncertainty: string;
  reversibilityNote: string;
  expectedEffect: string;
}

export interface RunRecord {
  schemaVersion: 1;
  appId: 'painting-conservation-lab';
  createdAt: string;
  scenarioId: string;
  parameters: { artworkId: string; regionId: string; tests: TestId[]; budgetStart: number };
  seed: number;
  engineVersion: string;
  scenarioVersion: string;
  observations: Observation[];
  prediction: { hypotheses: HypothesisId[]; note: string };
  explanation: { links: EvidenceLink[]; decision: Decision | null };
}
