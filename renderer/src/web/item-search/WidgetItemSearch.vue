<template>
  <div v-if="isStandalone" class="flex-1 flex flex-col w-full h-full bg-transparent overflow-y-auto custom-scrollbar p-8">
    <div class="w-full flex flex-col gap-8 mt-2 mb-16">
      
      <!-- Hero Header -->
      <div class="text-center flex flex-col items-center select-none">
        <h1 class="text-3xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 mb-2 drop-shadow-sm">Item Search</h1>
        <p class="text-gray-500 text-sm">Search the compendium of Wraeclast for any base item, unique, or gem.</p>
      </div>
      
      <!-- Standalone Starred Items -->
      <transition-group
        v-if="starred.length"
        tag="div"
        :enter-active-class="$style.starredItemEnter"
        class="flex flex-wrap justify-center gap-4"
      >
        <button
          v-for="item in starred"
          :key="item.info.refName + (item.discr || '')"
          @click="starredItemClick($event, item)"
          class="flex items-center gap-5 bg-[#0d0e12]/80 hover:bg-[#151722] border border-[#191b22] hover:border-violet-500/60 rounded-3xl p-5 transition-all group cursor-pointer shadow-2xl w-[26rem] backdrop-blur-md"
        >
          <div class="w-16 h-16 flex items-center justify-center bg-[#07080a] border border-[#202334] rounded-2xl shrink-0 overflow-hidden group-hover:border-violet-500/40 transition-colors shadow-inner">
            <UiItemImg
              :icon="item.info.icon || '%NOT_FOUND%'"
              :item-name="item.info.name"
              :namespace="item.info.namespace"
              class="max-w-[75%] max-h-[75%] object-contain drop-shadow-lg transform group-hover:scale-110 transition-transform"
            />
          </div>
          <div class="flex flex-col text-left min-w-0 flex-1 justify-center gap-1">
            <div class="text-sm font-bold text-gray-200 truncate">{{ item.info.name }}</div>
            <div class="flex items-center gap-2">
              <span v-if="item.price" class="text-xs font-semibold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20 truncate">{{ formatPrice(item.price) }}</span>
              <span v-if="item.price && item.price.currency === 'div' && exaltedRate" class="flex items-center gap-1 text-xs font-semibold text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded border border-violet-400/20 truncate">
                {{ Math.round(item.price.min * exaltedRate) }} <img src="/images/exa.png" class="w-3.5 h-3.5 inline-block opacity-90" />
              </span>
              <span class="text-xs text-gray-500 truncate">{{ item.discr ? t(item.discr) : item.info.namespace === 'GEM' ? 'Skill Gem' : item.info.namespace === 'UNIQUE' ? 'Unique' : 'Base Item' }}</span>
            </div>
          </div>
          <div v-if="item.ninjaUrl" class="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#151722] border border-[#202334] group-hover:bg-violet-600 group-hover:border-violet-500 transition-colors shadow-sm">
            <i class="fas fa-external-link-alt text-[10px] text-gray-400 group-hover:text-white transition-colors"></i>
          </div>
        </button>
      </transition-group>

      <!-- Search Section -->
      <div class="flex flex-col w-full flex-1">
        
        <!-- Search Bar -->
        <div class="flex items-center gap-4 py-4">
          <div class="relative flex-1">
            <i class="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-violet-400 text-lg"></i>
            <input
              type="text"
              :placeholder="t(':input')"
              class="w-full bg-[#151722] border border-[#202334] rounded-2xl pl-14 pr-4 py-4 text-base text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all"
              v-model="searchValue"
              autofocus
            />
          </div>
          <button @click="clearSelectedItems" class="px-5 py-4 bg-[#151722] hover:bg-[#1a1c2a] border border-[#202334] rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-red-400 transition-colors flex items-center gap-2">
            <i class="fas fa-times text-sm" /> {{ t(":reset") }}
          </button>
        </div>



        <!-- Results Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4 min-h-[20rem]">
          <div v-for="item in results || []" :key="item.name" class="group">
            <div class="flex items-center p-3 bg-[#0d0e12]/50 hover:bg-[#151722] border border-[#191b22] hover:border-violet-500/40 rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-lg" @click="selectItem(item, { unique: item.unique ? true : undefined })">
              <div class="w-14 h-14 flex items-center justify-center bg-[#07080a] border border-[#191b22] rounded-xl shrink-0 overflow-hidden shadow-inner group-hover:border-violet-500/30 transition-colors">
                <UiItemImg
                  :icon="item.icon || '%NOT_FOUND%'"
                  :item-name="item.name"
                  :namespace="item.namespace"
                  class="max-w-[75%] max-h-[75%] object-contain drop-shadow-md"
                />
              </div>
              <div class="flex flex-col ml-4 flex-1 min-w-0">
                <div class="text-base font-semibold text-gray-200 truncate" :class="{ 'text-orange-300': item.unique, 'text-teal-300': item.namespace === 'GEM' }">
                  {{ item.name }}
                </div>
                <div v-if="item.unique" class="text-xs text-gray-500 truncate mt-0.5">
                  {{ item.unique.base }}
                </div>
              </div>
              <button 
                class="ml-3 px-5 py-2 bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all border border-violet-500/20 hover:border-violet-500 shadow-md"
              >
                {{ t("Select") }}
              </button>
            </div>
          </div>
          
          <!-- Empty States -->
          <div v-if="results === false" class="col-span-full flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <div class="w-16 h-16 rounded-full bg-[#151722] border border-[#202334] flex items-center justify-center mb-4">
              <i class="fas fa-search text-gray-400 text-2xl"></i>
            </div>
            <span class="text-sm font-medium">{{ t(":too_many_") }}</span>
          </div>
          <div v-else-if="!results.length" class="col-span-full flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <div class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <i class="fas fa-exclamation-triangle text-red-400/80 text-2xl"></i>
            </div>
            <span class="text-sm font-medium">{{ t(":not_found") }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Widget
    v-else
    :config="config"
    :move-handles="['tl', 'bl']"
    :removable="false"
    :inline-edit="false"
  >
    <div
      class="widget-default-style flex flex-col p-2 gap-2"
      style="min-width: 26rem; max-width: 32rem;"
    >
      <!-- Overlay Starred Items Row -->
      <transition-group
        v-if="starred.length"
        tag="div"
        :enter-active-class="$style.starredItemEnter"
        class="flex flex-col gap-2 p-2 bg-[var(--df-bg-panel,#0d0e12)] border border-[var(--df-border-color,#191b22)] rounded-xl shadow-lg shadow-black/40"
      >
        <button
          v-for="item in starred"
          :key="item.info.refName + (item.discr || '')"
          :class="$style.starredItem"
          @click="starredItemClick($event, item)"
          class="flex flex-row items-center gap-4 bg-[#151722] hover:bg-[#1f2233] border border-[#202334] rounded-lg p-3 transition-colors group cursor-pointer w-full"
        >
          <div class="w-10 h-10 flex items-center justify-center bg-[#07080a] border border-[#202334] rounded-xl shrink-0 overflow-hidden group-hover:border-violet-500/40 transition-colors shadow-inner">
            <UiItemImg
              :icon="item.info.icon || '%NOT_FOUND%'"
              :item-name="item.info.name"
              :namespace="item.info.namespace"
              class="max-w-[80%] max-h-[80%] object-contain drop-shadow-md transform group-hover:scale-105 transition-transform"
            />
          </div>
          <div class="flex flex-col flex-1 min-w-0 text-left justify-center gap-1">
            <div class="text-xs font-bold text-gray-200 truncate">{{ item.info.name }}</div>
            <div class="flex items-center gap-2">
              <span v-if="item.price" class="text-[10px] font-semibold text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded border border-teal-400/20 truncate">{{ formatPrice(item.price) }}</span>
              <span v-if="item.price && item.price.currency === 'div' && exaltedRate" class="flex items-center gap-1 text-[10px] font-semibold text-violet-400 bg-violet-400/10 px-1.5 py-0.5 rounded border border-violet-400/20 truncate">
                {{ Math.round(item.price.min * exaltedRate) }} <img src="/images/exa.png" class="w-3 h-3 inline-block opacity-90" />
              </span>
              <span class="text-[10px] text-gray-500 truncate">{{ item.discr ? t(item.discr) : item.info.namespace === 'GEM' ? 'Skill Gem' : item.info.namespace === 'UNIQUE' ? 'Unique' : 'Base Item' }}</span>
            </div>
          </div>
          <div v-if="item.ninjaUrl" class="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#0d0e12] border border-[#202334] group-hover:bg-violet-600 group-hover:border-violet-500 transition-colors">
            <i class="fas fa-external-link-alt text-[9px] text-gray-400 group-hover:text-white transition-colors"></i>
          </div>
        </button>
      </transition-group>

      <!-- Overlay Main Search Panel -->
      <UiTimeout
        v-if="!showSearch"
        ref="showTimeout"
        @timeout="makeInvisible"
        class="self-center"
        :ms="4000"
      />
      <div v-else class="flex flex-col bg-[var(--df-bg-main,#0e1017)] border border-[var(--df-border-color,#191b22)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        
        <!-- Search Bar Header -->
        <div class="flex items-center gap-2 p-3 bg-[var(--df-bg-panel,#0d0e12)]/50 border-b border-[var(--df-border-color,#191b22)]">
          <div class="relative flex-1">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-violet-400/70 text-xs"></i>
            <input
              type="text"
              :placeholder="t(':input')"
              class="w-full bg-[#151722] border border-[#202334] rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_10px_rgba(139,92,246,0.1)] transition-all"
              v-model="searchValue"
              autofocus
            />
          </div>
          <button @click="clearSelectedItems" class="px-3 py-1.5 bg-[#151722] hover:bg-[#1a1c2a] border border-[#202334] rounded-xl text-[10px] font-semibold text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5">
            <i class="fas fa-times" /> {{ t(":reset") }}
          </button>
        </div>



        <!-- Results List -->
        <div class="flex flex-col max-h-[16rem] overflow-y-auto custom-scrollbar">
          <div v-for="item in results || []" :key="item.name" class="group border-b border-[#191b22]/30 last:border-0">
            <div class="flex items-center p-2 hover:bg-[#151722]/80 transition-colors cursor-pointer" @click="selectItem(item, { unique: item.unique ? true : undefined })">
              <div class="w-10 h-10 flex items-center justify-center bg-[#0d0e12] border border-[#191b22] rounded-lg shrink-0 overflow-hidden shadow-inner group-hover:border-violet-500/30 transition-colors">
                <UiItemImg
                  :icon="item.icon || '%NOT_FOUND%'"
                  :item-name="item.name"
                  :namespace="item.namespace"
                  class="max-w-[80%] max-h-[80%] object-contain drop-shadow-md"
                />
              </div>
              <div class="flex flex-col ml-3 flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-200 truncate" :class="{ 'text-orange-300': item.unique, 'text-teal-300': item.namespace === 'GEM' }">
                  {{ item.name }}
                </div>
                <div v-if="item.unique" class="text-[11px] text-gray-500 truncate">
                  {{ item.unique.base }}
                </div>
              </div>
              <button 
                class="ml-3 px-3 py-1 bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all border border-violet-500/20 hover:border-violet-500"
              >
                {{ t("Select") }}
              </button>
            </div>
          </div>
          
          <!-- Empty States -->
          <div v-if="results === false" class="flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <div class="w-10 h-10 rounded-full bg-[#151722] flex items-center justify-center mb-2">
              <i class="fas fa-search text-gray-400"></i>
            </div>
            <span class="text-xs">{{ t(":too_many_") }}</span>
          </div>
          <div v-else-if="!results.length" class="flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <div class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-2 border border-red-500/20">
              <i class="fas fa-exclamation-triangle text-red-400/70"></i>
            </div>
            <span class="text-xs">{{ t(":not_found") }}</span>
          </div>
        </div>

      </div>
    </div>
  </Widget>
</template>

<script lang="ts">
import { ref } from "vue";
import { distance } from "fastest-levenshtein";
import {
  BaseType,
  ITEM_BY_TRANSLATED,
  CLIENT_STRINGS as _$,
  GEM_NS_NAMES,
  UNIQUE_NS_NAMES,
  ITEM_NS_NAMES,
} from "@/assets/data";
import { AppConfig } from "@/web/Config";
import { CurrencyValue } from "@/web/background/Prices";
import type { WidgetSpec } from "../overlay/interfaces";
import { ItemSearchWidget } from "./widget.js";

export default {
  widget: {
    type: "item-search",
    instances: "single",
    initInstance: (): ItemSearchWidget => {
      return {
        wmId: 0,
        wmType: "item-search",
        wmTitle: "{icon=fa-search}",
        wmWants: "hide",
        wmZorder: null,
        wmFlags: ["invisible-on-blur"],
        anchor: {
          pos: "tl",
          x: 10,
          y: 20,
        },
        ocrGemsKey: null,
      };
    },
  } satisfies WidgetSpec,
};

interface SelectedItem {
  info: BaseType;
  discr?: string;
  chaos?: number;
  price?: CurrencyValue;
  ninjaUrl?: string;
}

function useSelectedItems() {
  const items = ref<SelectedItem[]>([]);

  function addItem(newItem: SelectedItem) {
    if (
      items.value.some(
        (item) =>
          item.info.name === newItem.info.name && item.discr === newItem.discr,
      )
    )
      return false;

    if (items.value.length < 5) {
      items.value.push(newItem);
      items.value.sort((a, b) => {
        return (b.chaos ?? 0) - (a.chaos ?? 0);
      });
    } else {
      items.value = [newItem];
    }
    return true;
  }

  function clearItems() {
    items.value = [];
  }

  return { items, addItem, clearItems };
}



function fuzzyFindHeistGem(badStr: string) {
  badStr = badStr.toLowerCase();

  const qualities = [
    ["Anomalous", _$.QUALITY_ANOMALOUS.toString().slice(2, -2)],
    ["Divergent", _$.QUALITY_DIVERGENT.toString().slice(2, -2)],
    ["Phantasmal", _$.QUALITY_PHANTASMAL.toString().slice(2, -2)],
  ];

  let bestMatch: { name: string; altQuality: string };
  let minDist = Infinity;
  for (const name of GEM_NS_NAMES()) {
    for (const [altQuality, reStr] of qualities) {
      const exactStr = reStr.replace("(.*)", name).toLowerCase();
      if (Math.abs(exactStr.length - badStr.length) > 5) {
        continue;
      }

      const dist = distance(badStr, exactStr);
      if (dist < minDist) {
        bestMatch = { name, altQuality };
        if (dist === 0) return bestMatch;
        minDist = dist;
      }
    }
  }
  return bestMatch!;
}
</script>

<script setup lang="ts">
import { shallowRef, computed, nextTick, inject, onMounted, onUnmounted } from "vue";
import { useI18nNs } from "@/web/i18n";
import { WidgetManager } from "../overlay/interfaces";
import { usePoeninja } from "@/web/background/Prices";
import { Host } from "@/web/background/IPC";
import { createVirtualItem, ItemRarity } from "@/parser/ParsedItem";
import { ItemCategory } from "@/parser";

import ItemQuickPrice from "@/web/ui/ItemQuickPrice.vue";
import Widget from "../overlay/Widget.vue";
import UiTimeout from "@/web/ui/UiTimeout.vue";
import UiItemImg from "@/web/ui/UiItemImg.vue";

const props = defineProps<{
  config: ItemSearchWidget;
}>();

const wm = inject<WidgetManager>("wm")!;
const { t } = useI18nNs("item_search");
const { findPriceByQuery, autoCurrency, queuePricesFetch, exaltedRate } = usePoeninja();

const showTimeout = shallowRef<{ reset: () => void } | null>(null);

nextTick(() => {
  props.config.wmFlags = ["invisible-on-blur"];
});

const searchValue = shallowRef("");
const { items: starred, addItem, clearItems } = useSelectedItems();

const isStandalone = computed(() => {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "standalone";
});

Host.onEvent("MAIN->CLIENT::ocr-text", (e) => {
  if (e.target !== "heist-gems") return;

  for (const para of e.paragraphs) {
    const res = fuzzyFindHeistGem(para);
    selectItem(ITEM_BY_TRANSLATED("GEM", res.name)![0], {
      withTimeout: true,
    });
  }
});

function selectItem(
  item: BaseType,
  opts?: { unique?: true; withTimeout?: true },
) {
  queuePricesFetch();

  let price: ReturnType<typeof findPriceByQuery>;
  if (opts?.unique) {
    price = findPriceByQuery({
      ns: item.namespace,
      name: item.refName,
      variant: item.unique!.base,
    });
  } else {
    price = findPriceByQuery({
      ns: item.namespace,
      name: item.refName,
    });
  }
  const isAdded = addItem({
    info: item,
    chaos: price?.primaryValue,
    price: price != null ? autoCurrency(price.primaryValue) : undefined,
    ninjaUrl: price?.url
  });
  if (isAdded && opts?.withTimeout) {
    showTimeout.value?.reset();
    props.config.wmFlags = [];
  }
  searchValue.value = "";
}
const { searchNinjaItems } = usePoeninja();

const results = computed(() => {
  const ninjaResults = searchNinjaItems(searchValue.value);
  if (ninjaResults.length === 0 && searchValue.value.length >= 3) return [];
  if (ninjaResults.length === 0) return false;

  return ninjaResults.map((res) => {
    let localNs = res.ns;
    if (localNs === "SkillGem") localNs = "GEM";
    if (localNs === "UniqueWeapon" || localNs === "UniqueArmour" || localNs === "UniqueAccessory" || localNs === "UniqueFlask" || localNs === "UniqueJewel") localNs = "UNIQUE";
    
    const localMatches = ITEM_BY_TRANSLATED(localNs as any, res.name);
    const localItem = localMatches?.[0];

    if (res.name.includes("Uhtred's Rite")) {
      console.log("[DEBUG UHTRED] res:", res, "localNs:", localNs, "localMatches length:", localMatches?.length, "localItem icon:", localItem?.icon);
    }

    return {
      name: res.name,
      refName: res.name,
      namespace: res.ns,
      icon: localItem?.icon || "",
      unique: localItem?.unique,
    } as BaseType;
  });
});

function clearSelectedItems() {
  clearItems();
  props.config.wmFlags = ["invisible-on-blur"];
}

const showSearch = wm.active;

function makeInvisible() {
  props.config.wmFlags = ["invisible-on-blur"];
}

function starredItemClick(e: MouseEvent, item: SelectedItem) {
  if (item.ninjaUrl) {
    window.open(item.ninjaUrl, "_blank");
  }
}

function formatPrice(price?: CurrencyValue) {
  if (!price) return "";
  if (price.currency === "div") {
    return `${Number(price.min.toFixed(2))} div`;
  }
  return `${Math.round(price.min)} ${price.currency}`;
}

function formatExaltedPrice(divVal: number) {
  if (!exaltedRate.value) return "";
  return `${Math.round(divVal * exaltedRate.value)} exalted`;
}

onMounted(() => {
  const handleAddSearchItem = (e: Event) => {
    const parsedItem = (e as CustomEvent).detail;
    if (!parsedItem) return;
    selectItem(parsedItem.info, {
      unique: parsedItem.rarity === ItemRarity.Unique ? true : undefined,
    });
  };
  window.addEventListener("add-search-item", handleAddSearchItem);
  onUnmounted(() => {
    window.removeEventListener("add-search-item", handleAddSearchItem);
  });
});
</script>

<style lang="postcss" module>
@keyframes starredItemEnter {
  0% {
    opacity: 0;
    transform: translateY(-5px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.starredItemEnter {
  animation: starredItemEnter 0.3s ease-out forwards;
}

/* Custom scrollbar for results list */
:global(.custom-scrollbar::-webkit-scrollbar) {
  width: 6px;
}
:global(.custom-scrollbar::-webkit-scrollbar-track) {
  background: transparent;
}
:global(.custom-scrollbar::-webkit-scrollbar-thumb) {
  background-color: #202334;
  border-radius: 9999px;
}
:global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(139, 92, 246, 0.5);
}
</style>