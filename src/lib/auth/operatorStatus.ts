/**
 * "Is this account a platform operator?" — answered by gtwy-node, never here.
 *
 * Ported from `GTWY-admin/utils/operatorStatus.mjs`, whose table was **observed
 * against a live gtwy-node** and written down in
 * `GTWY-admin/docs/gtwy-node-auth-contract.md`. It is evidence, not inference,
 * so it is reused rather than re-derived.
 *
 * The one call that answers it — `gtwy-node@5e3ab6c`, `internalOrgs.routes.js:11`,
 * behind `middleware` + `InternalAuth`, controller comment *"Lets the dashboard
 * check a token before showing anything."*:
 *
 *   GET /api/internal-orgs/access   Authorization: <jwt>   (bare — no `Bearer `)
 *     200 { success: true, data: { allowed: true, email } }   operator
 *     403                                                     valid session, declined
 *     401                                                     token rejected
 *     404                                                     this gtwy-node predates 5e3ab6c
 *
 * **There is no allowlist in this file, or anywhere else on the decision path.**
 * The work e-mail typed on the login screen is a hint passed to msg91 and a
 * string to render in a rejection; it is never compared against anything
 * locally. The operator list lives only in gtwy-node's `INTERNAL_ALLOWED_EMAILS`
 * (plan §14.2).
 *
 * `GTWY-admin`'s pre-`5e3ab6c` two-call fallback (`classifyLegacyOperatorProbe`)
 * is **not** ported. §14.2 rules that a 404 is reported as
 * `503 upstream_unavailable`, because inferring operator status off a *billing*
 * endpoint is this console reading identity from something that is not an
 * identity source.
 *
 * Dependency-free and server-agnostic so `tests/session.test.ts` can drive the
 * same decision the route makes without a network.
 */

export const OPERATOR_STATUS = {
  /** The gate passed. Set the session. */
  OPERATOR: "operator",
  /** Session is valid; the e-mail is not on gtwy-node's `INTERNAL_ALLOWED_EMAILS`. */
  NOT_OPERATOR: "not_operator",
  /**
   * The session is valid but carries no e-mail at all, so `InternalAuth` can
   * never pass. Held apart from NOT_OPERATOR because the two have different
   * causes and completely different fixes: this one is a platform defect
   * wearing a permission answer's clothes, not a real person being declined.
   */
  NO_EMAIL_IN_TOKEN: "no_email_in_token",
  /** The token gate itself said no. Re-authenticate. */
  TOKEN_REJECTED: "token_rejected",
  /** The whole `/api/internal-orgs` router is absent — gtwy-node predates `5e3ab6c`. */
  ROUTE_ABSENT: "route_absent",
  /** gtwy-node answered with nothing we know how to read as a verdict. */
  INDETERMINATE: "indeterminate",
} as const;

export type OperatorStatus = (typeof OPERATOR_STATUS)[keyof typeof OPERATOR_STATUS];

/**
 * `InternalAuth` (`middleware.js:344`) refuses for two unrelated reasons and
 * says which in the body:
 *
 *   "Access denied: email not found in token"            → token shape
 *   "Access denied: you are not authorized for this…"    → allowlist
 *
 * Matched loosely, and on the *cause* rather than the whole sentence, so a
 * reworded message degrades to NOT_OPERATOR — the answer that is right far more
 * often — instead of throwing. Note what this is not: it is not an allowlist
 * check, and nothing about *which* address is involved is read here.
 */
function blamesAMissingEmail(message: unknown): boolean {
  return /email not found/i.test(String(message ?? ""));
}

export interface AccessProbe {
  status: number;
  /** `data.allowed` off a 200 body. */
  allowed?: boolean | null;
  /** `data.email` off a 200 body. */
  email?: string | null;
  /** `message` off a non-200 body. */
  message?: string | null;
}

/** Turn the single `GET /api/internal-orgs/access` response into a verdict. */
export function classifyAccessProbe({ status, allowed, email, message }: AccessProbe): OperatorStatus {
  if (status === 401) return OPERATOR_STATUS.TOKEN_REJECTED;

  // The gate refused. Which of its two refusals it was decides whether this is
  // a permission answer to render or a platform bug to report.
  if (status === 403) {
    return blamesAMissingEmail(message) ? OPERATOR_STATUS.NO_EMAIL_IN_TOKEN : OPERATOR_STATUS.NOT_OPERATOR;
  }

  if (status === 404) return OPERATOR_STATUS.ROUTE_ABSENT;

  if (status === 200) {
    // Defensive, and deliberately ahead of the e-mail check: today the
    // controller hard-codes `allowed: true` and lets `InternalAuth` do the
    // refusing, but a field named `allowed` saying `false` could only ever mean
    // one thing, and reading it as a yes would be a security bug.
    if (allowed === false) return OPERATOR_STATUS.NOT_OPERATOR;

    // `email: req.profile?.user?.email ?? null`. Reachable only if a future
    // gtwy-node lets a no-email token past `InternalAuth`; kept because the day
    // it does, "no e-mail" must not read as "operator".
    if (!email) return OPERATOR_STATUS.NO_EMAIL_IN_TOKEN;

    return OPERATOR_STATUS.OPERATOR;
  }

  return OPERATOR_STATUS.INDETERMINATE;
}

/**
 * Which of the two "platform lost the e-mail" shapes this was, so the server
 * log distinguishes them. Both classify as NO_EMAIL_IN_TOKEN and both return
 * 403 on the wire; only the log says which side produced it.
 */
export function missingEmailShape(probe: AccessProbe): "403_from_internal_auth" | "200_with_null_email" | null {
  if (probe.status === 403 && blamesAMissingEmail(probe.message)) return "403_from_internal_auth";
  if (probe.status === 200 && probe.allowed !== false && !probe.email) return "200_with_null_email";
  return null;
}

/**
 * The refusal copy, verbatim, in one place so the login screen and the 403 page
 * cannot drift apart. Ported from GTWY-admin.
 */
export function notOnAllowlistMessage(email: string): string {
  return email
    ? `${email} is not on the internal allowlist. Access is invite-only.`
    : "This account is not on the internal allowlist. Access is invite-only.";
}

/**
 * Why an empty e-mail is worth surfacing rather than silently folding into "not
 * an operator": the session JWT is minted by msg91, outside gtwy-node, so
 * nothing in either repo can promise it carries `user.email`. If it does not,
 * every operator is locked out identically and the console is unusable — which
 * is a platform bug to report, not a permission answer to render. The wording
 * says what was observed and does not guess which.
 *
 * It names no gtwy-node internals: no route, no middleware, no claim name.
 */
export function missingEmailMessage(): string {
  return (
    "Your sign-in worked, but the platform did not attach an e-mail address to " +
    "the session, so the operator check can never pass. This is a platform " +
    "problem rather than a permissions one — report it to the platform team."
  );
}
