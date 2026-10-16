import { NextResponse } from "next/server";

/**
 * The plan §1.4 envelope. Every `/api/admin/*` route returns one of these two
 * shapes and nothing else.
 *
 *   200      { success: true,  data: <payload> }
 *   4xx/5xx  { success: false, error: { code, message } }
 */

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "upstream_unavailable"
  | "bad_request"
  | "internal";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: { code: ApiErrorCode; message: string };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

const STATUS: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  bad_request: 400,
  upstream_unavailable: 503,
  internal: 500,
};

/**
 * The message a client is allowed to see for each code.
 *
 * Upstream provider errors are logged server-side and never echoed — the rule
 * gtwy-node's `billing.controller.js#fail` already follows.
 */
const SAFE_MESSAGE: Record<ApiErrorCode, string> = {
  unauthorized: "Not signed in.",
  forbidden: "You are not authorised for this console.",
  not_found: "Not found.",
  bad_request: "The request was not valid.",
  upstream_unavailable: "An upstream service is unavailable. Try again shortly.",
  internal: "Something went wrong.",
};

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true as const, data }, { status: 200, ...init });
}

export function fail(code: ApiErrorCode, message?: string): NextResponse<ApiFailure> {
  return NextResponse.json(
    { success: false as const, error: { code, message: message ?? SAFE_MESSAGE[code] } },
    { status: STATUS[code] },
  );
}

/**
 * Thrown anywhere under a route handler; `withAdmin` turns it into the envelope.
 * `cause` is logged server-side and never reaches the client.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly safeMessage: string | undefined;

  constructor(code: ApiErrorCode, message?: string, options?: { cause?: unknown }) {
    super(message ?? SAFE_MESSAGE[code], options);
    this.name = "ApiError";
    this.code = code;
    this.safeMessage = message;
  }
}

/** An upstream (msg91 / Lago / gtwy-node / SQL) failure, logged with detail. */
export function upstream(source: string, cause: unknown): ApiError {
  console.error(`[admin-api] upstream failure: ${source}`, cause);
  return new ApiError("upstream_unavailable", undefined, { cause });
}

export { SAFE_MESSAGE, STATUS };
