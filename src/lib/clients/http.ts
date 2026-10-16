import "server-only";

/**
 * One `fetch` for every outbound call: hard timeout, JSON in, JSON out, and an
 * error that carries the upstream detail for the server log without letting it
 * reach the browser.
 */

export class UpstreamError extends Error {
  readonly status: number | null;
  readonly source: string;

  constructor(source: string, status: number | null, message: string, options?: { cause?: unknown }) {
    super(`${source}: ${message}`, options);
    this.name = "UpstreamError";
    this.source = source;
    this.status = status;
  }
}

export interface HttpOptions {
  /** Label used in server-side logs and error messages. */
  source: string;
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  timeoutMs: number;
  /** Status codes to resolve as `null` rather than throw. Default: none. */
  nullOn?: number[];
}

function withQuery(url: string, query: HttpOptions["query"]): string {
  if (!query) return url;
  const u = new URL(url);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    u.searchParams.set(key, String(value));
  }
  return u.toString();
}

export async function httpJson<T>(url: string, options: HttpOptions): Promise<T> {
  const { source, method = "GET", headers = {}, query, body, timeoutMs, nullOn = [] } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(withQuery(url, query), {
      method,
      headers: body === undefined ? headers : { "Content-Type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (cause) {
    const aborted = cause instanceof Error && cause.name === "AbortError";
    throw new UpstreamError(source, null, aborted ? `timed out after ${timeoutMs}ms` : "network failure", { cause });
  } finally {
    clearTimeout(timer);
  }

  if (nullOn.includes(response.status)) return null as T;

  const text = await response.text();

  if (!response.ok) {
    // The upstream body goes into the server log via the thrown message, never
    // into a client response — callers surface `upstream_unavailable` instead.
    throw new UpstreamError(source, response.status, `HTTP ${response.status} ${text.slice(0, 500)}`);
  }

  if (text === "") return null as T;

  try {
    return JSON.parse(text) as T;
  } catch (cause) {
    throw new UpstreamError(source, response.status, "response was not JSON", { cause });
  }
}

/**
 * Like `httpJson`, but hands back the raw status and parsed body instead of
 * throwing on a non-2xx. Used by the gtwy-node proxy (plan §3), where an
 * upstream 403 must be relayed as our 403 rather than masked.
 */
export async function httpRaw(
  url: string,
  options: HttpOptions,
): Promise<{ status: number; body: unknown }> {
  const { source, method = "GET", headers = {}, query, body, timeoutMs } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(withQuery(url, query), {
      method,
      headers: body === undefined ? headers : { "Content-Type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (cause) {
    const aborted = cause instanceof Error && cause.name === "AbortError";
    throw new UpstreamError(source, null, aborted ? `timed out after ${timeoutMs}ms` : "network failure", { cause });
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text !== "") {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }
  return { status: response.status, body: parsed };
}
