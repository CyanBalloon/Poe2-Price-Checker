import { parseClipboard } from './renderer/src/parser/index.js';

const itemText = `Item Class: Boots
Rarity: Rare
Eagle Tread
Fortress Sabatons
--------
Armour: 147
Evasion Rating: 134
--------
Requires: Level 75, 56 Str, 56 (unmet) Dex
--------
Item Level: 82
--------
{ Prefix Modifier "Hellion's" (Tier: 1) — Speed }
35% increased Movement Speed
{ Suffix Modifier "of Tzteosh" (Tier: 1) — Elemental, Fire, Resistance }
+41(41-45)% to Fire Resistance`;

const result = parseClipboard(itemText);
if (result.isOk()) {
  console.log("Parsed item successfully:");
  console.log("Requirements:", result.value.requires);
} else {
  console.error("Failed to parse:", result.error);
}
