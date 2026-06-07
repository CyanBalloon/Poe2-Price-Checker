<template>
  <div v-if="!error && isStandalone" class="flex flex-col gap-4 w-full h-full min-h-0 text-gray-200">
    <!-- Header/matched indicator -->
    <div class="flex items-center justify-between text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 select-none shrink-0">
      <div class="flex items-center gap-1 bg-[#14151b] border border-[#222538]/60 rounded-xl p-1">
        <button
          v-for="curr in ['xchgExalted', 'xchgChaos', 'xchgStable']"
          :key="curr"
          @click="selectedCurr = curr"
          :class="[
            'px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all duration-200 flex items-center gap-1.5',
            selectedCurr === curr 
              ? 'bg-violet-600 border border-violet-500 text-white shadow-sm' 
              : 'text-gray-400 hover:text-gray-200 bg-transparent border border-transparent'
          ]"
        >
          <img 
            :src="curr === 'xchgExalted' ? '/images/exa.png' : curr === 'xchgChaos' ? '/images/chaos.png' : '/images/divine.png'" 
            class="w-4.5 h-4.5" 
          />
          <span>{{ result ? (result[curr].listed.value?.total ?? "?") : "?" }}</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <online-filter :filters="filters" api="bulk" />
      </div>
    </div>

    <!-- Listings list -->
    <div class="flex-grow flex flex-col gap-2.5 overflow-y-auto overflow-x-hidden pr-1">
      <template v-for="(res, idx) in selectedResults">
        <!-- Loader / skeleton row if not ready -->
        <div 
          v-if="!res" 
          :key="`skele-${idx}`"
          class="h-14 rounded-xl bg-[#0f111a]/40 animate-pulse border border-[#1b1c26]/20 shrink-0"
        />
        
        <!-- Premium modern card for each bulk listing -->
        <trade-bulk-row 
          v-else
          :key="res.id"
          :res="res"
          :selected-curr="selectedCurr"
          :show-seller="showSeller"
          @open-link="openTradeLink"
        />
      </template>
    </div>
  </div>

  <div v-else-if="!error" class="layout-column min-h-0" style="height: auto">
    <!-- @TODO: fix "Matched" text jumping (min-height: 22px) -->
    <div
      class="mb-2 flex pl-2 justify-between items-baseline"
      style="min-height: 1.375rem"
    >
      <div class="flex items-center text-gray-500">
        <span class="mr-1">{{ t(":matched") }}</span>
        <span v-if="!result" class="text-gray-600">...</span>
        <div v-else class="flex items-center">
          <button
            class="btn flex items-center mr-1"
            :style="{
              background:
                selectedCurr !== 'xchgExalted' ? 'transparent' : undefined,
            }"
            @click="selectedCurr = 'xchgExalted'"
          >
            <img src="/images/exa.png" class="trade-bulk-currency-icon" />
            <span>{{ result.xchgExalted.listed.value?.total ?? "?" }}</span>
          </button>
          <button
            class="btn flex items-center mr-1"
            :style="{
              background:
                selectedCurr !== 'xchgChaos' ? 'transparent' : undefined,
            }"
            @click="selectedCurr = 'xchgChaos'"
          >
            <img src="/images/chaos.png" class="trade-bulk-currency-icon" />
            <span>{{ result.xchgChaos.listed.value?.total ?? "?" }}</span>
          </button>
          <button
            class="btn flex items-center mr-1"
            :style="{
              background:
                selectedCurr !== 'xchgStable' ? 'transparent' : undefined,
            }"
            @click="selectedCurr = 'xchgStable'"
          >
            <img src="/images/divine.png" class="trade-bulk-currency-icon" />
            <span>{{ result.xchgStable.listed.value?.total ?? "?" }}</span>
          </button>
          <span class="ml-1"
            ><online-filter :filters="filters" api="bulk"
          /></span>
        </div>
      </div>
      <trade-links v-if="result" :get-link="makeTradeLink" />
    </div>
    <div class="layout-column overflow-y-auto overflow-x-hidden">
      <table class="table-stripped w-full">
        <thead>
          <tr class="text-left">
            <th class="trade-table-heading">
              <div class="px-2">{{ t(":price") }}</div>
            </th>
            <th class="trade-table-heading">
              <div
                class="pl-1 pr-2 flex text-xs"
                style="line-height: 1.3125rem"
              >
                <span class="w-8 inline-block text-right -ml-px mr-px">{{
                  selectedCurr === "xchgExalted"
                    ? "exalt"
                    : selectedCurr === "xchgChaos"
                      ? "chaos"
                      : "div"
                }}</span
                ><span>{{ "\u2009" }}/{{ "\u2009" }}</span
                ><span class="w-8 inline-block">{{ t(":bulk") }}</span>
              </div>
            </th>
            <th class="trade-table-heading">
              <div class="px-1">{{ t(":stock") }}</div>
            </th>
            <th class="trade-table-heading">
              <div class="px-1">{{ t(":fulfill") }}</div>
            </th>
            <th class="trade-table-heading" :class="{ 'w-full': !showSeller }">
              <div class="pr-2 pl-4">
                <span class="ml-1" style="padding-left: 0.375rem">{{
                  t(":listed")
                }}</span>
              </div>
            </th>
            <th v-if="showSeller" class="trade-table-heading w-full">
              <div class="px-2">{{ t(":seller") }}</div>
            </th>
          </tr>
        </thead>
        <tbody style="overflow: scroll">
          <template v-for="(result, idx) in selectedResults">
            <tr v-if="!result" :key="idx">
              <td colspan="100" class="text-transparent">***</td>
            </tr>
            <tr v-else :key="result.id">
              <td class="px-2">
                {{
                  Number((result.exchangeAmount / result.itemAmount).toFixed(4))
                }}
              </td>
              <td class="pl-1 whitespace-nowrap">
                <span class="w-8 inline-block text-right">{{
                  result.exchangeAmount
                }}</span
                ><span>{{ "\u2009" }}/{{ "\u2009" }}</span
                ><span class="w-8 inline-block">{{ result.itemAmount }}</span>
              </td>
              <td class="px-1 text-right">{{ result.stock }}</td>
              <td class="px-1 text-right">
                <i
                  v-if="result.stock < result.itemAmount"
                  class="fas fa-exclamation-triangle mr-1 text-gray-500"
                ></i
                >{{ Math.floor(result.stock / result.itemAmount) }}
              </td>
              <td class="pr-2 pl-4 whitespace-nowrap">
                <div class="inline-flex items-center">
                  <div
                    class="account-status"
                    :class="result.accountStatus"
                  ></div>
                  <div class="ml-1 font-sans text-xs">
                    {{ result.relativeDate }}
                  </div>
                </div>
                <span
                  v-if="!showSeller && result.isMine"
                  class="rounded px-1 text-gray-800 bg-gray-400 ml-1"
                  >{{ t("You") }}</span
                >
              </td>
              <td v-if="showSeller" class="px-2 whitespace-nowrap">
                <span
                  v-if="result.isMine"
                  class="rounded px-1 text-gray-800 bg-gray-400"
                  >{{ t("You") }}</span
                >
                <span v-else class="font-sans text-xs">{{
                  showSeller === "ign" ? result.ign : result.accountName
                }}</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
  <ui-error-box class="mb-4" v-else>
    <template #name>{{ t(":error") }}</template>
    <p>Error: {{ error }}</p>
    <template #actions>
      <button class="btn" @click="execSearch">{{ t("Retry") }}</button>
      <button class="btn" @click="openTradeLink">{{ t("Browser") }}</button>
    </template>
  </ui-error-box>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  watch,
  shallowRef,
  inject,
} from "vue";
import { useI18nNs } from "@/web/i18n";
import UiErrorBox from "@/web/ui/UiErrorBox.vue";
import { createTradeRequest } from "./pathofexile-bulk";
import { getTradeEndpoint } from "./common";
import { AppConfig } from "@/web/Config";
import { ItemFilters } from "../filters/interfaces";
import { ParsedItem } from "@/parser";
import { PriceCheckWidget } from "@/web/overlay/interfaces";
import { artificialSlowdown } from "./artificial-slowdown";
import OnlineFilter from "./OnlineFilter.vue";
import TradeLinks from "./TradeLinks.vue";
import TradeBulkRow from "./TradeBulkRow.vue";
import { Host } from "@/web/background/IPC";
import { useBulkApi } from "./bulk-api";

