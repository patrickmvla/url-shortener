interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export async function sendNotification(
  webhook: string | undefined,
  title: string,
  description: string,
  fields: EmbedField[],
  footer: string,
  color = 5424336
): Promise<void> {
  if (!webhook) return;

  await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      embeds: [
        {
          title,
          description,
          color,
          fields,
          footer: {
            timestamp: new Date().toISOString(),
            text: footer,
          },
        },
      ],
    }),
  });
}
