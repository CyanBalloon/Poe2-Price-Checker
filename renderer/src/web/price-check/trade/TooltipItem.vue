<template>
  <div class="flex flex-row items-center">
    <div v-if="result.displayItem.icon" class="flex items-center justify-center shrink-0 mr-4">
      <ui-detailed-item-img
        :icon="result.displayItem.icon.url"
        :item-width="result.displayItem.icon.w"
        :item-height="result.displayItem.icon.h"
        :sockets="result.displayItem.sockets"
      />
    </div>
    <div class="flex flex-col text-center flex-grow">
      <div
        class="flex flex-col items-center justify-center text-base px-8 py-2"
        :class="
          result.displayItem.frameType === 12 ||
          result.displayItem.frameType === 13 ||
          result.displayItem.frameType === 14
            ? $style[result.displayItem.rarity + '-runic']
            : $style[result.displayItem.rarity + '-title']
        "
      >
        <div v-if="result.displayItem.title.length" class="font-bold">
          {{ result.displayItem.title[0] }}
        </div>
        <div v-if="result.displayItem.title.length > 1" class="text-sm opacity-90 mt-0.5">
          {{ result.displayItem.title[1] }}
        </div>
      </div>
      <div
        v-if="
          result.displayItem.rarity === 'Rare' ||
          result.displayItem.rarity === 'Unique' ||
          result.displayItem.rarity === 'Magic'
        "
        :class="$style[result.displayItem.rarity + '-separator']"
      />
      <hr
        v-else
        class="block h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent my-1.5 border-0 border-none"
      />
      <div class="flex flex-col px-1.5 pb-1.5 text-center">
        <template v-for="(section, index) in sections">
          <div v-if="section.content" :key="index">
            <div
              v-for="mod in section.content"
              :key="mod.text"
              class="flex items-center justify-between py-0.5"
            >
              <span class="flex-grow text-center text-[12px] leading-relaxed">
                <span
                  :class="
                    mod.value
                      ? 'text-gray-400'
                      : $style[`number-color-${mod.color}`]
                  "
                  >{{ translateMod(mod.text) }}</span
                >
                <span
                  v-if="mod.value"
                  :class="$style[`number-color-${mod.color}`]"
                  >{{ mod.value }}</span
                >
              </span>
            </div>
          </div>
          <template v-if="dividerVisible[index]">
            <div
              v-if="
                result.displayItem.rarity === 'Rare' ||
                result.displayItem.rarity === 'Unique' ||
                result.displayItem.rarity === 'Magic'
              "
              :class="$style[result.displayItem.rarity + '-separator']"
            />
            <hr
              v-else
              class="block h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent my-1.5 border-0 border-none"
            />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { PricingResult } from "./pathofexile-trade";
import { useI18n } from "vue-i18n";
import UiDetailedItemImg from "@/web/ui/UiDetailedItemImg.vue";

const STRIP_PERCENT_MODS = new Set([
  "item.crit",
  "item.map_pack_size",
  "item.map_magic_monsters",
  "item.map_rare_monsters",
  "item.map_drop_chance",
  "item.map_item_rarity",
  "item.map_gold",
]);

