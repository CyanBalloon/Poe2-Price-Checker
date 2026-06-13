import { Host } from "./IPC";

const CACHE_KEY = "exchanged-dynamic-icons";
let cache: Record<string, string> = {};
try {
  cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  // Clear out any previously saved 404s from permanent storage
  let needsSave = false;
  for (const key of Object.keys(cache)) {
    if (cache[key] === "404") {
      delete cache[key];
      needsSave = true;
    }
  }
  if (needsSave) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }
} catch (e) {
  cache = {};
}

interface FetchRequest {
  itemName: string;
  namespace: string;
  resolve: (url: string | null) => void;
}

const queue: FetchRequest[] = [];
let isProcessing = false;

function saveCache() {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function getDynamicIcon(itemName: string, namespace: string): Promise<string | null> {
  if (cache[itemName]) {
    return cache[itemName] === "404" ? null : cache[itemName];
  }

  return new Promise((resolve) => {
    // Avoid duplicate queue entries
    const existing = queue.find(q => q.itemName === itemName);
    if (existing) {
      const oldResolve = existing.resolve;
      existing.resolve = (url) => {
        oldResolve(url);
        resolve(url);
      };
    } else {
      queue.push({ itemName, namespace, resolve });
      processQueue();
    }
  });
}

async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  while (queue.length > 0) {
    const req = queue.shift()!;
    
    // Check if another request fetched it while it was in queue
    if (cache[req.itemName]) {
      req.resolve(cache[req.itemName] === "404" ? null : cache[req.itemName]);
      continue;
    }

    try {
      const url = await fetchIconFromTradeApi(req.itemName, req.namespace);
      if (url) {
        cache[req.itemName] = url;
        saveCache();
        req.resolve(url);
      } else {
        // Cache misses as "404" so we don't spam the API for impossible items
        cache[req.itemName] = "404";
        // Do NOT saveCache() for 404s, so it tries again on next app start
        req.resolve(null);
      }
    } catch (e) {
      console.warn("Dynamic image fetch failed for", req.itemName, e);
      req.resolve(null);
    }

    // Wait 1.5 seconds between requests to avoid strict rate limits
    if (queue.length > 0) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  isProcessing = false;
}

async function fetchIconFromTradeApi(itemName: string, namespace: string): Promise<string | null> {
  const query: Record<string, any> = {
    status: { option: "any" },
    stats: [{ type: "and", filters: [] }]
  };

  if (namespace === "UNIQUE") {
    query.name = itemName;
  } else {
    query.type = itemName;
  }

  const payload = {
    query,
    sort: { price: "asc" }
  };

  const searchRes = await Host.proxy("www.pathofexile.com/api/trade2/search/poe2/Standard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Poe2PriceChecker/1.0"
    },
    body: JSON.stringify(payload)
  });

  if (!searchRes.ok) {
    if (searchRes.status === 429) {
      console.warn("Trade API rate limit hit!");
      // Sleep extra if rate limited
      await new Promise(r => setTimeout(r, 5000));
    }
    return null;
  }

  const searchData = await searchRes.json();
  if (!searchData.result || searchData.result.length === 0) {
    return null;
  }

  const fetchId = searchData.result[0];
  const queryId = searchData.id;

  const fetchRes = await Host.proxy(`www.pathofexile.com/api/trade2/fetch/${fetchId}?query=${queryId}`, {
    method: "GET",
    headers: {
      "User-Agent": "Poe2PriceChecker/1.0"
    }
  });

  if (!fetchRes.ok) return null;

  const fetchData = await fetchRes.json();
  const itemData = fetchData.result?.[0]?.item;
  return itemData?.icon || null;
}
