import { WorkspaceDetail } from "./workspace-detail";

/**
 * The workspace universe is msg91's live company list (plan §4.1) and a
 * workspace's own page changes whenever its traffic does, so this route is
 * rendered on request. `generateStaticParams` and `dynamicParams = false` are
 * gone with the fixture they enumerated; an unknown org is now the API's
 * `not_found`, which `WorkspaceDetail` turns into the same 404 this route
 * always returned.
 */
export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  return <WorkspaceDetail orgId={orgId} />;
}
