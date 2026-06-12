<template>
  <div
    :class="isStandalone ? 'flex flex-col w-full h-full bg-[#07080a]' : $style.window"
    class="grow layout-column"
  >
    <AppTitleBar v-if="!isStandalone" @close="close" :title="t('settings.title')" />
    
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
            class="bg-[#151722] border border-[#202334] rounded-xl pl-4 pr-8 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all cursor-pointer"
          >
            <option value="default">Default Modern</option>
            <option value="dark-fantasy">Dark Fantasy</option>
          </select>
        </div>
      </div>
      
      <!-- Hotkeys Section -->
      <div class="mt-6 max-w-xl bg-[#0d0e12]/60 border border-[#191b22] rounded-2xl p-6 shadow-lg">
        <h3 class="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Hotkeys</h3>
        <div class="flex flex-col gap-4 text-sm text-gray-400">
          <SettingsHotkey v-for="(hk, i) in hotkeys" :key="i" :schema="hk" />
        </div>
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
import SettingsHotkey from "./SettingsHotkey.vue";
import { _configModelValue } from "./utils";

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
  components: { AppTitleBar, SettingsHotkey },
  props: {
    config: {
      type: Object as PropType<Widget>,
      required: true,
    },
  },
  setup(props) {
    const wm = inject<WidgetManager>("wm")!;
    const { t } = useI18n();

    const isStandalone = computed(() => {
      const params = new URLSearchParams(window.location.search);
      return params.get("mode") === "standalone";
    });

    nextTick(() => {
      if (!isStandalone.value) {
        props.config.wmWants = "hide";
      }
    });

    const configClone = shallowRef<Config | null>(
      isStandalone.value ? reactive(JSON.parse(JSON.stringify(AppConfig()))) : null
    );

    watch(
      () => props.config.wmWants,
      (wmWants) => {
        if (wmWants === "show") {
          configClone.value = reactive(JSON.parse(JSON.stringify(AppConfig())));
        } else if (!isStandalone.value) {
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

    const hotkeys = computed(() => {
      if (!configClone.value) return [];
      const hideoutCmd = configClone.value.commands.find((c: any) => c.text === '/hideout');
      const priceCheckWidget = configClone.value.widgets.find((w: any) => w.wmType === 'price-check');
      return [
        {
          translationKey: "Price Check",
          config: {
            modKey: _configModelValue(priceCheckWidget, "hotkeyHold"),
            nonModKey: _configModelValue(priceCheckWidget, "hotkey"),
          },
        },
        {
          translationKey: "Go To Hideout",
          config: _configModelValue(hideoutCmd, "hotkey"),
        }
      ];
    });

    watch(
      () => configClone.value,
      (newVal) => {
        if (newVal) {
          updateConfig(newVal);
          saveConfig();
          pushHostConfig();
        }
      },
      { deep: true }
    );

    return {
      t,
      theme,
      hotkeys,
      close() {
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
