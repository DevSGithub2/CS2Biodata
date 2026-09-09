export interface ItemFloatData {
  floatvalue: number | null;
  paintseed: number | null;
  paintindex: number | null;
  wearCategory: string;
}

export function parseWearFromFloat(float: number): string {
  if (float < 0.07) return "Factory New";
  if (float < 0.15) return "Minimal Wear";
  if (float < 0.38) return "Field-Tested";
  if (float < 0.45) return "Well-Worn";
  return "Battle-Scarred";
}

export async function fetchInspectFloat(inspectLink: string): Promise<ItemFloatData> {
  if (!inspectLink) {
    return { floatvalue: null, paintseed: null, paintindex: null, wearCategory: "Unknown" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`https://api.csfloat.com/?url=${encodeURIComponent(inspectLink)}`, {
      headers: {
        "User-Agent": "cs2biodata-engine/1.0"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const itemInfo = data.iteminfo;
      if (itemInfo && typeof itemInfo.floatvalue === "number") {
        return {
          floatvalue: Number(itemInfo.floatvalue.toFixed(6)),
          paintseed: itemInfo.paintseed ?? null,
          paintindex: itemInfo.paintindex ?? null,
          wearCategory: parseWearFromFloat(itemInfo.floatvalue)
        };
      }
    }
  } catch {
    // Graceful fallback to prevent latency spikes
  }

  return { floatvalue: null, paintseed: null, paintindex: null, wearCategory: "Standard" };
}
