import * as React from "react";
import { connection } from "next/server";
import { env } from "@/lib/env";
import { LoginScreen } from "./login-screen";

/**
 * Server half of the login route. It exists to read the msg91 widget's
 * reference id from the environment at request time and pass it down, rather
 * than letting the client bundle inline it at build time — see
 * `env.msg91WidgetReferenceId`.
 */
export default async function LoginPage() {
  // Opt out of prerendering, or the build would bake in whatever the
  // environment held then — the very problem this page exists to avoid.
  await connection();
  const referenceId = env.msg91WidgetReferenceId() ?? "";

  // `useSearchParams` in the screen needs a Suspense boundary.
  return (
    <React.Suspense fallback={null}>
      <LoginScreen referenceId={referenceId} />
    </React.Suspense>
  );
}
