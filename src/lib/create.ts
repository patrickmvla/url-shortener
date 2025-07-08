import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sendNotification } from "./notification";
import { getExistingKeyForLink, generateKey } from "./key";
import { checkRateLimit, setRateLimit } from "./rateLimits";

// interface CloudflareEnv {
//   LINKS: KVNamespace;
//   RESERVE_LINKS: KVNamespace;
//   LIMITS: KVNamespace;
//   DISCORD_WEBHOOK?: string;
// }

// interface CloudflareCOntent {
//   env: CloudflareEnv;
//   cf: {
//     country: string;
//     city: string;
//   };
// }

export async function create(
  link: string,
  ip: string,
  rayId: string,
  length = 5
) {
  const timeA = Date.now();

  const { env, cf } = getCloudflareContext();

  //   const cloudflareContext =
  //     (await getCloudflareContext()) as unknown as CloudflareCOntent;

  const linkKeyValueStore = env.LINKS;
  const reserveLinkKeyValueStore = env.RESERVE_LINKS;
  const limitKeyValueStore = env.LIMITS;

  if (!linkKeyValueStore) {
    throw new Error("Missing KV Namespace: LINKS do not exist");
  }
  if (!reserveLinkKeyValueStore) {
    throw new Error("Missing KV Namespace: REVERSE_LINKS do not exist");
  }
  if (!limitKeyValueStore) {
    throw new Error("Missing KV Namespace: LIMITS do not exist");
  }

  if (!(await checkRateLimit(ip, limitKeyValueStore))) {
    return {
      error: "Rate limited",
    };
  }

  const existingLink = await getExistingKeyForLink(link, reserveLinkKeyValueStore);

  if (existingLink) {
    await sendNotification(
      env.DISCORD_WEBHOOK,
      "Link Created",
      "An existing link has been requested",
      [
        {
          name: "🔗 Link",
          value: `📥 \`${link}\`\n📤 \`${existingLink}\``,
          inline: true,
        },
        {
          name: "🔎 Context",
          value: `🌍 \`${cf?.country}\` / \`${cf?.city}\`\n🔦 \`${rayId}\``,
          inline: true,
        },
      ],
      `⏱️ ${Date.now() - timeA}ms`,
      16769859
    );

    return { key: existingLink };
  }

  const key = await generateKey(length, linkKeyValueStore);

  try {
    await Promise.all([
      linkKeyValueStore.put(key, link),
      reserveLinkKeyValueStore.put(link, key),
      setRateLimit(ip, limitKeyValueStore),
    ]);
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to create link",
    };
  }

  await sendNotification(
    env.DISCORD_WEBHOOK,
    "Link Created",
    "A new link has been created",
    [
      {
        name: "🔗 Link",
        value: `📥 \`${link}\`\n📤 \`${key}\``,
        inline: true,
      },
      {
        name: "🔎 Context",
        value: `🌍 \`${cf?.country}\` / \`${cf?.city}\`\n🔦 \`${rayId}\``,
        inline: true,
      },
    ],
    `${Date.now() - timeA}`
  );
  return {
    key: key,
  };
}
