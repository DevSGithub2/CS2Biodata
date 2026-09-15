import crypto from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function steamIdToCsFriendCode(steamId64: string): string {
  if (!steamId64 || steamId64.length < 16) return "—";
  try {
    const steamId = BigInt(steamId64);
    const accountId = Number(steamId & BigInt(0xffffffff));

    // MD5 of "CSGO\0\0\0\0" combined with AccountId (Little Endian)
    const buf = Buffer.alloc(8);
    buf.writeUInt32LE(accountId, 0);
    buf.write("CSGO", 4, "ascii");

    const hash = crypto.createHash("md5").update(buf).digest();
    const hashInt = hash.readUInt32LE(0);

    // Interleave bits of accountId and hashInt into a 64-bit value
    let r = 0n;
    let acc = BigInt(accountId);
    for (let i = 0; i < 8; i++) {
      const idNibble = acc & 0xfn;
      acc >>= 4n;
      const hashBit = BigInt((hashInt >> i) & 1);

      r = (r << 4n) | idNibble;
      r = (r << 1n) | hashBit;
    }

    // Encode into base-32 alphabet
    let code = "";
    for (let i = 0; i < 13; i++) {
      const idx = Number(r & 0x1fn);
      code += ALPHABET[idx];
      r >>= 5n;
    }

    // Reverse and format as AAAAA-BBBB (dropping leading padding AAAA-)
    const clean = code.split("").reverse().join("").replace(/^A+/, "");
    if (clean.length >= 8) {
      return `${clean.slice(0, clean.length - 4)}-${clean.slice(clean.length - 4)}`;
    }
    return clean || "—";
  } catch {
    return "—";
  }
}
