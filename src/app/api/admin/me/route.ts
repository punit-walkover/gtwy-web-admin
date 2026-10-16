import type { NextRequest } from "next/server";

import { ok } from "@/lib/api/envelope";
import { withAdmin, type AdminContext } from "@/lib/auth/withAdmin";

/**
 * `GET /api/admin/me` → `{ email, isAdmin }` (plan §5 D0, re-pointed at the
 * §14.2 session cookie).
 *
 * Reaching the handler at all means `withAdmin` has a session gtwy-node itself
 * granted — and, if it had gone past its revalidation window, that gtwy-node has
 * just granted again. So `isAdmin` is true by construction: a non-operator never
 * gets here, they get the 403 envelope.
 *
 * The shell calls this on mount for the address in the sidebar: 401 → `/login`,
 * 403 → `/unauthorized`.
 *
 * `authSource` says whether this request rode an unexpired session or re-asked
 * gtwy-node. It is operational detail for this console's own operators, not a
 * secret — and it is emphatically **not** the JWT, which never leaves the
 * server (§14.2).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withAdmin(async (_req: NextRequest, ctx: AdminContext) =>
  ok({
    email: ctx.email,
    isAdmin: true,
    authSource: ctx.source,
  }),
);
