"use client";

import * as React from "react";

import { usePageState, type PageState } from "@/hooks/usePageState";
import { AdminFetchError } from "@/lib/data/client";

/**
 * The one hook each page converted from a module-scope `get*()` call uses
 * (plan §1.3, §7).
 *
 * It does two jobs and no others:
 *
 *  1. Runs the loader on mount and reports `loading | ready | empty | error`,
 *     which the page hands straight to its existing `PageStateBoundary`.
 *  2. Keeps the `?state=loading|empty|error` harness working (plan §4.5 Q47).
 *     When the query parameter is set it wins outright and the loader is not
 *     run — QA exercises the three branches without touching a database.
 *
 * Rendered markup is unaffected: the page's own JSX and its three boundary
 * branches are exactly what they were, driven from here instead of from a
 * module-scope constant.
 */

export interface RemoteData<T> {
  state: PageState;
  data: T | undefined;
  error: AdminFetchError | Error | undefined;
}

export interface RemoteDataOptions<T> {
  /** Called with the forced state's placeholder so the page still type-checks. */
  placeholder?: T;
  /** Treat a successful-but-empty payload as the `empty` branch. Default: never. */
  isEmpty?: (data: T) => boolean;
}

export function useRemoteData<T>(
  load: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList,
  options: RemoteDataOptions<T> = {},
): RemoteData<T> {
  const forced = usePageState();
  const { placeholder, isEmpty } = options;

  const [result, setResult] = React.useState<RemoteData<T>>({
    state: "loading",
    data: undefined,
    error: undefined,
  });

  // `load` is typically an inline arrow; `deps` is what the caller says varies.
  const loadRef = React.useRef(load);
  loadRef.current = load;

  React.useEffect(() => {
    if (forced !== "ready") return;

    const controller = new AbortController();
    setResult({ state: "loading", data: undefined, error: undefined });

    loadRef
      .current(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult({
          state: isEmpty?.(data) ? "empty" : "ready",
          data,
          error: undefined,
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          state: "error",
          data: undefined,
          error: err instanceof Error ? err : new Error("Request failed"),
        });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forced, ...deps]);

  if (forced !== "ready") {
    return { state: forced, data: placeholder, error: undefined };
  }

  return result;
}
