const DICTIONARY = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789";

export interface DecodedMatchCode {
  matchId: string;
  outcomeId: string;
  tokenId: number;
}

export function decodeShareCode(shareCode: string): DecodedMatchCode | null {
  const clean = shareCode.trim().replace(/^CSGO-/, "").replace(/-/g, "");
  if (clean.length !== 25) return null;

  try {
    let bigNumber = 0n;
    for (let i = clean.length - 1; i >= 0; i--) {
      const char = clean[i];
      const index = DICTIONARY.indexOf(char);
      if (index === -1) return null;
      bigNumber = bigNumber * 57n + BigInt(index);
    }

    // Convert BigInt to a 18-byte buffer (little endian)
    const hex = bigNumber.toString(16).padStart(36, "0");
    const bytes = Buffer.from(hex, "hex").reverse();

    const matchId = bytes.readBigUInt64LE(0).toString();
    const outcomeId = bytes.readBigUInt64LE(8).toString();
    const tokenId = bytes.readUInt16LE(16);

    return { matchId, outcomeId, tokenId };
  } catch {
    return null;
  }
}
