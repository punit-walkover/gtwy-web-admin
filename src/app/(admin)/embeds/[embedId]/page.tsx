import { EmbedDetail } from "./embed-detail";

/**
 * Rendered on request, not prerendered.
 *
 * The prototype's `generateStaticParams` + `dynamicParams = false` enumerated a
 * fixed set of six mock folders. The live `folders` collection holds hundreds of
 * embeds and their config changes, so there is no set to enumerate and a
 * prerendered page would serve a stale config panel. `EmbedDetail` fetches on
 * mount and an unknown folder gets the 404 the route always returned — it now
 * comes from the API's `not_found` rather than from a lookup in a literal.
 */
export const dynamic = "force-dynamic";

export default async function EmbedDetailPage({
  params,
}: {
  params: Promise<{ embedId: string }>;
}) {
  const { embedId } = await params;
  return <EmbedDetail embedId={embedId} />;
}
