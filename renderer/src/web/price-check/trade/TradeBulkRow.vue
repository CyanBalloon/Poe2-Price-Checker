<template>
  <div 
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    class="flex items-center justify-between p-3.5 rounded-xl bg-[#0f111a]/50 hover:bg-[#151724]/50 transition-all duration-200 shrink-0"
  >
    <!-- Price Column -->
    <div class="flex items-center gap-3">
      <!-- Rate: exchangeAmount / itemAmount -->
      <div class="flex items-center gap-1.5 bg-[#171924]/60 border border-[#272a3b]/40 rounded-lg px-2.5 py-1 text-xs font-semibold text-white">
        <span class="font-bold font-mono text-teal-400">
          {{ Number((res.exchangeAmount / res.itemAmount).toFixed(4)) }}
        </span>
        <span class="text-gray-500 text-[10px] font-normal">
          ({{ res.exchangeAmount }}
          <span class="text-[9px] uppercase font-bold text-gray-400">{{ selectedCurr === "xchgExalted" ? "exalt" : selectedCurr === "xchgChaos" ? "chaos" : "div" }}</span>
          / {{ res.itemAmount }} items)
        </span>
      </div>
    </div>

    <!-- Stock and Fulfill Details -->
    <div class="flex items-center gap-5 text-xs text-gray-300">
      <div class="flex flex-col items-center">
        <span class="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Stock</span>
        <span class="font-bold font-mono text-gray-300">{{ res.stock }}</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Fulfill</span>
        <span class="font-bold font-mono" :class="res.stock < res.itemAmount ? 'text-amber-500' : 'text-teal-400'">
          <i v-if="res.stock < res.itemAmount" class="fas fa-exclamation-triangle mr-1 text-[10px]" />
          {{ Math.floor(res.stock / res.itemAmount) }} times
        </span>
      </div>
    </div>

    <!-- Seller and Time -->
    <div class="flex items-center gap-4">
      <div class="flex flex-col items-end">
        <div class="flex items-center gap-1.5">
          <span 
            class="w-1.5 h-1.5 rounded-full" 
            :class="[
              res.accountStatus === 'online' ? 'bg-teal-400 animate-pulse' :
              res.accountStatus === 'afk' ? 'bg-amber-400' : 'bg-gray-600'
            ]"
          />
          <span class="text-xs font-semibold text-gray-400">
            {{ showSeller === 'ign' ? res.ign : res.accountName }}
          </span>
          <span v-if="res.isMine" class="px-1.5 py-0.5 text-[9px] font-bold bg-violet-600/20 text-violet-400 rounded uppercase tracking-wider">You</span>
        </div>
        <span class="text-[10px] text-gray-500 font-sans mt-0.5">{{ res.relativeDate }}</span>
      </div>

      <!-- Browser Link button -->
      <button 
        @click.stop="openTradeLink"
        class="p-2 bg-[#171924]/60 hover:bg-[#202336] border border-[#272a3b]/40 hover:border-violet-500/40 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm"
        title="Open Trade on Site"
      >
        <i class="fas fa-external-link-alt text-[10px]"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, inject, Ref } from "vue";
import { PricingResult } from "./pathofexile-trade";
import { PriceCheckWidget } from "@/web/overlay/interfaces";

interface HoveredListingState {
  res: PricingResult;
  mouseY: number;
}

export default defineComponent({
  name: "TradeBulkRow",
  props: {
    res: {
      type: Object as PropType<PricingResult>,
      required: true,
    },
    selectedCurr: {
      type: String,
      required: true,
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

    function openTradeLink() {
      emit("open-link");
    }

    return {
      onMouseEnter,
      onMouseLeave,
      openTradeLink,
    };
  },
});
</script>
