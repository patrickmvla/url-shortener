export async function setRateLimit(ip: string, limitValueStore: KVNamespace) {
  await limitValueStore.put(ip, "1", {
    expirationTtl: 5,
  });
}

export async function checkRateLimit(
  ip: string,
  limitKeyValueStore: KVNamespace
): Promise<boolean> {
  const isCUrrentlyLimited = (await limitKeyValueStore.get(ip)) !== null;

  //   if (limit != null) {
  //     if (parseInt(limit) > Date.now() - 5000) {
  //       return false;
  //     }
  //   }

  return isCUrrentlyLimited;
}
