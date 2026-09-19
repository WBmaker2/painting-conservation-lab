import type { RunRecord } from '../models/types.js';

const KEY = 'pclab.records.v1';

export function saveRecord(rec: RunRecord): { ok: boolean; reason?: string } {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const arr = Array.isArray(parsed) ? (parsed as RunRecord[]) : [];
    arr.push(rec);
    localStorage.setItem(KEY, JSON.stringify(arr.slice(-20)));
    return { ok: true };
  } catch {
    return { ok: false, reason: '이 브라우저에 저장할 수 없습니다. JSON 내보내기로 보관하세요.' };
  }
}

function isRecord(r: unknown): r is RunRecord {
  if (typeof r !== 'object' || r === null) return false;
  const o = r as Record<string, unknown>;
  return o.schemaVersion === 1 && o.appId === 'painting-conservation-lab' && typeof o.createdAt === 'string';
}

export function loadRecords(): RunRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecord);
  } catch {
    return [];
  }
}

export function downloadJSON(rec: RunRecord): void {
  const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeId = rec.scenarioId.replace(/[^a-z0-9-]+/gi, '-');
  a.download = `conservation-${safeId}-${rec.createdAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