const slowdown = artificialSlowdown(900);

export default defineComponent({
  components: { OnlineFilter, TradeLinks, UiErrorBox, TradeBulkRow },
  props: {
    filters: {
      type: Object as PropType<ItemFilters>,
      required: true,
    },
    item: {
      type: Object as PropType<ParsedItem>,
      required: true,
    },
  },
  setup(props) {
    const widget = computed(() => AppConfig<PriceCheckWidget>("price-check")!);
    const isStandalone = computed(() => {
      const params = new URLSearchParams(window.location.search);
      return params.get("mode") === "standalone";
    });
    const { error, result, search } = useBulkApi();

    const showBrowser = inject<(url: string) => void>("builtin-browser")!;

    const useExalts = computed(() => widget.value.coreCurrency === "exalted");

    const selectedCurr = shallowRef<"xchgExalted" | "xchgChaos" | "xchgStable">(
      // only does this check on first load, otherwise will use last used currency
      widget.value.coreCurrency === "exalted" ? "xchgExalted" : "xchgChaos",
    );

    watch(
      () => props.item,
      (item) => {
        slowdown.reset(item);
      },
      { immediate: true },
    );

    const selectedResults = computed(() => {
      if (!slowdown.isReady.value || !result.value) {
        return Array(8);
      }

      const listed = result.value[selectedCurr.value].listedLazy.value;
      if (isStandalone.value) {
        return listed;
      }
      if (listed.length === 0) {
        return [];
      }
      const arr = Array(8);
      arr.splice(0, listed.length, ...listed);
      return arr;
    });

    watch(result, () => {
      // TODO: If we start having more than just ex & c, this is not scalable
      const stableTotal = result.value?.xchgStable.listed.value?.total;
      const exaltedTotal = result.value?.xchgExalted.listed.value?.total;
      const chaosTotal = result.value?.xchgChaos.listed.value?.total;

      if (stableTotal == null) {
        selectedCurr.value = useExalts.value ? "xchgExalted" : "xchgChaos";
      } else if (exaltedTotal == null) {
        selectedCurr.value = "xchgStable";
      } else if (chaosTotal == null) {
        selectedCurr.value = "xchgStable";
      } else {
        if (useExalts.value) {
          selectedCurr.value =
            stableTotal > exaltedTotal ? "xchgStable" : "xchgExalted";
        } else {
          selectedCurr.value =
            stableTotal > chaosTotal ? "xchgStable" : "xchgChaos";
        }
      }
    });

    function makeTradeLink(_have?: string[]) {
      const have =
        _have ??
        (selectedCurr.value === "xchgStable"
          ? ["divine"]
          : selectedCurr.value === "xchgExalted"
            ? ["exalted"]
            : ["chaos"]);
      const httpPostBody = createTradeRequest(props.filters, props.item, have);
      const httpGetQuery = { exchange: httpPostBody.query };
      return `https://${getTradeEndpoint()}/trade2/exchange/poe2/${props.filters.trade.league}?q=${JSON.stringify(httpGetQuery)}`;
    }

    const { t } = useI18nNs("trade_result");

    return {
      t,
      isStandalone,
      error,
      result,
      selectedResults,
      selectedCurr,
      execSearch: () => {
        search(props.item, props.filters);
      },
      showSeller: computed(() => widget.value.showSeller),
      makeTradeLink,
      openTradeLink() {
        if (widget.value.builtinBrowser && Host.isElectron) {
          showBrowser(makeTradeLink(["mirror"]));
        } else {
          window.open(makeTradeLink(["mirror"]));
        }
      },
    };
  },
});
</script>

<style lang="postcss">
.trade-bulk-currency-icon {
  width: 1.75rem;
  height: 1.75rem;
  margin: -0.4375rem;
  margin-right: 0.125rem;
  filter: grayscale(1);
}

.trade-table-heading {
  @apply whitespace-nowrap;
}
</style>
