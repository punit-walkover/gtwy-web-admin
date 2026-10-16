"use client";

import { useSearchParams } from "next/navigation";

export type PageState = "ready" | "loading" | "empty" | "error";

const states: PageState[] = ["ready", "loading", "empty", "error"];

/** Every page reads `?state=`. Default (no param) is `ready`. */
export function usePageState(): PageState {
  const params = useSearchParams();
  const raw = params.get("state");
  return states.includes(raw as PageState) ? (raw as PageState) : "ready";
}
