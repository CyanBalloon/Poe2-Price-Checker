<template>
  <div class="flex h-screen w-screen bg-[#07080a] text-gray-100 font-sans overflow-hidden">
    <!-- Left Sidebar -->
    <div v-show="!isSidebarCollapsed" class="w-64 bg-[#0d0e12] border-r border-[#191b22] flex flex-col justify-between p-5 select-none shrink-0">
      <div>
        <!-- App Title / Logo -->
        <div class="flex items-center justify-between mb-8 px-2">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-teal-400 p-[1px] flex items-center justify-center shadow-lg shadow-violet-950/20">
              <div class="w-full h-full bg-[#0d0e12] rounded-lg flex items-center justify-center">
                <img src="/images/jeweler.png" class="w-5 h-5 animate-pulse" alt="EE2" />
              </div>
            </div>
            <span class="text-sm font-semibold tracking-wider bg-gradient-to-r from-violet-400 via-indigo-200 to-teal-300 bg-clip-text text-transparent">
              EXILED EXCHANGE 2
            </span>
          </div>
          
          <button 
            @click="isSidebarCollapsed = true"
            class="text-gray-500 hover:text-gray-300 transition-colors p-1"
            title="Collapse Sidebar"
          >
            <i class="fas fa-chevron-left text-xs"></i>
          </button>
        </div>

        <!-- Navigation Tabs -->
        <nav class="space-y-1">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm transition-all duration-300 font-medium border border-transparent',
              activeTab === tab.id 
                ? 'bg-[#151722] text-[#8b5cf6] border-[#202334] shadow-inner shadow-black/40' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#111218]/50'
            ]"
          >
            <i :class="[tab.icon, 'text-base transition-colors', activeTab === tab.id ? 'text-[#8b5cf6]' : 'text-gray-500']"></i>
            <span>{{ tab.name }}</span>
          </button>
        </nav>
      </div>

      <!-- Footer Info -->
      <div class="border-t border-[#191b22] pt-4 px-2 text-[11px] text-gray-500 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span>Version</span>
          <span class="font-mono text-gray-400">{{ version }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>Active League</span>
          <span v-if="leagueId" class="flex items-center gap-1.5 text-teal-400 font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            {{ leagueId }}
          </span>
          <span v-else class="text-red-400">None</span>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 bg-[#07080a]">
      <!-- Header -->
      <header class="h-16 border-b border-[#191b22] flex items-center justify-between px-8 select-none bg-[#090a0e]/40 backdrop-blur-md shrink-0 z-30 relative">
        <div class="flex items-center gap-6">
          <!-- Expand Button (only when sidebar is collapsed) -->
          <button 
            v-if="isSidebarCollapsed" 
            @click="isSidebarCollapsed = false"
            class="text-gray-400 hover:text-white transition-colors mr-2 p-1 flex items-center justify-center bg-[#151722] hover:bg-[#1f2234] border border-[#202334] rounded-lg w-8 h-8"
            title="Expand Sidebar"
          >
            <i class="fas fa-chevron-right text-xs"></i>
          </button>
          
          <h1 class="text-base font-semibold tracking-wide text-gray-200 uppercase">{{ currentTabName }}</h1>
          
          <!-- Divine/Exalt Exchange Ratio (only on Price Check tab) -->
          <div 
            v-if="activeTab === 'price-check' && xchgRate" 
            class="flex items-center gap-2 bg-[#0e1017] border border-[#202334] rounded-xl px-2.5 py-1 text-xs text-gray-300 shadow-sm"
          >
            <div class="flex items-center gap-1 select-none">
              <span>1</span>
              <img src="/images/divine.png" class="w-4 h-4 object-contain" alt="Divine" />
              <span class="text-gray-500">=</span>
              <span class="font-bold text-teal-400 font-mono">{{ xchgRate }}</span>
              <img :src="xchgRateCurrency?.icon" class="w-4 h-4 object-contain" :alt="xchgRateCurrency?.text" />
            </div>
            
            <button 
              @click="forceLoad" 
              class="text-gray-500 hover:text-teal-400 transition-colors p-0.5 flex items-center"
              :class="{ 'animate-spin': isNinjaLoading }"
              title="Refresh price rates"
            >
              <i class="fas fa-sync-alt text-[9px]"></i>
            </button>
          </div>
        </div>
        
        <!-- League Dropdown Select -->
        <div class="relative">
          <button 
            @click="isLeagueDropdownOpen = !isLeagueDropdownOpen" 
            class="px-4 py-1.5 bg-[#0e1017] hover:bg-[#151822] border border-[#202334] rounded-xl text-xs flex items-center gap-2 text-gray-300 transition-all duration-200 shadow-sm shadow-black/50 z-50 relative"
          >
            <i class="fas fa-globe text-teal-400"></i>
            <span>{{ leagueId || 'Select League' }}</span>
            <i class="fas fa-chevron-down text-[10px] text-gray-500 ml-1"></i>
          </button>
          
          <!-- Dropdown overlay to close on click outside -->
          <div v-if="isLeagueDropdownOpen" class="fixed inset-0 z-40" @click="isLeagueDropdownOpen = false"></div>
          
          <!-- Dropdown Options Menu -->
          <div 
            v-if="isLeagueDropdownOpen" 
            class="absolute right-0 top-11 w-56 bg-[#0d0e12] border border-[#202334] rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden duration-200"
          >
            <button 
              v-for="league in tradeLeagues" 
              :key="league.id"
              @click="selectLeague(league.id)"
              :class="[
                'w-full text-left px-4 py-2 text-xs transition-colors duration-150',
                league.id === leagueId 
                  ? 'bg-[#151722] text-[#8b5cf6] font-medium' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#111218]/50'
              ]"
            >
              {{ league.text }}
            </button>
          </div>
        </div>
      </header>

      <!-- Panel Content -->
      <main class="flex-1 overflow-hidden relative flex flex-col p-6">
        <!-- Tab: Price Check -->
        <div v-show="activeTab === 'price-check'" class="flex-1 flex flex-col gap-6 min-h-0">
          <div class="bg-[#0d0e12]/60 border border-[#191b22] rounded-2xl p-5 flex flex-col gap-3 shadow-md shadow-black/20 shrink-0">
            <div class="flex items-center justify-between cursor-pointer select-none" @click="isPasteCollapsed = !isPasteCollapsed">
              <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paste Item Text</h2>
              <button class="text-gray-400 hover:text-gray-200 transition-colors text-[10px] flex items-center gap-1.5">
                <span>{{ isPasteCollapsed ? 'Expand' : 'Collapse' }}</span>
                <i :class="['fas', isPasteCollapsed ? 'fa-chevron-down' : 'fa-chevron-up']"></i>
              </button>
            </div>
            <div v-show="!isPasteCollapsed" class="flex flex-col gap-3">
              <div class="relative">
                <textarea
                  v-model="manualItemText"
                  @keydown.enter.prevent="handleManualPaste"
                  placeholder="Paste item text here (or press Enter to search)..."
                  class="w-full h-20 bg-[#07080a] border border-[#202334] rounded-xl p-3 text-xs font-mono text-gray-300 placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300 resize-none"
                ></textarea>
                <button 
                  @click="handleManualPaste"
                  class="absolute right-3 bottom-3 px-3 py-1 bg-violet-600 hover:bg-violet-500 rounded-lg text-[10px] font-semibold text-white tracking-wide transition-colors"
                >
                  CHECK
                </button>
              </div>
              <div class="text-[11px] text-gray-500 flex items-center gap-1.5">
                <i class="fas fa-info-circle text-violet-400"></i>
                <span>You can also press <kbd class="bg-[#1b1c26] border border-[#2c2e42] px-1 py-0.5 rounded text-gray-300 font-mono">Ctrl + C</kbd> inside PoE2 to load item details instantly.</span>
              </div>
            </div>
          </div>

          <!-- Display PriceCheckWindow -->
          <div class="flex-1 min-h-0 relative border border-[#191b22] rounded-2xl bg-[#0d0e12]/30 backdrop-blur-md overflow-hidden">
            <!-- If no item has been parsed yet -->
            <div v-show="!hasActivePriceCheck" class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center select-none">
              <div class="w-16 h-16 rounded-full bg-violet-500/5 flex items-center justify-center mb-4 border border-violet-500/10">
                <i class="fas fa-search-dollar text-[#8b5cf6] text-2xl"></i>
              </div>
              <h3 class="text-sm font-semibold text-gray-300">No Item Checked Yet</h3>
              <p class="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
                Copy item stats in Path of Exile 2 or paste the item descriptor block above to view local pricing analysis.
              </p>
            </div>
            
            <!-- Real widget component loaded -->
            <component 
              v-show="hasActivePriceCheck"
              :is="priceCheckComponent" 
              :config="priceCheckWidgetConfig" 
            />
          </div>
        </div>

        <!-- Tab: Search -->
        <div v-show="activeTab === 'search'" class="flex-1 flex flex-col min-h-0 max-w-3xl mx-auto w-full">
          <div class="flex-1 border border-[#191b22] rounded-2xl bg-[#0d0e12]/30 backdrop-blur-md overflow-hidden flex flex-col p-4">
            <component 
              v-if="itemSearchWidgetConfig"
              :is="itemSearchComponent" 
              :config="itemSearchWidgetConfig" 
            />
          </div>
        </div>

        <!-- Tab: Logs -->
        <div v-show="activeTab === 'logs'" class="flex-1 flex flex-col min-h-0">
          <div class="flex-1 bg-[#07080a] border border-[#191b22] rounded-2xl p-5 font-mono text-xs overflow-hidden flex flex-col shadow-md shadow-black/20">
            <div class="flex items-center justify-between border-b border-[#191b22] pb-3 mb-4 select-none shrink-0">
              <span class="text-xs font-semibold uppercase text-violet-400 tracking-wider">Client and System Logs</span>
              <button @click="clearLogsText" class="px-3 py-1 bg-[#13151f] hover:bg-[#1a1c2a] border border-[#202334] rounded-lg text-[10px] text-gray-400 hover:text-gray-200 transition-colors">
                Clear View
              </button>
            </div>
            <div class="flex-1 overflow-auto select-text text-gray-400 font-mono text-xs pr-2 leading-relaxed">
              <pre class="whitespace-pre-wrap">{{ logsTextToShow }}</pre>
            </div>
          </div>
        </div>

        <!-- Tab: Settings -->
        <div v-show="activeTab === 'settings'" class="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full">
          <div class="flex-1 border border-[#191b22] rounded-2xl bg-[#0d0e12]/30 backdrop-blur-md overflow-hidden p-6">
            <component 
              v-if="settingsWidgetConfig"
              :is="settingsComponent" 
              :config="settingsWidgetConfig" 
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { 
  defineComponent, 
  ref, 
  computed, 
  provide, 
  shallowRef, 
  watch, 
  onMounted, 
  nextTick 
} from "vue";
import { registry } from "../overlay/widget-registry.js";
import { AppConfig, saveConfig } from "@/web/Config";
import { Host } from "@/web/background/IPC";
import { useLeagues } from "@/web/background/Leagues";
import { usePoeninja } from "@/web/background/Prices";
import { useClientLog } from "@/web/client-log/client-log";
import type { WidgetManager } from "../overlay/interfaces";

export default defineComponent({
  setup() {
    // Run core background services
    const { xchgRate, xchgRateCurrency, forceLoad, isLoading: isNinjaLoading } = usePoeninja();
    const leagues = useLeagues();
    leagues.load();
    const { handleLine } = useClientLog();

    const isLeagueDropdownOpen = ref(false);
    const tradeLeagues = computed(() => leagues.list.value);
    function selectLeague(id: string) {
      leagues.selectedId.value = id;
      saveConfig();
      isLeagueDropdownOpen.value = false;
    }

    // Game log parsing queue
    const lineQueue: string[] = [];
    let processing = false;
    Host.onEvent("MAIN->CLIENT::game-log", (e) => {
      lineQueue.push(...e.lines);
      processQueue();
    });
    function processQueue() {
      if (processing) return;
      processing = true;
      while (lineQueue.length) {
        handleLine(lineQueue.shift()!);
      }
      processing = false;
    }

    Host.onEvent("MAIN->CLIENT::item-text", (e) => {
      if (e.target === "price-check") {
        manualItemText.value = e.clipboard;
        handleManualPaste();
      }
    });

    // Tabs setup
    const activeTab = ref("price-check");
    const isSidebarCollapsed = ref(false);
    const tabs = [
      { id: "price-check", name: "Price Check", icon: "fas fa-search-dollar" },
      { id: "search", name: "Item Search", icon: "fas fa-search" },
      { id: "logs", name: "System Logs", icon: "fas fa-file-alt" },
      { id: "settings", name: "Settings", icon: "fas fa-cog" },
    ];

    const currentTabName = computed(() => {
      return tabs.find(t => t.id === activeTab.value)?.name || "";
    });

    const version = computed(() => Host.version.value);
    const leagueId = computed(() => AppConfig().leagueId);

    // Custom logs clearing
    const clearedLogsOffset = ref(0);
    const logsTextToShow = computed(() => {
      const fullLogs = Host.logs.value;
      if (clearedLogsOffset.value >= fullLogs.length) return "";
      return fullLogs.slice(clearedLogsOffset.value);
    });
    function clearLogsText() {
      clearedLogsOffset.value = Host.logs.value.length;
    }

    // Manual input parsing
    const manualItemText = ref("");
    const isPasteCollapsed = ref(false);
    function handleManualPaste() {
      const text = manualItemText.value.trim();
      if (!text) return;

      Host.selfDispatch({
        name: "MAIN->CLIENT::item-text",
        payload: {
          target: "price-check",
          clipboard: text,
          position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
          focusOverlay: true,
          isManual: true,
        },
      });

      manualItemText.value = "";
      isPasteCollapsed.value = true;
    }

    // Widget Configurations
    const priceCheckWidgetConfig = computed(() => AppConfig("price-check")!);
    const itemSearchWidgetConfig = computed(() => AppConfig("item-search")!);
    const settingsWidgetConfig = computed(() => AppConfig("settings")!);

    // Check if price-check is open/showing
    const hasActivePriceCheck = computed(() => {
      return priceCheckWidgetConfig.value && priceCheckWidgetConfig.value.wmWants === "show";
    });

    // Auto-focus tab to Price Check when items are parsed/searched
    watch(hasActivePriceCheck, (isActive) => {
      if (isActive) {
        activeTab.value = "price-check";
        isPasteCollapsed.value = true;
      }
    });

    // Get Components from Registry
    const priceCheckComponent = computed(() => registry.getWidgetComponent("price-check"));
    const itemSearchComponent = computed(() => registry.getWidgetComponent("item-search"));
    const settingsComponent = computed(() => registry.getWidgetComponent("settings"));

    // Provide custom WidgetManager to avoid overlay positioning or auto-hiding
    const size = shallowRef({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    window.addEventListener("resize", () => {
      size.value = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    });

    function show(wmId: number) {
      const w = AppConfig().widgets.find((_) => _.wmId === wmId);
      if (w) w.wmWants = "show";
    }

    function hide(wmId: number) {
      const w = AppConfig().widgets.find((_) => _.wmId === wmId);
      if (w) w.wmWants = "hide";
    }

    function remove(wmId: number) {
      AppConfig().widgets = AppConfig().widgets.filter((_) => _.wmId !== wmId);
    }

    function setFlag(wmId: number, flag: string, state: boolean) {
      const widget = AppConfig().widgets.find((_) => _.wmId === wmId);
      if (!widget) return false;
      const hasFlag = widget.wmFlags.includes(flag);
      if (state === false && hasFlag === true) {
        widget.wmFlags = widget.wmFlags.filter((_) => _ !== flag);
        return true;
      }
      if (state === true && hasFlag === false) {
        widget.wmFlags.push(flag);
        return true;
      }
      return false;
    }

    provide<WidgetManager>("wm", {
      poePanelWidth: computed(() => 0),
      size,
      active: computed(() => true), // Always active in standalone mode
      widgets: computed(() => AppConfig().widgets),
      show,
      hide,
      remove,
      bringToTop() {},
      create() {},
      setFlag,
    });

    // Custom league selection redirect
    function openLeagueSelection() {
      const settings = settingsWidgetConfig.value;
      const priceCheck = priceCheckWidgetConfig.value;
      if (settings && priceCheck) {
        setFlag(settings.wmId, `settings::widget=${priceCheck.wmId}`, true);
        activeTab.value = "settings";
      }
    }

    onMounted(() => {
      nextTick(() => {
        // Notify host we are running in standalone mode (not transparent overlay)
        Host.sendEvent({
          name: "CLIENT->MAIN::used-recently",
          payload: { isOverlay: false },
        });
      });
    });

    return {
      activeTab,
      tabs,
      currentTabName,
      version,
      leagueId,
      logsTextToShow,
      clearLogsText,
      manualItemText,
      handleManualPaste,
      isPasteCollapsed,
      priceCheckWidgetConfig,
      itemSearchWidgetConfig,
      settingsWidgetConfig,
      hasActivePriceCheck,
      priceCheckComponent,
      itemSearchComponent,
      settingsComponent,
      openLeagueSelection,
      xchgRate,
      xchgRateCurrency,
      forceLoad,
      isNinjaLoading,
      isLeagueDropdownOpen,
      tradeLeagues,
      selectLeague,
      isSidebarCollapsed,
    };
  },
});
</script>

<style scoped>
/* Sleek custom styling for dark standalone */
textarea::placeholder {
  color: #4a4d62;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #07080a;
}

::-webkit-scrollbar-thumb {
  background: #202334;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #2b2e45;
}
</style>
