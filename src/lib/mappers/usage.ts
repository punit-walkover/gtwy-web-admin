import type { UsageBar, UsageModelRow } from "@/mocks/types";
import type { PlatformUsage } from "@/lib/metrics/usage-contract";
import {
  EM_DASH,
  compact1,
  oneDecimal,
  seconds,
  successColor,
  twoDecimal,
} from "@/lib/mappers/primitives";

/**
 * `GET /api/admin/usage` → the exact shapes `/usage` renders today (plan §1.3).
 *
 * Every rule below is re-derived from the frozen fixture in
 * `src/mocks/overview.ts` by `tests/usage.test.ts`, so a drift fails the build
 * rather than the eye:
 *
 *   tokens   252_500_000 → "252.5M"      `compact1`
 *   calls        167_600 → "167.6k"      `compact1`
 *   p50             1350 → "1.35 s"      `seconds`
 *   success         92.9 → "92.9" + accent  `oneDecimal` / `successColor`
 *   cost          244.62 → "244.62"      `twoDecimal` — the `$` is in the markup
 */

/**
 * The Services bar is a share-of-the-largest bar, not a share-of-total bar.
 *
 * Read straight off the fixture: openai 252.5M → 100, anthropic 251.3M → 100,
 * neev_cloud 137.2M → 54, groq 89.7M → 36, open_router 74.9M → 30. Each is
 * `round(tokens / 252.5M × 100)`; against a *total* of 805.6M none of the five
 * would land within 40 points of its fixture value.
 */
function barPct(tokens: number, maxTokens: number): number {
  if (maxTokens <= 0) return 0;
  return Math.round((tokens / maxTokens) * 100);
}

export function mapUsage(raw: PlatformUsage): {
  services: UsageBar[];
  models: UsageModelRow[];
} {
  const maxTokens = raw.services.reduce((max, s) => Math.max(max, s.tokens), 0);

  const services: UsageBar[] = raw.services.map((service) => ({
    name: service.name,
    pct: barPct(service.tokens, maxTokens),
    tokens: compact1(service.tokens),
    cost: twoDecimal(service.cost),
  }));

  const models: UsageModelRow[] = raw.models.map((model) => ({
    name: model.name,
    service: model.service,
    calls: compact1(model.calls),
    tokens: compact1(model.tokens),
    // Plan §4.4: an absent or timed-out percentile renders as an em dash, never
    // as a fabricated average.
    latency: model.p50LatencyMs === null ? EM_DASH : seconds(model.p50LatencyMs),
    success: oneDecimal(model.successRate),
    color: successColor(model.successRate),
    cost: twoDecimal(model.cost),
  }));

  return { services, models };
}
