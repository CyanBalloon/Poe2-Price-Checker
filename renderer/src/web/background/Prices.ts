import { shallowRef, watch, readonly, computed } from "vue";
import { createGlobalState } from "@vueuse/core";
import { Host } from "@/web/background/IPC";
import { useLeagues } from "./Leagues";
import { AppConfig } from "../Config";
import { PriceCheckWidget } from "../overlay/widgets";
import { ITEM_BY_REF } from "@/assets/data";

export type NinjaSchema = NinjaSchemaV1;
type NinjaSchemaV1 = {
  schemaVersion: 1;
  map: Array<{
    ns: "ITEM" | "GEM" | "UNIQUE";
    cx: boolean;
    url: string;
    type: string;
  }>;
};

interface NinjaDenseExchangeInfo {
  name: string;
  variant?: string;
  primaryValue: number;
  detailsId: string;
  id: string;
  volumePrimaryValue: number;
  maxVolumeCurrency: string;
  maxVolumeRate: number;
  sparkline: {
    totalChange: number;
    data: Array<number | null>;
  };
}

interface NinjaDenseStashInfo {
  name: string;
  variant?: string;
  primaryValue: number;
  detailsId: string;
  sparkline: {
    totalChange: number;
    data: Array<number | null>;
  };
}

interface NinjaXchgRates {
  rates: Record<string, number>;
  primary: string;
  secondary: string;
}

type PriceDatabase = Array<{
  // My namespace for searching
  ns: string;
  // If db is from the currency exchange (cx)
  cx: boolean;
  // base url on ninja
  url: string;
  // json blob data
  lines: string;
}>;
const RETRY_INTERVAL_MS = 4 * 60 * 1000;
const UPDATE_INTERVAL_MS = 31 * 60 * 1000;
const INTEREST_SPAN_MS = 20 * 60 * 1000;

interface DbQuery {
  ns: string;
  name: string;
  variant?: string;
}

export interface CurrencyValue {
  min: number;
  max: number;
  currency: "chaos" | "exalted" | "div";
}

export interface CoreCurrency {
  id: "exalted" | "chaos" | "div";
  abbrev: string;
  ref: string;
  text: string;
  icon: string;
}

function getAvailableCoreCurrencies(): CoreCurrency[] {
  return [
    {
      id: "exalted",
      abbrev: "ex",
      ref: "Exalted Orb",
      text: "Exalted Orb",
      icon: "/images/exa.png",
    },
    {
      id: "chaos",
      abbrev: "c",
      ref: "Chaos Orb",
      text: "Chaos Orb",
      icon: "/images/chaos.png",
    },
  ];
}
export const DivCurrency: CoreCurrency = {
  id: "div",
  abbrev: "div",
  ref: "Divine Orb",
  text: "Divine Orb",
  icon: "/images/div.png",
};

