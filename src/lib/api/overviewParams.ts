import type { NextRequest } from "next/server";

import { ApiError } from "@/lib/api/envelope";
import {
  DEFAULT_OVERVIEW_RANGE,
  OVERVIEW_MAX_LIMIT,
  OVERVIEW_RANGES,
  OVERVIEW_ROW_LIMIT,
  isOverviewRange,
  type OverviewRange,
} from "@/lib/metrics/overview-contract";

/**
 * The query string the three Overview routes share.
 *
 * An unrecognised `range` is `400 bad_request` rather than a silent fallback:
 * the toggle is live now (plan §4.5 Q22), so quietly answering for a window the
 * caller did not ask for would be a wrong answer dressed as a right one.
 */
export function readRange(req: NextRequest): OverviewRange {
  const raw = req.nextUrl.searchParams.get("range");
  if (raw === null || raw === "") return DEFAULT_OVERVIEW_RANGE;
  if (!isOverviewRange(raw)) {
    throw new ApiError("bad_request", `range must be one of ${OVERVIEW_RANGES.join(", ")}.`);
  }
  return raw;
}

/**
 * `?limit=` for the two tables. Defaults to the plan §4.5 Q25 ten rows and is
 * bounded, so the parameter cannot be turned into an unbounded read.
 */
export function readLimit(req: NextRequest): number {
  const raw = req.nextUrl.searchParams.get("limit");
  if (raw === null || raw === "") return OVERVIEW_ROW_LIMIT;

  const limit = Number(raw);
  if (!Number.isInteger(limit) || limit < 1 || limit > OVERVIEW_MAX_LIMIT) {
    // Worded without the word "from" on purpose: `tests/no-writes.test.ts`
    // reads any interpolated string carrying a SQL keyword as built SQL.
    throw new ApiError(
      "bad_request",
      `limit must be a whole number between 1 and ${OVERVIEW_MAX_LIMIT}.`,
    );
  }
  return limit;
}
