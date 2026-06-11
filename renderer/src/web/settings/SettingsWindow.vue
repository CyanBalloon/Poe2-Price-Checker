<template>
  <div
    :class="isStandalone ? 'flex flex-col w-full h-full bg-[#07080a]' : $style.window"
    class="grow layout-column"
  >
    <AppTitleBar v-if="!isStandalone" @close="cancel" :title="t('settings.title')" />
    
    <div class="flex-1 flex flex-col p-8" :class="isStandalone ? 'bg-[#07080a]' : 'bg-[#0e1017]'">
      <h2 class="text-xl font-bold tracking-wide text-gray-200 mb-6 uppercase">General Settings</h2>
      
      <div class="max-w-xl bg-[#0d0e12]/60 border border-[#191b22] rounded-2xl p-6 shadow-lg">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-300">Application Theme</span>
            <span class="text-xs text-gray-500 mt-1">Customize the visual appearance of the application.</span>
          </div>
          <select 
            v-model="theme" 
            class="bg-[#151722] border border-[#202334] rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all outline-none cursor-pointer"
          >
            <option value="default">Default Modern</option>
            <option value="dark-fantasy">Dark Fantasy</option>
          </select>
        </div>
      </div>
      
      <!-- Save / Cancel Buttons at the bottom -->
      <div class="mt-auto pt-6 flex justify-end gap-3 border-t border-[#191b22]/50">
        <button @click="save" class="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white tracking-wide transition-all shadow-md shadow-purple-900/20">
          {{ t("Save") }}
        </button>
        <button @click="cancel" class="px-6 py-2.5 bg-[#151722] hover:bg-[#1f2233] border border-[#222538]/60 rounded-xl text-xs font-semibold text-gray-300 transition-colors">
          {{ t("Cancel") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  shallowRef,
  computed,
  PropType,
  nextTick,
  inject,
  reactive,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import {
  AppConfig,
  updateConfig,
  saveConfig,
  pushHostConfig,
  Config,
} from "@/web/Config";
import type {
  Widget,
  WidgetManager,
  WidgetSpec,
} from "@/web/overlay/interfaces";
import AppTitleBar from "@/web/ui/AppTitlebar.vue";

export default defineComponent({
  widget: {
    type: "settings",
    instances: "single",
    initInstance: () => {
      return {
        wmId: 0,
        wmType: "settings",
        wmTitle: "{icon=fa-cog}",
        wmWants: "hide",
        wmZorder: "exclusive",
        wmFlags: ["invisible-on-blur", "ignore-ui-visibility"],
      };
    },
  } satisfies WidgetSpec,
  components: { AppTitleBar },
  props: {
    config: {
      type: Object as PropType<Widget>,
      required: true,
    },
  },
  setup(props) {
    const wm = inject<WidgetManager>("wm")!;
    const { t } = useI18n();

    nextTick(() => {
      props.config.wmWants = "hide";
    });

    const configClone = shallowRef<Config | null>(null);
    const isStandalone = computed(() => {
      const params = new URLSearchParams(window.location.search);
      return params.get("mode") === "standalone";
    });

    watch(
      () => props.config.wmWants,
      (wmWants) => {
        if (wmWants === "show") {
          configClone.value = reactive(JSON.parse(JSON.stringify(AppConfig())));
        } else {
          configClone.value = null;
        }
      },
    );

    const theme = computed<Config["theme"]>({
      get() {
        return configClone.value?.theme || "default";
      },
      set(value) {
        if (configClone.value) {
          configClone.value.theme = value;
        }
        AppConfig().theme = value;
      },
    });

    return {
      t,
      theme,
      save() {
        if (configClone.value) {
          updateConfig(configClone.value);
        }
        saveConfig();
        pushHostConfig();

        wm.hide(props.config.wmId);
      },
      cancel() {
        wm.hide(props.config.wmId);
      },
      isStandalone,
    };
  },
});
</script>

<style lang="postcss" module>
.window {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: 45rem;
  max-height: 30rem;
  overflow: hidden;
  @apply bg-[#0e1017];
  @apply border border-[#191b22];
  @apply shadow-2xl shadow-black/80;
  @apply rounded-2xl;
  margin-top: 5rem;

  &:global {
    animation-name: slideInDown;
    animation-duration: 0.5s;
  }
}
</style>