export const usePoeninja = createGlobalState(() => {
  const leagues = useLeagues();

  const availableCoreCurrencies = shallowRef<CoreCurrency[]>([]);
  const selectedCoreCurrencyId = computed<"exalted" | "chaos">({
    get() {
      return availableCoreCurrencies.value.length
        ? AppConfig<PriceCheckWidget>("price-check")!.coreCurrency
        : "exalted";
    },
    set(id) {
      AppConfig<PriceCheckWidget>("price-check")!.coreCurrency = id;
    },
  });

  const selectedCoreCurrency = computed(() => {
    const { coreCurrency } = AppConfig<PriceCheckWidget>("price-check")!;
    if (!availableCoreCurrencies.value || !coreCurrency) return undefined;
    const listed = availableCoreCurrencies.value.find(
      (currency) => currency.id === coreCurrency,
    );
    return listed;
  });

  /**
   * core/div
   */
  const xchgRate = shallowRef<number | undefined>(undefined);
  const exaltedRate = shallowRef<number | undefined>(undefined);
  const chaosToExalt = shallowRef<number | undefined>(undefined);
  const annulToExalt = shallowRef<number | undefined>(undefined);
  /**
   * Current core currency
   */
  const xchgRateCurrency = shallowRef<"chaos" | "exalted" | undefined>(
    undefined,
  );

  const isLoading = shallowRef(false);
  let PRICES_DB: PriceDatabase = [];
  let lastUpdateTime = 0;
  let downloadController: AbortController | undefined;
  let lastInterestTime = 0;

  let SEARCH_INDEX: Array<{ name: string; ns: string }> = [];

  let priceCache = new Map<
    { ns: string; name: string; count: number },
    CurrencyValue
  >();

  async function load(force: boolean = false) {
    const league = leagues.selected.value;
    if (!league || !league.isPopular || league.realm !== "pc-ggg") return;
    if (
      !force &&
      (Date.now() - lastUpdateTime < UPDATE_INTERVAL_MS ||
        Date.now() - lastInterestTime > INTEREST_SPAN_MS)
    )
      return;
    if (downloadController) downloadController.abort();
    try {
      isLoading.value = true;
      downloadController = new AbortController();

      availableCoreCurrencies.value = getAvailableCoreCurrencies().map(
        (currency) => ({
          ...currency,
          text: ITEM_BY_REF("ITEM", currency.ref)![0].name,
        }),
      );
      const haveCurrency = availableCoreCurrencies.value.some(
        (currency) => currency.id === selectedCoreCurrencyId.value,
      );
      if (!haveCurrency) {
        selectedCoreCurrencyId.value = "exalted";
      }

      const ninjaSchema: NinjaSchema = JSON.parse(
        await Host.proxy(
          "api.exiledexchange2.dev/proxy/data/namespaceMap.json",
          {
            signal: downloadController.signal,
          },
        ).then((r) => r.text()),
      );
      const response = await Host.proxy(
        `api.exiledexchange2.dev/proxy/${selectedLeagueToUrl(true)}/overviewData.json`,
        {
          signal: downloadController.signal,
        },
      );
      const jsonBlob = await response.text();

      const ninjaXchg = parseXchg(jsonBlob);

      PRICES_DB = splitJsonBlob(jsonBlob, ninjaSchema);

      // Build SEARCH_INDEX
      try {
        const parsedBlob = JSON.parse(jsonBlob);
        SEARCH_INDEX = [];
        for (const overview of parsedBlob.itemOverviews) {
          const typeMatch = ninjaSchema.map.find((m) => m.type === overview.type);
          if (!typeMatch) continue;
          for (const item of overview.lines) {
            SEARCH_INDEX.push({
              name: item.name,
              ns: typeMatch.ns,
            });
          }
        }
      } catch (err) {
        console.warn("Failed to parse ninja JSON for search index", err);
      }

      // TODO: update to search for requested currency instead of divine
      const divineRates = ninjaXchg.rates;
      const preferred = selectedCoreCurrency.value;

      if (divineRates && divineRates.exalted) {
        exaltedRate.value = divineRates.exalted;
      }

      if (divineRates && Object.values(divineRates).some((v) => v >= 10)) {
        if (
          preferred &&
          preferred.id !== "div" &&
          divineRates[preferred.id] >= 5
        ) {
          xchgRate.value = divineRates[preferred.id];
          xchgRateCurrency.value = preferred.id;
        } else {
          xchgRate.value = divineRates.exalted;
          xchgRateCurrency.value = "exalted";
        }
      }

      if (divineRates && divineRates.exalted && divineRates.chaos) {
        chaosToExalt.value = divineRates.exalted / divineRates.chaos;
      } else {
        chaosToExalt.value = undefined;
      }

      const annulPrice = findPriceByQuery({ ns: "ITEM", name: "Orb of Annulment" });
      if (annulPrice && divineRates && divineRates.exalted) {
        annulToExalt.value = annulPrice.primaryValue * divineRates.exalted;
      } else {
        annulToExalt.value = undefined;
      }

      // Clear cache
      priceCache = new Map<
        { ns: string; name: string; count: number },
        CurrencyValue
      >();

      lastUpdateTime = Date.now();
    } catch (e) {
      console.warn(e);
    } finally {
      isLoading.value = false;
    }
  }

  function queuePricesFetch() {
    lastInterestTime = Date.now();
    load();
  }

  function selectedLeagueToUrl(proxy: boolean): string {
    const league = leagues.selectedId.value!;
    if (proxy) {
      switch (league) {
        case "Standard":
          return "standard";
        case "Hardcore":
          return "hardcore";
      }
      if (league.startsWith("HC ")) {
        return "leaguehc";
      }
      return "league";
    } else {
      return league.toLowerCase().replace(/\s+/g, '');
    }
  }

  function findPriceByQuery(query: DbQuery) {
    // NOTE: order of keys is important
    const searchString = JSON.stringify({
      name: query.name,
      variant: query.variant,
      primaryValue: 0,
    }).replace(":0}", ":");
    const endSearchString = "}}";

    for (const { ns, cx, url, lines } of PRICES_DB) {
      if (ns !== query.ns) continue;

      const startPos = lines.indexOf(searchString);
      if (startPos === -1) continue;
      const endPos = lines.indexOf(endSearchString, startPos);

      const info: NinjaDenseExchangeInfo | NinjaDenseStashInfo = JSON.parse(
        lines.slice(startPos, endPos + endSearchString.length),
      );

      return {
        ...info,
        cx,
        url: `https://poe.ninja/poe2/economy/${selectedLeagueToUrl(false)}/${url}/${info.detailsId}`,
      };
    }
    return null;
  }

  function searchNinjaItems(search: string) {
    if (search.length < 3) return [];
    const lcSearch = search
      .toLowerCase()
      .split(/\s+/)
      .sort((a, b) => b.length - a.length);
    const lcLongestWord = lcSearch[0];
    const MAX_RESULTS = 50;
    const out = [];

    for (const item of SEARCH_INDEX) {
      const lcName = item.name.toLowerCase();
      if (
        lcSearch.every((part) => lcName.includes(part)) &&
        (AppConfig().language === "cmn-Hant" ||
          lcName.split(/\s+/).some((part) => part.startsWith(lcLongestWord)))
      ) {
        out.push(item);
        if (out.length >= MAX_RESULTS) break;
      }
    }
    return out;
  }

  /**
   * Converts item value from divines to current core currency
   * @param value item value in divines
   * @returns Value in core currency or div
   */
  function autoCurrency(
    value: number | [number, number],
    coreOnly: boolean = false,
    forceCurrency?: "exalted" | "chaos" | "div",
  ): CurrencyValue {
    if (forceCurrency === "exalted") {
      const rate = exaltedRate.value || 9999;
      if (Array.isArray(value)) {
        return {
          min: value[0] * rate,
          max: value[1] * rate,
          currency: "exalted",
        };
      }
      return {
        min: value * rate,
        max: value * rate,
        currency: "exalted",
      };
    }
    if (Array.isArray(value)) {
      const coreValue = value.map(divineToCore);
      if (coreValue[0] > (xchgRate.value || 9999) && !coreOnly) {
        return {
          min: value[0],
          max: value[1],
          currency: "div",
        };
      }
      if (selectedCoreCurrency.value?.id) {
        return {
          min: coreValue[0],
          max: coreValue[1],
          currency: selectedCoreCurrency.value.id,
        };
      }
      // this should never run, assuming we have loaded a currency
      return { min: value[0], max: value[1], currency: "div" };
    }
    const coreValue = divineToCore(value);
    if (coreValue > (xchgRate.value || 9999) * 0.94 && !coreOnly) {
      if (coreValue < (xchgRate.value || 9999) * 1.06) {
        return { min: 1, max: 1, currency: "div" };
      } else {
        return {
          min: value,
          max: value,
          currency: "div",
        };
      }
    }
    if (selectedCoreCurrency.value?.id) {
      return {
        min: coreValue,
        max: coreValue,
        currency: selectedCoreCurrency.value.id,
      };
    }
    // this should never run, assuming we have loaded a currency
    return { min: value, max: value, currency: "div" };
  }

  function divineToCore(count: number) {
    return count * (xchgRate.value || 9999);
  }

  function cachedCurrencyByQuery(query: DbQuery, count: number) {
    const key = { ns: query.ns, name: query.name, count };
    if (priceCache.has(key)) {
      return priceCache.get(key)!;
    }

    const price = findPriceByQuery(query);
    if (!price) {
      return;
    }
    const currency = autoCurrency(price.primaryValue * count);
    priceCache.set(key, currency);
    return currency;
  }

  setInterval(() => {
    load();
  }, RETRY_INTERVAL_MS);

  watch(leagues.selectedId, () => {
    xchgRate.value = undefined;
    chaosToExalt.value = undefined;
    annulToExalt.value = undefined;
    PRICES_DB = [];
    load(true);
  });

  watch(selectedCoreCurrencyId, (curr, prev) => {
    if (curr === prev) return;
    xchgRateCurrency.value = curr ?? "exalted";
    xchgRate.value = undefined;
    chaosToExalt.value = undefined;
    annulToExalt.value = undefined;
    PRICES_DB = [];
    load(true);
  });

  return {
    xchgRate: readonly(xchgRate),
    xchgRateCurrency: readonly(selectedCoreCurrency),
    findPriceByQuery,
    searchNinjaItems,
    autoCurrency,
    queuePricesFetch,
    forceLoad: () => load(true),
    cachedCurrencyByQuery,
    isLoading: readonly(isLoading),
    initialLoading: () => isLoading.value && !PRICES_DB.length,
    availableCoreCurrencies: readonly(availableCoreCurrencies),
    chaosToExalt: readonly(chaosToExalt),
    annulToExalt: readonly(annulToExalt),
    exaltedRate: readonly(exaltedRate),
  };
});

