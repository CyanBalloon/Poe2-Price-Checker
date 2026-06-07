<template>
  <div v-if="isStandalone" class="flex flex-col gap-2.5 p-1 text-gray-200 select-none">
    <!-- Category & Rarity Row -->
    <div class="flex items-center gap-1.5 flex-wrap justify-between">
      <div class="flex items-center gap-1.5 flex-wrap">
        <span 
          class="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-[#14151b] border border-[#222538]/60"
          :style="{ color: rarityColor }"
        >
          {{ item.rarity }}
        </span>
        <span class="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-[#101116] border border-[#1b1d2a] text-gray-400">
          {{ item.category || 'Item' }}
        </span>
        <span v-if="item.isCorrupted" class="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-red-950/25 border border-red-900/30 text-red-400">
          Corrupted
        </span>
      </div>

      <!-- Search Rarity Filter Dropdown -->
      <div class="flex items-center gap-1.5 bg-[#101116] border border-[#1b1d2a] rounded-lg px-2 py-0.5 text-[10px] text-gray-300 shadow-sm">
        <span class="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Search:</span>
        <select 
          v-model="currentRarity"
          class="bg-transparent border-none text-[9px] font-bold text-violet-400 uppercase focus:outline-none cursor-pointer pr-1"
        >
          <option value="any" class="bg-[#0d0e12] text-gray-300">Any</option>
          <option value="normal" class="bg-[#0d0e12] text-gray-300">Normal</option>
          <option value="magic" class="bg-[#0d0e12] text-gray-300">Magic</option>
          <option value="rare" class="bg-[#0d0e12] text-gray-300">Rare</option>
          <option value="unique" class="bg-[#0d0e12] text-gray-300">Unique</option>
          <option value="nonunique" class="bg-[#0d0e12] text-gray-300">Non-Unique</option>
        </select>
      </div>
    </div>

    <!-- Item Title and Base Type -->
    <div class="flex items-baseline gap-2 flex-wrap mt-1">
      <h3 
        v-if="item.info.name && item.rarity === 'Unique'" 
        class="text-base font-semibold tracking-wide"
        :style="{ color: rarityColor }"
      >
        {{ item.info.name }}
      </h3>
      <h3 
        v-else-if="item.name && item.rarity === 'Rare'" 
        class="text-base font-semibold tracking-wide"
        :style="{ color: rarityColor }"
      >
        {{ item.name }}
      </h3>
      <span class="text-xs text-gray-400 font-medium">
        {{ item.baseType || item.info.refName }}
      </span>
    </div>

    <!-- Properties: Item Level, Quality, Sockets, Requirements -->
    <div class="flex flex-wrap items-center gap-2 mt-2 pt-2.5 border-t border-[#1d202e]/30">
      <!-- Item Level -->
      <div 
        v-if="filters.itemLevel"
        :class="[
          'text-[10px] font-medium px-2 py-0.5 rounded-xl border flex items-center gap-1 select-none transition-all duration-200',
          !filters.itemLevel.disabled 
            ? 'bg-[#1e1a38]/60 border-violet-500/40 text-violet-300 shadow-sm shadow-violet-950/20' 
            : 'bg-[#101218] border-transparent text-gray-400 hover:border-[#202334]'
        ]"
      >
        <button @click="filters.itemLevel.disabled = !filters.itemLevel.disabled" class="hover:text-gray-200 transition-colors uppercase text-[9px] font-semibold tracking-wide">
          iLvl
        </button>
        <input 
          type="number" 
          v-model.number="filters.itemLevel.value"
          @focus="filters.itemLevel.disabled = false"
          class="w-6 bg-transparent text-center font-bold font-mono text-teal-400 focus:outline-none select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <!-- Quality -->
      <div 
        v-if="filters.quality"
        :class="[
          'text-[10px] font-medium px-2 py-0.5 rounded-xl border flex items-center gap-1 select-none transition-all duration-200',
          !filters.quality.disabled 
            ? 'bg-[#1e1a38]/60 border-violet-500/40 text-violet-300 shadow-sm shadow-violet-950/20' 
            : 'bg-[#101218] border-transparent text-gray-400 hover:border-[#202334]'
        ]"
      >
        <button @click="filters.quality.disabled = !filters.quality.disabled" class="hover:text-gray-200 transition-colors uppercase text-[9px] font-semibold tracking-wide">
          Qual
        </button>
        <input 
          type="number" 
          v-model.number="filters.quality.value"
          @focus="filters.quality.disabled = false"
          class="w-6 bg-transparent text-center font-bold font-mono text-teal-400 focus:outline-none select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span class="text-teal-500 font-bold font-mono">%</span>
      </div>

      <!-- Sockets -->
      <div 
        v-if="filters.socketNumber"
        :class="[
          'text-[10px] font-medium px-2 py-0.5 rounded-xl border flex items-center gap-1 select-none transition-all duration-200',
          !filters.socketNumber.disabled 
            ? 'bg-[#1e1a38]/60 border-violet-500/40 text-violet-300 shadow-sm shadow-violet-950/20' 
            : 'bg-[#101218] border-transparent text-gray-400 hover:border-[#202334]'
        ]"
      >
        <button @click="filters.socketNumber.disabled = !filters.socketNumber.disabled" class="hover:text-gray-200 transition-colors uppercase text-[9px] font-semibold tracking-wide">
          Sockets
        </button>
        <input 
          type="number" 
          v-model.number="filters.socketNumber.value"
          @focus="filters.socketNumber.disabled = false"
          class="w-4 bg-transparent text-center font-bold font-mono text-teal-400 focus:outline-none select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <!-- Links -->
      <div 
        v-if="filters.linkedSockets"
        :class="[
          'text-[10px] font-medium px-2.5 py-0.5 rounded-xl border flex items-center gap-1 select-none transition-all duration-200',
          !filters.linkedSockets.disabled 
            ? 'bg-[#1e1a38]/60 border-violet-500/40 text-violet-300 shadow-sm shadow-violet-950/20' 
            : 'bg-[#101218] border-transparent text-gray-400 hover:border-[#202334]'
        ]"
      >
        <button @click="filters.linkedSockets.disabled = !filters.linkedSockets.disabled" class="hover:text-gray-200 transition-colors uppercase text-[9px] font-semibold tracking-wide">
          Links
        </button>
        <input 
          type="number" 
          v-model.number="filters.linkedSockets.value"
          @focus="filters.linkedSockets.disabled = false"
          class="w-4 bg-transparent text-center font-bold font-mono text-teal-400 focus:outline-none select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <!-- White Sockets -->
      <div 
        v-if="filters.whiteSockets"
        :class="[
          'text-[10px] font-medium px-2.5 py-0.5 rounded-xl border flex items-center gap-1 select-none transition-all duration-200',
          !filters.whiteSockets.disabled 
            ? 'bg-[#1e1a38]/60 border-violet-500/40 text-violet-300 shadow-sm shadow-violet-950/20' 
            : 'bg-[#101218] border-transparent text-gray-400 hover:border-[#202334]'
        ]"
      >
        <button @click="filters.whiteSockets.disabled = !filters.whiteSockets.disabled" class="hover:text-gray-200 transition-colors uppercase text-[9px] font-semibold tracking-wide">
          White
        </button>
        <input 
          type="number" 
          v-model.number="filters.whiteSockets.value"
          @focus="filters.whiteSockets.disabled = false"
          class="w-4 bg-transparent text-center font-bold font-mono text-teal-400 focus:outline-none select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <!-- Augments -->
      <div 
        v-if="filters.augmentSockets"
        :class="[
          'text-[10px] font-medium px-2.5 py-0.5 rounded-xl border flex items-center gap-1 select-none transition-all duration-200',
          !filters.augmentSockets.disabled 
            ? 'bg-[#1e1a38]/60 border-violet-500/40 text-violet-300 shadow-sm shadow-violet-950/20' 
            : 'bg-[#101218] border-transparent text-gray-400 hover:border-[#202334]'
        ]"
      >
        <button @click="filters.augmentSockets.disabled = !filters.augmentSockets.disabled" class="hover:text-gray-200 transition-colors uppercase text-[9px] font-semibold tracking-wide">
          Augments
        </button>
        <input 
          type="number" 
          v-model.number="filters.augmentSockets.value"
          @focus="filters.augmentSockets.disabled = false"
          class="w-4 bg-transparent text-center font-bold font-mono text-teal-400 focus:outline-none select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <!-- Required Level -->
      <div 
        v-if="filters.requires?.level"
        :class="[
          'text-[10px] font-medium px-2.5 py-0.5 rounded-xl border flex items-center gap-1 select-none transition-all duration-200',
          !filters.requires.level.disabled 
            ? 'bg-[#1e1a38]/60 border-violet-500/40 text-violet-300 shadow-sm shadow-violet-950/20' 
            : 'bg-[#101218] border-transparent text-gray-400 hover:border-[#202334]'
        ]"
      >
        <button @click="filters.requires.level.disabled = !filters.requires.level.disabled" class="hover:text-gray-200 transition-colors uppercase text-[9px] font-semibold tracking-wide">
          Req. Lvl
        </button>
        <input 
          type="number" 
          v-model.number="filters.requires.level.value"
          @focus="filters.requires.level.disabled = false"
          class="w-6 bg-transparent text-center font-bold font-mono text-teal-400 focus:outline-none select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>

    <!-- Accuracy/Base Toggle -->
    <button
      class="w-full mt-3 py-2 px-3 rounded-xl text-left text-xs transition-all duration-200 border bg-[#141620]/80 border-[#222538]/60 text-gray-300 hover:bg-[#1a1d2a] flex items-center justify-between shadow-sm"
      @click="toggleAccuracy"
    >
      <span class="text-gray-500 font-medium">Search Mode</span>
      <span class="font-semibold text-violet-400 flex items-center gap-1.5">
        {{ label }}
        <i class="fas" :class="showAsActive ? 'fa-search-minus' : 'fa-search-plus'"></i>
      </span>
    </button>
  </div>
  
  <div v-else class="filter-name">
    <button
      class="px-2 rounded border overflow-hidden text-ellipsis"
      :class="{
        'border-gray-500': showAsActive,
        'border-gray-900': !showAsActive,
      }"
      @click="toggleAccuracy"
    >
      {{ label }}
    </button>
    <button
      v-if="filters.corrupted"
      class="px-2"
      @click="corrupted = !corrupted"
    >
      <span v-if="corrupted" class="text-red-500">{{
        t("item.corrupted")
      }}</span>
      <span v-else class="text-gray-600">{{ t("item.not_corrupted") }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { ParsedItem } from "@/parser";
import type { ItemFilters } from "./interfaces";
import { CATEGORY_TO_TRADE_ID } from "../trade/pathofexile-trade";

export default defineComponent({
  name: "FilterName",
  props: {
    filters: {
      type: Object as PropType<ItemFilters>,
      required: true,
    },
    item: {
      type: Object as PropType<ParsedItem>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const isStandalone = computed(() => {
      const params = new URLSearchParams(window.location.search);
      return params.get("mode") === "standalone";
    });

    const rarityColor = computed(() => {
      switch (props.item.rarity) {
        case "Rare": return "#e5c158";
        case "Unique": return "#d27e37";
        case "Magic": return "#7089ff";
        case "Normal": return "#ffffff";
        default: return "#cccccc";
      }
    });

    const socketsString = computed(() => {
      if (props.item.augmentSockets) {
        return "S ".repeat(props.item.augmentSockets.current).trim();
      }
      if (props.item.gemSockets) {
        return "S ".repeat(props.item.gemSockets.number).trim();
      }
      return "";
    });

    const currentRarity = computed({
      get() {
        return props.filters.rarity?.value || 'any';
      },
      set(val) {
        if (!props.filters.rarity) {
          props.filters.rarity = { value: val };
        } else {
          props.filters.rarity.value = val;
        }
      }
    });

    const label = computed(() => {
      const { filters } = props;
      const activeSearch =
        filters.searchRelaxed && !filters.searchRelaxed.disabled
          ? filters.searchRelaxed
          : filters.searchExact;

      if (activeSearch.name) {
        return activeSearch.name;
      }
      if (activeSearch.baseType) {
        return activeSearch.baseType;
      }
      if (activeSearch.category) {
        const tradeId = CATEGORY_TO_TRADE_ID.get(activeSearch.category)!;
        return t("item_category.prop", [
          t(`item_category.${tradeId.replace(".", "_")}`),
        ]);
      }

      return "??? Report if you see this text";
    });

    const showAsActive = computed(() => {
      const { filters } = props;
      return filters.searchRelaxed?.disabled;
    });

    function toggleAccuracy() {
      const { filters } = props;
      if (filters.searchRelaxed) {
        filters.searchRelaxed.disabled = !filters.searchRelaxed.disabled;
      }
    }

    const corrupted = computed<boolean>({
      get() {
        return props.filters.corrupted!.value;
      },
      set(value) {
        props.filters.corrupted!.value = value;
      },
    });

    return {
      t,
      isStandalone,
      rarityColor,
      socketsString,
      currentRarity,
      label,
      showAsActive,
      toggleAccuracy,
      corrupted,
    };
  },
});
</script>

<style lang="postcss">
.filter-name {
  @apply bg-gray-900 mb-2 rounded;
  line-height: 1.25rem;
  display: flex;
  justify-content: space-between;
  white-space: nowrap;
}
</style>
