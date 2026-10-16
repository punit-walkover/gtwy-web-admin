import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev badge sits on top of the page and pollutes screenshots.
  devIndicators: false,

  /**
   * Two `next dev` servers in one checkout share `.next` and corrupt each
   * other's build — the second one's compile lands on top of the first's
   * manifest and every route starts answering `__webpack_require__.a is not a
   * function`. Phase 2 runs several verification servers side by side (D3's
   * `verify-d3.mjs`, D7's two, D11's stub), so each one sets `NEXT_DIST_DIR` to
   * a directory of its own.
   *
   * Unset — which is every real build and every ordinary `npm run dev` — this
   * is exactly Next's default.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