function parseXchg(jsonBlob: string): NinjaXchgRates {
  const RATES = '{"rates":';
  const END_RATES = '"}';
  const startPos = jsonBlob.indexOf(RATES);
  const endPos = jsonBlob.indexOf(END_RATES, startPos) + END_RATES.length;
  return JSON.parse(jsonBlob.slice(startPos, endPos));
}

function splitJsonBlob(jsonBlob: string, schema: NinjaSchema): PriceDatabase {
  const NINJA_OVERVIEW = '{"type":"';
  if (schema.schemaVersion !== 1) {
    console.warn("Unsupported ninja schema version", schema.schemaVersion);
    return [];
  }
  const NAMESPACE_MAP: Array<{
    ns: string;
    cx: boolean;
    url: string;
    type: string;
  }> = schema.map;

  const database: PriceDatabase = [];
  let startPos = jsonBlob.indexOf(NINJA_OVERVIEW);
  if (startPos === -1) return [];

  while (true) {
    const endPos = jsonBlob.indexOf(NINJA_OVERVIEW, startPos + 1);

    const type = jsonBlob.slice(
      startPos + NINJA_OVERVIEW.length,
      jsonBlob.indexOf('"', startPos + NINJA_OVERVIEW.length),
    );
    const lines = jsonBlob.slice(
      startPos,
      endPos === -1 ? jsonBlob.length : endPos,
    );

    const isSupported = NAMESPACE_MAP.find((entry) => entry.type === type);
    if (isSupported) {
      database.push({
        ns: isSupported.ns,
        cx: isSupported.cx,
        url: isSupported.url,
        lines,
      });
    }

    if (endPos === -1) break;
    startPos = endPos;
  }
  return database;
}

