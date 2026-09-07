// BigInt decoder for CS2 Match Share Codes (CSGO-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX)
const DICTIONARY = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789";
const DICT_LEN = BigInt(DICTIONARY.length);

export interface DecodedShareCode {
  matchId: string;
  outcomeId: string;
  tokenId: number;
}

export function decodeMatchShareCode(shareCode: string): DecodedShareCode | null {
  try {
    if (!shareCode || typeof shareCode !== "string") return null;
    const cleaned = shareCode.replace(/^CSGO-/, "").replace(/-/g, "").trim();
    if (cleaned.length !== 25) return null;

    let total = BigInt(0);
    for (let i = cleaned.length - 1; i >= 0; i--) {
      const char = cleaned[i];
      const index = BigInt(DICTIONARY.indexOf(char));
      if (index === BigInt(-1)) return null;
      total = total * DICT_LEN + index;
    }

    // Extract matchId (64-bit), outcomeId (64-bit), tokenId (16-bit)
    const matchId = (total & BigInt("0xFFFFFFFFFFFFFFFF")).toString();
    const outcomeId = ((total >> BigInt(64)) & BigInt("0xFFFFFFFFFFFFFFFF")).toString();
    const tokenId = Number((total >> BigInt(128)) & BigInt("0xFFFF"));

    return { matchId, outcomeId, tokenId };
  } catch (err) {
    console.error("Failed to decode share code:", err);
    return null;
  }
}


