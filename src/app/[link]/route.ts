import { getKey } from "@/lib/key";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// interface CloudflareContext {
//   env: {
//     LINKS: KVNamespace;
//   };
// }

export async function GET(
  request: Request,
  { params }: { params: Promise<{ link: string }> }
) {
  const availableParams = await params;

  //   const cloudflareContext =
  //     (await getCloudflareContext()) as unknown as CloudflareContext;

  const { env } = getCloudflareContext();

  const linkKeyValueStore: KVNamespace = env.LINKS;

  if (!linkKeyValueStore) {
    throw new Error("Missing KV Namespace: LINKS do not exist");
  }

  const link = await getKey(availableParams.link, linkKeyValueStore);

  if (link && (link.startsWith("http://") || link.startsWith("https://"))) {
    return Response.redirect(link, 301);
  }

  return Response.redirect(new URL("/?error=not_found", request.url));
}
