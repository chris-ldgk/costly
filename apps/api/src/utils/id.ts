export function randomHex(bytes = 16) {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(bytes))).toString(
    "hex",
  );
}

export function generateDbId(prefix: string) {
  return `${prefix}_${Date.now()}_${randomHex()}`;
}
