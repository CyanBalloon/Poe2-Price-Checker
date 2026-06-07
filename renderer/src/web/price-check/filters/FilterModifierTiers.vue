<template>
  <div
    v-if="tags.length"
    class="flex items-center gap-1.5"
    :class="isStandalone ? 'text-[10px] my-0.5' : 'text-xs leading-none gap-x-1'"
  >
    <span 
      v-for="tag of tags" 
      :key="tag.tier"
      :class="[
        isStandalone 
          ? getStandaloneTierClass(tag.type) 
          : $style[tag.type]
      ]"
    >
      {{ t("filters.tier", [tag.tier]) }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { useI18n } from "vue-i18n";
import { ItemCategory, ParsedItem } from "@/parser";
import { FilterTag, StatFilter } from "./interfaces";
import { AppConfig } from "@/web/Config";
import { PriceCheckWidget } from "@/web/overlay/interfaces";

export default defineComponent({
  props: {
    filter: {
      type: Object as PropType<StatFilter>,
      required: true,
    },
    item: {
      type: Object as PropType<ParsedItem>,
      required: true,
    },
  },
  setup(props) {
    const isStandalone = computed(() => {
      const params = new URLSearchParams(window.location.search);
      return params.get("mode") === "standalone";
    });

    const alwaysShowTier = computed(
      () => AppConfig<PriceCheckWidget>("price-check")!.alwaysShowTier,
    );

    const tags = computed(() => {
      const { filter, item } = props;
      if (
        item.category === ItemCategory.Map ||
        item.category === ItemCategory.Tablet
      ) {
        return [];
      }
      const out: Array<{ type: string; tier: number }> = [];
      for (const source of filter.sources) {
        const tier = source.modifier.info.tier;
        if (!tier) continue;

        if (
          (filter.tag === FilterTag.Explicit ||
            filter.tag === FilterTag.Desecrated ||
            filter.tag === FilterTag.Fractured ||
            filter.tag === FilterTag.Pseudo ||
            filter.tag === FilterTag.Property) &&
          item.category !== ItemCategory.Jewel &&
          item.category !== ItemCategory.ClusterJewel &&
          item.category !== ItemCategory.MemoryLine
        ) {
          if (tier === 1) out.push({ type: "tier-1", tier });
          else if (tier === 2) out.push({ type: "tier-2", tier });
          else if (alwaysShowTier.value)
            out.push({ type: "tier-3-plus", tier });
        } else if (tier >= 2) {
          out.push({ type: "not-tier-1", tier });
        }
      }
      out.sort((a, b) => a.tier - b.tier);
      return out;
    });

    function getStandaloneTierClass(type: string) {
      switch (type) {
        case "tier-1":
          return "px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium";
        case "tier-2":
          return "px-1.5 py-0.5 rounded bg-yellow-600/5 text-yellow-400/70 border border-yellow-600/10 font-medium";
        default:
          return "px-1.5 py-0.5 rounded bg-[#1b1c26] text-gray-400 border border-[#2b2e40]/40 font-medium";
      }
    }

    const { t } = useI18n();
    return { 
      t, 
      tags, 
      isStandalone, 
      getStandaloneTierClass 
    };
  },
});
</script>

<style lang="postcss" module>
.tier-1,
.tier-2,
.not-tier-1,
.tier-3-plus {
  @apply rounded px-1;
}

.tier-1 {
  @apply bg-yellow-500 text-black;
}
.tier-2 {
  @apply border -my-px border-yellow-500 text-yellow-500;
}
.tier-3-plus {
  @apply bg-gray-700 text-black;
}
.not-tier-1 {
  @apply bg-gray-700 text-black border -my-px border-black;
}
</style>