export default defineComponent({
  components: {
    UiDetailedItemImg,
  },
  props: {
    result: {
      type: Object as PropType<PricingResult>,
      required: true,
    },
  },
  setup(props) {
    const item = props.result.displayItem;
    const { t } = useI18n();

    function translateMod(key: string): string {
      try {
        const translated = t(key);
        if (STRIP_PERCENT_MODS.has(key)) {
          return translated.slice(0, translated.lastIndexOf(" ")) + " ";
        }
        return translated;
      } catch (e) {
        // Fallback for when vue-i18n crashes parsing the string as a template (e.g. if it contains '{')
        return key;
      }
    }

    const sections = [
      { key: "nameBlock", content: item.nameBlock },
      { key: "itemProps", content: item.itemProps },
      { key: "enchantMods", content: item.enchantMods },
      { key: "runeMods", content: item.runeMods },
      { key: "grantedSkills", content: item.grantSkill },
      { key: "implicitMods", content: item.implicitMods },
      {
        key: "explicitMods",
        content: [
          // ? maybe keep
          ...(item.fracturedMods ?? []),
          ...(item.explicitMods ?? []),
          ...(item.craftedMods ?? []),
          ...(item.desecratedMods ?? []),
          ...(item.mutatedMods ?? []),
        ],
      },
      { key: "pseudoMods", content: item.pseudoMods },
    ];
    // each tag gets its own section, since they are footers
    for (const tag of item.itemTags ?? []) {
      sections.push({ key: tag.text, content: [tag] });
    }

    const dividerVisible = sections.map((_, index) => {
      return (
        sections[index].content &&
        sections[index].content.length > 0 &&
        sections.slice(index + 1).some((section) => {
          const { content } = section;
          if (!content) {
            return false;
          }

          if (Array.isArray(content)) {
            return content.length > 0;
          }
          if (typeof content === "object") {
            return Object.values(content).some((v) => v !== undefined);
          }
          return false;
        })
      );
    });

    return {
      t,
      translateMod,
      item,
      sections,
      dividerVisible,
    };
  },
});
</script>

<style lang="postcss" module>
.mod {
  @apply text-sm;
}

.Rare-separator,
.Magic-separator,
.Unique-separator {
  @apply h-[1px] my-1.5 w-full;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent);
}

.Normal-title,
.Magic-title,
.Normal-runic,
.Magic-runic {
  @apply py-1;
}
.Rare-title,
.Unique-title,
.Rare-runic,
.Unique-runic {
  @apply py-1.5;
}

.Normal-title {
  @apply text-normal;
}
.Magic-title {
  @apply text-magic;
}
.Rare-title {
  @apply text-rare;
}
.Unique-title {
  @apply text-unique;
}

.Magic-runic {
  @apply text-magic;
}
.Rare-runic {
  @apply text-rare;
}
.Unique-runic {
  @apply text-unique;
}

.i-w-1 {
  @apply w-12;
}
.i-w-2 {
  @apply w-24;
}
.i-w-3 {
  @apply w-36;
}

.number-color-0 {
  /*white*/
  @apply text-white;
}
.number-color-1 {
  /*aug*/
  @apply text-indigo-500;
}
.number-color-2 {
  /*unmet*/
  @apply text-red-500;
}
.number-color-3 {
  /*physical*/
  @apply text-white;
}
.number-color-4 {
  /*fire*/
  @apply text-red-700;
}
.number-color-5 {
  /*cold*/
  @apply text-blue-700;
}
.number-color-6 {
  /*lightning*/
  @apply text-yellow-500;
}
.number-color-7 {
  /*chaos*/
  @apply text-pink-800;
}
.number-color-8 {
  /*unique*/
  @apply text-orange-700;
}
.number-color-9 {
  /*unreachable*/
  @apply text-gray-500;
}
.number-color-10 {
  /*currency*/
  @apply text-gray-300;
}
.number-color-11 {
  /*reward*/
  @apply text-white;
}
.number-color-12 {
  /*divination*/
  @apply text-blue-300;
}
.number-color-13 {
  /*sanctum boon*/
  @apply text-gray-500;
}
.number-color-14 {
  /*sanctum curse*/
  @apply text-purple-300;
}
.number-color-15 {
  /*sanctum pact*/
  @apply text-pink-200;
}
.number-color-25 {
  /*grant skill*/
  @apply text-indigo-500;
}
.number-color-8729 {
  /*aug*/
  @apply text-indigo-300;
}
.number-color-8730 {
  /*fractured*/
  @apply text-orange-300;
}
.number-color-8731 {
  /*desecrated*/
  @apply text-green-800;
}
.number-color-8732 {
  /*sanctified*/
  @apply text-orange-300;
}
.number-color-8733 {
  /*mutated*/
  @apply text-rose-900;
}
.number-color-8734 {
  /*crafted*/
  @apply text-blue-400;
}
</style>