export function displayRounding(
  value: number,
  _fraction: boolean = false,
  truncateLargeNumbers: boolean = false,
): string {
  if (_fraction) {
    performance.mark("displayRoundingFraction");
  }
  if (Math.abs(value) < 1) {
    if (value === 0) return "0";
    return Number(value.toFixed(2)).toString().replace(".", "\u200A.\u200A");
  }
  if (Math.abs(value) < 10) {
    return Number(value.toFixed(1)).toString().replace(".", "\u200A.\u200A");
  }
  if (truncateLargeNumbers && Math.abs(value) > 2250) {
    if (Math.abs(value) < 1_050_000) {
      // keep 1 decimal 12324 -> 12.3k
      return (
        Number((value / 1000).toFixed(1))
          .toString()
          .replace(".", "\u200A.\u200A") + "k"
      );
    }
    if (Math.abs(value) < 1_050_000_000) {
      return (
        Number((value / 1_000_000).toFixed(1))
          .toString()
          .replace(".", "\u200A.\u200A") + "m"
      );
    }
    if (Math.abs(value) < 1_050_000_000_000) {
      return (
        Number((value / 1_000_000_000).toFixed(1))
          .toString()
          .replace(".", "\u200A.\u200A") + "b"
      );
    }
    return (
      Number((value / 1_000_000_000_000).toFixed(1))
        .toString()
        .replace(".", "\u200A.\u200A") + "t"
    );
  }
  return Math.round(value).toString();
}

// Disable since this is export for tests
// eslint-disable-next-line @typescript-eslint/naming-convention
export const __testExports = {
  parseXchg,
  splitJsonBlob,
};
