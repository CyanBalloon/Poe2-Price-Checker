<template>
  <div v-if="priceData" class="flex items-center justify-between pb-4" style="min-height: 3rem">
    <div
      v-if="!isValuableBasetype && !slowdown.isReady.value"
      class="flex flex-1 justify-center"
    >
      <div><i class="fas fa-dna fa-spin text-gray-600"></i></div>
      <i18n-t keypath="trade_result.getting_price" class="pl-2">
        <span class="text-gray-600">{{ t(":getting_price_from") }}</span>
      </i18n-t>
    </div>
    <template v-else>
      <item-quick-price
        class="text-base"
        :price="priceData.price"
        :fraction="filters.stackSize != null"
        :item-img="item.info.icon"
        :item-base="item.info"
      >
        <template #item v-if="isValuableBasetype">
          <span class="text-gray-400">{{ t(":base_item") }}</span>
        </template>
      </item-quick-price>
      <button
        @click="openNinja"
        class="flex items-center gap-x-1.5 px-3 py-1.5 rounded bg-[#1e2230]/40 hover:bg-[#282d3f]/60 border border-[#2d3248]/50 hover:border-violet-500/50 text-gray-300 hover:text-white transition-all duration-200 text-xs font-semibold cursor-pointer shrink-0 shadow-sm"
      >
        <i class="fas fa-external-link-alt text-[10px] text-gray-400"></i>
        <span>Open on poe.ninja</span>
      </button>
    </template>
  </div>
  <div
    v-else-if="!item.info.craftable"
    class="flex items-center justify-between pb-4"
    style="min-height: 3rem"
  >
    <item-quick-price
      class="text-base"
      currency-text
      :item-img="item.info.icon"
      :item-base="item.info"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, watch } from "vue";
import { useI18nNs } from "@/web/i18n";
import {
  CurrencyValue,
  usePoeninja,
} from "@/web/background/Prices";
import { isValuableBasetype, getDetailsId } from "./getDetailsId";
import ItemQuickPrice from "@/web/ui/ItemQuickPrice.vue";
import { ParsedItem, ItemCategory } from "@/parser";
import { artificialSlowdown } from "../trade/artificial-slowdown";
import { ItemFilters } from "../filters/interfaces";

const slowdown = artificialSlowdown(800);

export default defineComponent({
  components: {
    ItemQuickPrice,
  },
  props: {
    item: {
      type: Object as PropType<ParsedItem>,
      required: true,
    },
    filters: {
      type: Object as PropType<ItemFilters>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18nNs("trade_result");
    const { findPriceByQuery, autoCurrency } = usePoeninja();

    watch(
      () => props.item,
      (item) => {
        slowdown.reset(item);
      },
      { immediate: true },
    );

    const priceData = computed(() => {
      const detailsId = getDetailsId(props.item);
      const entry = detailsId && findPriceByQuery(detailsId);
      if (!entry) return;
      const isCurrency = props.item.category === ItemCategory.Currency;
      const price = autoCurrency(
        entry.primaryValue,
        props.item.info.refName === "Divine Orb" || isCurrency,
        isCurrency ? "exalted" : undefined,
      );

      return {
        price,
        url: entry.url,
      };
    });

    return {
      t,
      priceData,
      openNinja() {
        window.open(priceData.value!.url);
      },
      isValuableBasetype: computed(() => {
        return isValuableBasetype(props.item);
      }),
      slowdown,
    };
  },
});
</script>
