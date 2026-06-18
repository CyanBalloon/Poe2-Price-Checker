<template>
  <div class="flex-1 overflow-auto custom-scrollbar">
    <div
      class="relative p-2 rounded bg-gray-900 overflow-y-auto text-gray-100"
      :class="{
        'w-64': config.notepadSize <= WidgetWidth.Small,
        'w-[512px]': config.notepadSize === WidgetWidth.Medium,
        'w-[768px]': config.notepadSize >= WidgetWidth.Large,
      }"
    >
      <div class="m-1 text-center truncate">
        {{ config.wmTitle || "Untitled" }}
      </div>
      <textarea
        v-model="config.notepadBody"
        :placeholder="t(':placeholder')"
        :class="$style.notepadArea"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, inject } from "vue";
import {
  WidgetManager,
  WidgetSpec,
  NotepadWidget,
} from "@/web/overlay/interfaces";
import { useI18nNs } from "@/web/i18n";

enum WidgetWidth {
  Small = 0,
  Medium = 1,
  Large = 2,
}

export default defineComponent({
  widget: {
    type: "notepad",
    instances: "multi",
    trNameKey: "notepad.name",
  } satisfies WidgetSpec,
  components: {},
  props: {
    config: {
      type: Object as PropType<NotepadWidget>,
      required: true,
    },
  },
  setup(props) {
    const wm = inject<WidgetManager>("wm")!;

    if (props.config.wmFlags[0] === "uninitialized") {
      const config = props.config;
      config.anchor = {
        pos: "tl",
        x: Math.random() * (5 - 1) + 1,
        y: Math.random() * (12 - 8) + 16,
      };
      config.wmTitle = "Notepad";
      config.notepadBody = "";
      config.wmFlags = ["invisible-on-blur"];
      config.notepadSize = WidgetWidth.Medium;
      wm.show(config.wmId);
    }

    const { t } = useI18nNs("notepad");
    return {
      t,
      WidgetWidth,
    };
  },
});
</script>

<style lang="postcss" module>
.notepadArea {
  @apply bg-gray-800 text-white;
  @apply min-h-36 p-2 w-full max-h-[33vh];
  @apply rounded border border-transparent;
  @apply block box-border;
  @apply resize-none whitespace-pre-wrap break-words font-mono;
  @apply outline-none;

  /* TODO: swap to tw-class on updating tailwind v4 */
  field-sizing: content;

  &:focus {
    @apply border-white/30;
  }

  &:placeholder {
    @apply text-gray-500;
  }
}

.widthButton {
  @apply bg-gray-900 text-gray-400;
  @apply w-6 h-6;
  @apply rounded border border-transparent;
  @apply transition-all duration-150;
  @apply cursor-pointer;

  &:hover:enabled {
    @apply bg-gray-600 text-white;
  }

  &:disabled {
    @apply cursor-not-allowed opacity-50 text-gray-600;
  }
}
</style>
