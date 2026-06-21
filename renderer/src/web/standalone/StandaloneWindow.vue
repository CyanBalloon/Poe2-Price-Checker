<template>
  <div class="flex h-screen w-screen bg-[#07080a] text-gray-100 font-sans overflow-hidden">
    <!-- Left Sidebar -->
    <div 
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      class="bg-[#0d0e12] border-r border-[#191b22] flex flex-col justify-between p-3 select-none shrink-0 transition-all duration-300 ease-in-out overflow-hidden"
      :class="isHovered ? 'w-64' : 'w-16'"
    >
      <div>
        <!-- App Title / Logo -->
        <div class="flex items-center mb-8 px-1">
          <div class="flex items-center w-full">
            <div 
              class="rounded-xl bg-gradient-to-tr from-violet-600 to-teal-400 p-[1px] flex items-center justify-center shadow-lg shadow-violet-950/20 shrink-0 transition-all duration-300 ease-out"
              :class="isHovered ? 'w-56 h-56' : 'w-8 h-8'"
            >
              <div class="w-full h-full bg-[#0d0e12] rounded-xl flex items-center justify-center overflow-hidden relative">
                <img 
                  src="/images/jeweler.png" 
                  class="animate-pulse transition-all duration-300 ease-out absolute inset-0 m-auto object-contain" 
                  :class="isHovered ? 'w-52 h-52' : 'w-5 h-5'"
                  alt="EE2" 
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="space-y-1">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full flex items-center px-2.5 py-3 rounded-xl text-sm transition-all duration-300 font-medium border border-transparent"
            :class="[
              activeTab === tab.id 
                ? 'bg-[#151722] text-[#8b5cf6] border-[#202334] shadow-inner shadow-black/40' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#111218]/50'
            ]"
          >
            <i :class="[tab.icon, 'text-base transition-colors w-5 text-center shrink-0', activeTab === tab.id ? 'text-[#8b5cf6]' : 'text-gray-500']"></i>
            <span 
              class="transition-all duration-300 overflow-hidden whitespace-nowrap"
              :class="isHovered ? 'opacity-100 max-w-[150px] ml-3' : 'opacity-0 max-w-0 ml-0'"
            >
              {{ tab.name }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Footer Info -->
      <div 
        class="border-t border-[#191b22] pt-4 px-2 text-[11px] text-gray-500 flex flex-col gap-2 transition-all duration-300 overflow-hidden"
        :class="isHovered ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 pt-0 border-t-transparent'"
      >
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
          <h1 class="text-base font-semibold tracking-wide text-gray-200 uppercase">{{ currentTabName }}</h1>
          
          <!-- Divine/Exalt Exchange Ratio (only on Price Check tab) -->
          <div 
            v-if="activeTab === 'price-check' && xchgRate" 
            class="flex items-center gap-2 bg-[#0e1017] border border-[#202334] rounded-xl px-2.5 py-1 text-xs text-gray-300 shadow-sm"
          >
            <div class="flex items-center gap-1 select-none border-r border-[#202334]/50 pr-2 mr-0.5">
              <span>1</span>
              <img src="/images/divine.png" class="w-4 h-4 object-contain" alt="Divine" />
              <span class="text-gray-500">=</span>
              <span class="font-bold text-teal-400 font-mono">{{ xchgRate }}</span>
              <img :src="xchgRateCurrency?.icon" class="w-4 h-4 object-contain" :alt="xchgRateCurrency?.text" />
            </div>

            <!-- Chaos to Exalt ratio -->
            <div v-if="chaosToExalt" class="flex items-center gap-1 select-none border-r border-[#202334]/50 pr-2 mr-0.5" title="Chaos to Exalt ratio">
              <span>1</span>
              <img src="/images/chaos.png" class="w-4 h-4 object-contain" alt="Chaos" />
              <span class="text-gray-500">=</span>
              <span class="font-bold text-teal-400 font-mono">{{ chaosToExalt.toFixed(1) }}</span>
              <img src="/images/exa.png" class="w-4 h-4 object-contain" alt="Exalted" />
            </div>

            <!-- Annulment to Exalt ratio -->
            <div v-if="annulToExalt" class="flex items-center gap-1 select-none pr-1" title="Annulment to Exalt ratio">
              <span>1</span>
              <img src="/images/annul.png" class="w-4 h-4 object-contain" alt="Annulment" />
              <span class="text-gray-500">=</span>
              <span class="font-bold text-teal-400 font-mono">{{ annulToExalt.toFixed(1) }}</span>
              <img src="/images/exa.png" class="w-4 h-4 object-contain" alt="Exalted" />
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
        
        <!-- Check for updates & League Dropdown Select -->
        <div class="flex items-center gap-3">
          <!-- Check for Update Button -->
          <button
            @click="handleUpdateButtonClick"
            class="px-3 py-1.5 border rounded-xl text-xs flex items-center gap-2 transition-all duration-200 shadow-sm z-50 relative font-medium"
            :class="updateButton.class"
            :title="updateButton.text"
          >
            <i :class="updateButton.icon"></i>
            <span>{{ updateButton.text }}</span>
          </button>

          <!-- Login Button -->
          <button
            v-if="isElectron"
            @click="handleLoginClick"
            class="px-3 py-1.5 bg-[#0e1017] hover:bg-[#151822] border border-[#202334] rounded-xl text-xs flex items-center gap-2 transition-all duration-200 shadow-sm z-50 relative font-medium"
            :class="isLoggedIn ? 'text-green-400 hover:text-green-300' : 'text-gray-300'"
          >
            <i :class="isLoggedIn ? 'fas fa-user-check' : 'fas fa-sign-in-alt'"></i>
            <span>{{ isLoggedIn ? 'Logged In' : 'Log in' }}</span>
          </button>

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
                <span>You can also press <kbd class="bg-[#1b1c26] border border-[#2c2e42] px-1 py-0.5 rounded text-gray-300 font-mono">{{ priceCheckHotkey }}</kbd> inside PoE2 to load item details instantly.</span>
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
        <div v-show="activeTab === 'search'" class="flex-1 flex flex-col min-h-0 w-full relative">
          <component 
            v-if="itemSearchWidgetConfig"
            :is="itemSearchComponent" 
            :config="itemSearchWidgetConfig" 
          />
        </div>


        <!-- Tab: Settings -->
        <div v-show="activeTab === 'settings'" class="flex-1 flex flex-col min-h-0 w-full relative">
          <component 
            v-if="settingsWidgetConfig"
            :is="settingsComponent" 
            :config="settingsWidgetConfig" 
          />
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
  onUnmounted,
  nextTick 
} from "vue";
import { registry } from "../overlay/widget-registry.js";
import { ItemCategory, ItemRarity, parseClipboard } from "@/parser";
import { AppConfig, saveConfig, pushHostConfig } from "@/web/Config";
import { Host } from "@/web/background/IPC";
import { useLeagues } from "@/web/background/Leagues";
import { usePoeninja } from "@/web/background/Prices";
import { useClientLog } from "@/web/client-log/client-log";
import type { WidgetManager } from "../overlay/interfaces";

