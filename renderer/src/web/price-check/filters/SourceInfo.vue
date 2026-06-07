<template>
  <div v-if="isStandalone">
    <!-- Redesigned UI for Standalone mode -->
    <div class="text-[10px] text-gray-400 flex flex-col gap-1">
      <!-- Mod Info / Title Row -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-violet-400 font-bold select-none">•</span>
        <!-- Type Tag -->
        <span :class="tagClass">
          {{ modTypeTranslated }}
        </span>
        <!-- Name if present (with rune lookup) -->
        <span v-if="runeName" class="font-medium text-gray-300">
          "{{ runeName }}"
        </span>
        <span v-else-if="info.name" class="font-medium text-gray-300">
          "{{ info.name }}"
        </span>
        <!-- Tier Tag if present -->
        <span v-if="info.tier != null" :class="tierClass">
          {{ t("filters.tier", [info.tier]) }}
        </span>
        <!-- Rank Tag if present -->
        <span v-if="info.rank != null" class="px-1.5 py-0.5 rounded bg-[#1b1c26] text-gray-400 border border-[#2b2e40]/40 font-medium text-[9px]">
          {{ t("item.mod_rank", [info.rank]) }}
        </span>
        
        <!-- Range badge -->
        <span 
          v-if="rollRange" 
          class="bg-[#1a1c28] border border-[#2d314c]/40 text-gray-400 px-1.5 py-0.5 rounded text-[9px] font-mono select-all"
        >
          Range: {{ rollRange }}
        </span>
      </div>
      
      <!-- Component Stats for multi-source/pseudo mods -->
      <div v-if="!isSingleSource" class="pl-3 mt-0.5 flex flex-col gap-1.5">
        <div 
          v-for="stat of stats" 
          :key="stat.text" 
          class="flex items-center justify-between text-xs py-0.5"
        >
          <ItemModifierText
            :text="stat.text"
            :roll="stat.roll"
            :class="[
              stat.contributes ? 'text-gray-300 font-medium' : 'text-gray-600 line-through'
            ]"
          />
          <div
            v-if="stat.contributes && stat.contribution"
            class="bg-[#07080b] border border-[#222538]/60 text-violet-400 rounded-md px-1.5 py-0.5 font-mono text-[9px] min-w-8 text-center shrink-0 ml-2 shadow-inner"
          >
            +{{ stat.contribution }}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Original UI for non-standalone mode -->
  <div v-else>
    <div :class="$style['modinfo']">{{ modText }}</div>
    <div v-for="stat of stats" :key="stat.text" class="flex items-baseline">
      <ItemModifierText
        :text="stat.text"
        :roll="stat.roll"
        :class="{ 'line-through': !stat.contributes }"
      />
      <div
        v-if="stat.contributes && stat.contribution"
        :class="$style['contribution']"
      >
        {{ stat.contribution }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { applyIncr } from "@/parser/advanced-mod-desc";
import { roundRoll } from "./util";
import type { StatCalculated } from "@/parser/modifiers";
import { FilterTag, type StatFilter } from "./interfaces";
import { AUGMENT_LIST } from "@/assets/data";

import ItemModifierText from "@/web/ui/ItemModifierText.vue";

const props = defineProps<{
  source: StatCalculated["sources"][number];
  filter: StatFilter;
}>();

const { t } = useI18n();

const isStandalone = computed(() => {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "standalone";
});

const isSingleSource = computed(() => {
  return props.filter.sources.length === 1 && 
         props.filter.tag !== FilterTag.Pseudo && 
         props.filter.tradeId[0] !== "item.elemental_dps";
});

const info = computed(() => props.source.modifier.info);

const runeName = computed(() => {
  const type = info.value.type;
  if (type !== "rune" && type !== "added-rune") return null;
  if (props.filter.editorAdded) {
    return props.filter.editorAdded.name;
  }
  if (info.value.name) {
    return info.value.name;
  }
  
  // Try to find the rune by comparing trade IDs
  const tradeIds: string[] = [];
  if (props.source.stat.stat.trade.ids) {
    for (const key in props.source.stat.stat.trade.ids) {
      const ids = props.source.stat.stat.trade.ids[key];
      if (ids) {
        tradeIds.push(...ids);
      }
    }
  }

  if (tradeIds.length > 0) {
    const foundRune = AUGMENT_LIST.find((rune) =>
      rune.augment?.some((aug) =>
        aug.tradeId?.some((id) => tradeIds.includes(id))
      )
    );
    if (foundRune) return foundRune.name;
  }

  // Fallback to match based on stat ref
  const statRef = props.source.stat.stat.ref;
  const foundRune = AUGMENT_LIST.find((rune) => 
    rune.augment?.some((aug) => 
      aug.string === statRef ||
      aug.string.replaceAll("+", "") === statRef.replaceAll("+", "") ||
      aug.string.replaceAll("#", "") === statRef.replaceAll("#", "")
    )
  );
  return foundRune ? foundRune.name : null;
});

const modTypeTranslated = computed(() => {
  if (info.value.generation === "corrupted") return t("item.corrupted");
  const type = info.value.type;
  if (type === "added-rune") return t("item.mod_rune");
  return t(`item.mod_${type}`);
});

const tagClass = computed(() => {
  const base = "px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase border transition-all duration-200 select-none";
  if (info.value.generation === "corrupted") {
    return `${base} bg-red-950/20 border-red-900/30 text-red-400`;
  }
  const type = info.value.type;
  switch (type) {
    case "crafted":
    case "synthesised":
    case "rune":
    case "added-rune":
      return `${base} bg-blue-950/20 border-blue-900/30 text-blue-400`;
    case "corrupted":
      return `${base} bg-red-950/20 border-red-900/30 text-red-400`;
    case "fractured":
      return `${base} bg-yellow-950/20 border-yellow-900/30 text-yellow-400`;
    case "desecrated":
      return `${base} bg-green-950/20 border-green-900/30 text-green-400`;
    case "enchant":
      return `${base} bg-purple-950/20 border-purple-900/30 text-purple-400`;
    default:
      return `${base} bg-[#141620] border-[#222538]/60 text-gray-400`;
  }
});

const tierClass = computed(() => {
  const tier = info.value.tier;
  if (tier === 1) {
    return "px-1.5 py-0.5 rounded text-[9px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium select-none";
  } else if (tier === 2) {
    return "px-1.5 py-0.5 rounded text-[9px] bg-yellow-600/5 text-yellow-400/70 border border-yellow-600/10 font-medium select-none";
  } else {
    return "px-1.5 py-0.5 rounded text-[9px] bg-[#1b1c26] text-gray-400 border border-[#2b2e40]/40 font-medium select-none";
  }
});

const modText = computed(() => {
  let text = t(`item.mod_${info.value.type}`);
  if (info.value.name) {
    text += ` "${info.value.name}"`;
  }
  if (info.value.tier != null || info.value.rank != null) {
    text += ` (${t("item.mod_tier", [info.value.tier])})`;
  }
  if (info.value.rank != null) {
    text += ` (${t("item.mod_rank", [info.value.rank])})`;
  }
  return text;
});

const stats = computed(() => {
  const { stats } = props.source.modifier;
  const { stat: contribStat } = props.source.stat;

  let contribution = props.source.contributes?.value;
  if (contribution != null) {
    const filter = props.filter.roll!;
    contribution *= filter.isNegated ? -1 : 1;
    contribution = roundRoll(contribution, filter.dp);
  }

  return stats.map((parsed) => {
    if (parsed.stat.ref !== contribStat.ref) {
      return {
        text: parsed.translation.string,
        contributes: false,
      };
    }
    parsed = applyIncr(props.source.modifier.info, parsed) ?? parsed;
    if (!parsed.roll) {
      return {
        text: parsed.translation.string,
        contribution,
        contributes: true,
      };
    }

    const rollValue = parsed.roll.value * (parsed.translation.negate ? -1 : 1);
    
    let minVal = parsed.roll.min * (parsed.translation.negate ? -1 : 1);
    let maxVal = parsed.roll.max * (parsed.translation.negate ? -1 : 1);
    if (minVal > maxVal) {
      [minVal, maxVal] = [maxVal, minVal];
    }

    return {
      text: parsed.translation.string,
      roll: roundRoll(rollValue, parsed.roll.dp),
      min: roundRoll(minVal, parsed.roll.dp),
      max: roundRoll(maxVal, parsed.roll.dp),
      contribution: contribution!,
      contributes: true,
    };
  });
});

const rollRange = computed(() => {
  const contrib = stats.value.find(s => s.contributes && s.roll != null);
  if (!contrib || contrib.min == null || contrib.max == null || contrib.min === contrib.max) {
    return null;
  }
  return `${contrib.min}–${contrib.max}`;
});
</script>

<style lang="postcss" module>
.modinfo {
  @apply text-gray-500;
  font-style: italic;
}

.contribution {
  margin-left: auto;
  @apply w-12;
  @apply rounded;
  @apply border border-gray-700;
  text-align: center;
  flex-shrink: 0;
}
</style>
