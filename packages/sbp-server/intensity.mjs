/** Deterministic decay: base * exp(-decayRate * dt_s) + inflations (FR-3.x). */
export function currentIntensity(rec, nowMs = Date.now()) {
  const t0 = typeof rec.publishedAt === "number" ? rec.publishedAt : nowMs;
  const dtS = Math.max(0, (nowMs - t0) / 1000);
  const base = rec.baseIntensity ?? 0;
  const lam = rec.decayRate ?? 0;
  const inf = rec.inflations ?? 0;
  return base * Math.exp(-lam * dtS) + inf;
}
