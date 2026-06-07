<template>
  <div 
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    class="flex items-center p-3 rounded-xl bg-[#0f111a]/50 hover:bg-[#151724]/50 transition-all duration-200 gap-3 w-full min-w-0"
  >
    <!-- Price & Stock Column -->
    <div class="flex items-center gap-2.5 w-[140px] shrink-0">
      <div class="flex items-center gap-1.5 bg-[#171924]/60 border border-[#272a3b]/40 rounded-lg px-2.5 py-1 text-xs font-semibold text-white">
        <span class="font-bold font-mono text-teal-400">{{ res.priceAmount }}</span>
        <span class="text-gray-400 text-[10px] uppercase font-bold tracking-wide">{{ res.priceCurrency }}</span>
        <img 
          v-if="getCurrencyImg(res.priceCurrency)"
          :src="getCurrencyImg(res.priceCurrency)"
          class="w-4 h-4 object-contain shrink-0"
        />
        <span v-if="res.normalizedPrice && res.priceCurrency !== res.normalizedPriceCurrency.id && res.priceCurrency !== 'divine'" class="text-gray-500 text-[9px] font-normal flex items-center gap-1 shrink-0">
          ({{ res.normalizedPrice }}
          <img 
            v-if="getCurrencyImg(res.normalizedPriceCurrency.id)"
            :src="getCurrencyImg(res.normalizedPriceCurrency.id)"
            class="w-3.5 h-3.5 object-contain inline shrink-0"
          />)
        </span>
      </div>
      
      <span v-if="res.listedTimes > 2" class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold shrink-0">
        × {{ res.listedTimes }}
      </span>
    </div>

    <!-- Item Attributes Column -->
    <div class="flex items-center gap-4 text-xs text-gray-300 w-[100px] shrink-0 justify-start select-none">
      <div v-if="filters.itemLevel" class="flex flex-col items-center min-w-[28px]">
        <span class="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">iLvl</span>
        <span class="font-bold font-mono text-gray-300">{{ res.itemLevel }}</span>
      </div>
      <div v-if="quality && !quality.disabled" class="flex flex-col items-center min-w-[38px]">
        <span class="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Quality</span>
        <span class="font-bold font-mono text-blue-400">{{ formatQuality(res.quality) }}</span>
      </div>
      <div v-if="item.category === ItemCategory.Gem || item.category === ItemCategory.UncutGem" class="flex flex-col items-center min-w-[38px]">
        <span class="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Gem Lvl</span>
        <span class="font-bold font-mono text-teal-400">{{ res.level }}</span>
      </div>
    </div>

    <!-- Seller and Status Column -->
    <div class="flex-1 flex items-center justify-between min-w-0 pr-2">
      <div class="flex flex-col items-start min-w-0">
        <div class="flex items-center gap-1.5 min-w-0">
          <span 
            class="w-1.5 h-1.5 rounded-full shrink-0" 
            :class="[
              res.accountStatus === 'online' ? 'bg-teal-400 animate-pulse' :
              res.accountStatus === 'afk' ? 'bg-amber-400' : 'bg-gray-600'
            ]"
          />
          <span class="text-xs font-semibold text-gray-400 truncate">
            {{ showSeller === 'ign' ? res.ign : res.accountName }}
          </span>
          <span v-if="res.isMine" class="px-1.5 py-0.5 text-[9px] font-bold bg-violet-600/20 text-violet-400 rounded uppercase tracking-wider shrink-0">You</span>
          <span v-if="res.inDemand" class="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-400 rounded uppercase tracking-wider shrink-0">In Demand</span>
          <span v-if="res.gone" class="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 rounded uppercase tracking-wider shrink-0">Gone</span>
        </div>
        <span class="text-[10px] text-gray-500 font-sans mt-0.5">{{ res.relativeDate }}</span>
      </div>

      <!-- Open Link -->
      <button 
        @click.stop="openTradeLink"
        class="p-2 bg-[#171924]/60 hover:bg-[#202336] border border-[#272a3b]/40 hover:border-violet-500/40 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm shrink-0"
        title="Open Search on Site"
      >
        <i class="fas fa-external-link-alt text-[10px]"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, inject, Ref } from "vue";
import { PricingResult } from "./pathofexile-trade";
import { ParsedItem, ItemCategory } from "@/parser";
import { ItemFilters } from "../filters/interfaces";
import { PriceCheckWidget } from "@/web/overlay/interfaces";

interface HoveredListingState {
  res: PricingResult;
  mouseY: number;
}

export default defineComponent({
  name: "TradeListingRow",
  props: {
    res: {
      type: Object as PropType<PricingResult & { listedTimes: number }>,
      required: true,
    },
    item: {
      type: Object as PropType<ParsedItem>,
      required: true,
    },
    filters: {
      type: Object as PropType<ItemFilters>,
      required: true,
    },
    quality: {
      type: Object as PropType<ItemFilters["quality"]>,
      default: undefined,
    },
    showSeller: {
      type: String as PropType<PriceCheckWidget["showSeller"]>,
      required: true,
    },
  },
  emits: ["open-link"],
  setup(props, { emit }) {
    const hoveredListing = inject<Ref<HoveredListingState | null>>("hovered-listing");

    function onMouseEnter(e: MouseEvent) {
      if (hoveredListing) {
        hoveredListing.value = {
          res: props.res,
          mouseY: e.clientY,
        };
      }
    }

    function onMouseLeave() {
      if (hoveredListing) {
        hoveredListing.value = null;
      }
    }

    function getCurrencyImg(currency: string) {
      if (!currency) return "";
      const cur = currency.toLowerCase();
      if (cur === "div" || cur === "divine" || cur.startsWith("div")) {
        return "/images/divine.png";
      } else if (cur === "chaos" || cur.startsWith("ch")) {
        return "/images/chaos.png";
      } else if (cur === "exalted" || cur === "exa" || cur.startsWith("ex")) {
        return "/images/exa.png";
      }
      return "";
    }

    function formatQuality(val: string | number | undefined) {
      if (val == null) return "";
      let s = String(val);
      if (!s.startsWith("+")) s = "+" + s;
      if (!s.endsWith("%")) s = s + "%";
      return s;
    }

    function openTradeLink() {
      emit("open-link", props.res);
    }

    return {
      onMouseEnter,
      onMouseLeave,
      getCurrencyImg,
      openTradeLink,
      formatQuality,
      ItemCategory,
    };
  },
});
</script>
