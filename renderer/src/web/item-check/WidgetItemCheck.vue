<template>
  <div class="flex-1 overflow-auto custom-scrollbar">
    <template v-if="item">
      <MapCheck v-if="isMapLike" :item="item" :config="config.maps" />
      <ItemInfo v-else :item="item" />
    </template>
  </div>
</template>

<script lang="ts">
import type { WidgetSpec } from "../overlay/interfaces";
import type { ItemCheckWidget } from "./widget.js";

export default {
  widget: {
    type: "item-check",
    instances: "single",
    initInstance: (): ItemCheckWidget => {
      return {
        wmId: 0,
        wmType: "item-check",
        wmTitle: "",
        wmWants: "hide",
        wmZorder: "exclusive",
        wmFlags: ["hide-on-blur", "menu::skip"],
        hotkey: null,
        wikiKey: null,
        poedbKey: null,
        craftOfExileKey: null,
        stashSearchKey: null,
        samePricedKey: null,
        samePricedType: "both",
        maps: {
          profile: 1,
          showNewStats: false,
          selectedStats: [
            { matcher: "#% maximum Player Resistances", decision: "w--" },
            {
              matcher: "Monsters reflect #% of Physical Damage",
              decision: "d--",
            },
            {
              matcher: "Monsters reflect #% of Elemental Damage",
              decision: "d--",
            },
            { matcher: "Area contains two Unique Bosses", decision: "g--" },
          ],
        },
      };
    },
  } satisfies WidgetSpec,
};
</script>

<script setup lang="ts">
import { computed, inject, ref, shallowRef } from "vue";
import { MainProcess } from "@/web/background/IPC";
import { ItemCategory, ItemRarity, parseClipboard, ParsedItem } from "@/parser";
import { registerActions } from "./hotkeyable-actions";
import type { WidgetManager } from "../overlay/interfaces";

import MapCheck from "../map-check/MapCheck.vue";
import ItemInfo from "./ItemInfo.vue";

const props = defineProps<{
  config: ItemCheckWidget;
}>();

const wm = inject<WidgetManager>("wm")!;

const checkPosition = ref({ x: 1, y: 1 });
const item = shallowRef<ParsedItem | null>(null);

registerActions();

MainProcess.onEvent("MAIN->CLIENT::item-text", (e) => {
  if (e.target !== "item-check") return;

  checkPosition.value = e.position;
  item.value = parseClipboard(e.clipboard).unwrapOr(null);
  if (item.value) {
    wm.show(props.config.wmId);
  }
});

props.config.wmWants = "hide";



const isMapLike = computed(() => {
  if (!item.value) return false;
  const {
    category,
    rarity,
    info: { refName },
  } = item.value;
  return (
    (category === ItemCategory.Map && rarity !== ItemRarity.Unique) ||
    category === ItemCategory.HeistContract ||
    category === ItemCategory.HeistBlueprint ||
    category === ItemCategory.Invitation ||
    refName === "Expedition Logbook"
  );
});
</script>