export default defineComponent({
  setup() {
    // Run core background services
    const {
      xchgRate,
      xchgRateCurrency,
      forceLoad,
      isLoading: isNinjaLoading,
      chaosToExalt,
      annulToExalt,
    } = usePoeninja();
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
      if (e.isManual) return;
      if (e.target === "price-check") {
        const parsed = parseClipboard(e.clipboard);
        if (parsed.isOk()) {
          const item = parsed.value;
          const isUnidentifiedUnique = item.isUnidentified && item.rarity === ItemRarity.Unique;
          const isUnique = item.rarity === ItemRarity.Unique && !isUnidentifiedUnique;
          const isLineageSupport = item.category === ItemCategory.Gem && (item.info.icon?.includes('/Lineage') ?? false);
          const isListingsDisabled = 
            item.category === ItemCategory.Currency ||
            isLineageSupport ||
            item.info.tradeTag != null ||
            isUnique;

          if (isListingsDisabled) {
            activeTab.value = "search";
            nextTick(() => {
              window.dispatchEvent(new CustomEvent("add-search-item", { detail: item }));
            });
            return;
          } else {
            activeTab.value = "price-check";
          }
        }
        manualItemText.value = e.clipboard;
        handleManualPaste();
      }
    });

    // Tabs setup
    const activeTab = ref("price-check");

    const handleTabChange = (e: Event) => {
      const targetTab = (e as CustomEvent).detail;
      if (targetTab) {
        activeTab.value = targetTab;
      }
    };
    window.addEventListener("change-tab", handleTabChange);
    onUnmounted(() => {
      window.removeEventListener("change-tab", handleTabChange);
    });
    const isHovered = ref(false);
    const tabs = [
      { id: "price-check", name: "Price Check", icon: "fas fa-search-dollar" },
      { id: "search", name: "Item Search", icon: "fas fa-search" },
      { id: "settings", name: "Settings", icon: "fas fa-cog" },
    ];

    const currentTabName = computed(() => {
      return tabs.find(t => t.id === activeTab.value)?.name || "";
    });

    const version = computed(() => Host.version.value);
    const leagueId = computed(() => AppConfig().leagueId);

    function checkForUpdates() {
      console.log("checkForUpdates logic triggered");
      Host.sendEvent({
        name: "CLIENT->MAIN::user-action",
        payload: { action: "check-for-update" },
      });
    }

    function openDownloadPage() {
      console.log("openDownloadPage logic triggered");
      window.open("https://github.com/CyanBalloon/Poe2-Price-Checker/releases");
    }

    function quitAndInstall() {
      console.log("quitAndInstall logic triggered");
      Host.sendEvent({
        name: "CLIENT->MAIN::user-action",
        payload: { action: "update-and-restart" },
      });
    }

    function handleUpdateButtonClick() {
      console.log("handleUpdateButtonClick fired! Current update state is:", Host.updateInfo.value.state);
      if (updateButton.value && typeof updateButton.value.action === "function") {
        updateButton.value.action();
      }
    }

    const showUpToDate = ref(false);
    let upToDateTimeout: ReturnType<typeof setTimeout> | null = null;

    watch(() => Host.updateInfo.value.state, (newState) => {
      if (newState === "update-not-available") {
        showUpToDate.value = true;
        if (upToDateTimeout) clearTimeout(upToDateTimeout);
        upToDateTimeout = setTimeout(() => {
          showUpToDate.value = false;
        }, 5000);
      }
    });

    const updateButton = computed(() => {
      const info = Host.updateInfo.value;
      if (info.state === "checking-for-update") {
        return {
          text: "Checking...",
          icon: "fas fa-sync-alt animate-spin text-teal-400",
          class: "bg-[#0e1017] border-[#202334] text-gray-400 cursor-not-allowed",
          action: () => {},
        };
      }
      if (info.state === "update-downloaded") {
        return {
          text: "Restart to Update",
          icon: "fas fa-check-circle text-green-400",
          class: "bg-[#16a34a]/20 border-green-500/50 hover:bg-[#16a34a]/30 text-green-200 animate-pulse",
          action: quitAndInstall,
        };
      }
      if (info.state === "update-available") {
        if (info.noDownloadReason) {
          return {
            text: `Update Available (v${info.version})`,
            icon: "fas fa-cloud-download-alt text-teal-400",
            class: "bg-teal-500/10 border-teal-500/30 hover:bg-teal-500/20 text-teal-300",
            action: openDownloadPage,
          };
        }
        return {
          text: "Downloading Update...",
          icon: "fas fa-arrow-down animate-bounce text-teal-400",
          class: "bg-teal-500/10 border-teal-500/30 text-teal-300 cursor-not-allowed",
          action: () => {},
        };
      }
      if (info.state === "error") {
        return {
          text: "Check Error",
          icon: "fas fa-exclamation-triangle text-amber-500",
          class: "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-300",
          action: checkForUpdates,
        };
      }
      if (showUpToDate.value) {
        return {
          text: "Up to Date",
          icon: "fas fa-check text-teal-400",
          class: "bg-[#0e1017] border-teal-500/30 text-teal-300",
          action: checkForUpdates,
        };
      }
      return {
        text: "Check for Update",
        icon: "fas fa-cloud-download-alt text-teal-400",
        class: "bg-[#0e1017] border-[#202334] hover:bg-[#151822] text-gray-300",
        action: checkForUpdates,
      };
    });

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

    const isLoggedIn = computed(() => Host.isLoggedIn.value);
    const isElectron = computed(() => Host.isElectron);

    function handleLoginClick() {
      if (Host.isLoggedIn.value) {
        Host.sendEvent({
          name: "CLIENT->MAIN::user-action",
          payload: { action: "poe-logout" }
        });
      } else {
        Host.sendEvent({
          name: "CLIENT->MAIN::user-action",
          payload: { action: "poe-login" }
        });
      }
    }

    const priceCheckHotkey = computed(() => {
      const pc = priceCheckWidgetConfig.value;
      if (!pc) return "Ctrl + D";
      const hold = pc.hotkeyHold;
      const key = pc.hotkey;
      if (!key) return "None";
      return hold && hold !== "None" ? `${hold} + ${key}` : key;
    });

    onMounted(() => {
      nextTick(() => {
        // Notify host we are running in standalone mode (not transparent overlay)
        Host.sendEvent({
          name: "CLIENT->MAIN::used-recently",
          payload: { isOverlay: false },
        });
        pushHostConfig();
      });
    });

    return {
      activeTab,
      tabs,
      currentTabName,
      version,
      leagueId,
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
      chaosToExalt,
      annulToExalt,
      forceLoad,
      isNinjaLoading,
      isLeagueDropdownOpen,
      tradeLeagues,
      selectLeague,
      isHovered,
      updateButton,
      handleUpdateButtonClick,
      priceCheckHotkey,
      isLoggedIn,
      isElectron,
      handleLoginClick,
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
