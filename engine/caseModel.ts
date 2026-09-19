import type { Artwork, RegionState } from '../models/types.js';
import { CASES } from '../scenarios/cases.js';

export const ENGINE_VERSION = '0.1.0';

export function listArtworks(): Artwork[] {
  return CASES;
}

export function getArtwork(artworkId: string): Artwork | undefined {
  if (typeof artworkId !== 'string' || !artworkId) return undefined;
  return CASES.find((a) => a.id === artworkId);
}

export function getRegion(artworkId: string, regionId: string): RegionState | undefined {
  const art = getArtwork(artworkId);
  if (!art) return undefined;
  if (typeof regionId !== 'string') return undefined;
  return art.regions.find((r) => r.id === regionId);
}

export function validatePrediction(hypotheses: string[]): { ok: boolean; reason?: string } {
  if (!Array.isArray(hypotheses)) return { ok: false, reason: '예측 형식이 올바르지 않습니다.' };
  const allowed = new Set(['surface-deposit', 'overpaint', 'original-dark']);
  const clean = hypotheses.filter((h) => allowed.has(h));
  if (clean.length < 2) return { ok: false, reason: '서로 다른 가설 2개 이상을 고르세요. (표면오염/덧칠/원래안료 중 2개)' };
  if (new Set(clean).size !== clean.length) return { ok: false, reason: '중복된 가설이 있습니다.' };
  return { ok: true };
}
