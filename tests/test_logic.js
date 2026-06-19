import { ARMOUR, WEAPON, ItemCategory } from "./src/parser/meta.js";

function isStatLocalByDefault(statRef, item) {
  const isArmour = item.category && ARMOUR.has(item.category);
  console.log("isArmour:", isArmour, "category:", item.category);
  if (statRef.includes("Armour") && (item.armourAR || isArmour)) return true;
  return false;
}

const LOCAL_STAT_IDS = new Set([
  "explicit.stat_4052037485",
  "explicit.stat_53045048",
  "explicit.stat_691932474",
  "explicit.stat_124859000",
  "explicit.stat_3484657501",
]);

function getTradeIds(stat, type, item) {
  let ids = stat.stat.trade.ids[type] ?? [];
  
  if (ids.length > 1) {
    const localId = ids.find(id => LOCAL_STAT_IDS.has(id));
    const globalId = ids.find(id => !LOCAL_STAT_IDS.has(id));
    
    if (localId && globalId) {
      const isLocal = isStatLocalByDefault(stat.stat.ref, item);
      console.log("isLocal result:", isLocal);
      if (isLocal) {
        return { ids: [localId], localId, globalId, isLocal: true };
      } else {
        return { ids: [globalId], localId, globalId, isLocal: false };
      }
    }
  }
  
  return { ids };
}

const item = {
  category: ItemCategory.Helmet,
  armourAR: 438
};

const calc = {
  stat: {
    ref: "# to Armour",
    trade: {
      ids: {
        explicit: ["explicit.stat_3484657501", "explicit.stat_809229260"]
      }
    }
  }
};

const result = getTradeIds(calc, "explicit", item);
console.log("Final trade IDs:", result);
