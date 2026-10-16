"use client";

import * as React from "react";

/**
 * The header search box, made real (plan §4.5 Q20).
 *
 * The box lives in the chrome and the list it filters lives in a page, so the
 * two need somewhere to meet. A context is that somewhere and it renders no DOM
 * of its own — the header's markup and the page's markup are byte-for-byte what
 * they were; only the `value` behind the input changed hands.
 *
 * Scope is deliberately narrow: **org id and org name**, matched server-side by
 * `GET /api/admin/workspaces`. Member-e-mail search needs a user fetch per org
 * and is plan §9 gap 11, out of scope for v1.
 */

interface HeaderSearch {
  q: string;
  setQ: (value: string) => void;
}

const HeaderSearchContext = React.createContext<HeaderSearch>({
  q: "",
  setQ: () => {},
});

export function HeaderSearchProvider({
  value,
  children,
}: {
  value: HeaderSearch;
  children: React.ReactNode;
}) {
  return <HeaderSearchContext.Provider value={value}>{children}</HeaderSearchContext.Provider>;
}

export function useHeaderSearch(): HeaderSearch {
  return React.useContext(HeaderSearchContext);
}

/**
 * The query, settled.
 *
 * Every keystroke is a request otherwise, and the list behind this one costs a
 * Mongo aggregate and up to 25 msg91 lookups. 250 ms is below the threshold at
 * which typing feels laggy and above the interval between keystrokes.
 */
export function useDebounced<T>(value: T, delayMs = 250): T {
  const [settled, setSettled] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return settled;
}
