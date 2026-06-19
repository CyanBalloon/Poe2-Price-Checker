import { parseClipboard } from "./src/parser";
import { createExactStatFilters } from "./src/web/price-check/filters/create-stat-filters";

const itemText = `Item Class: Helmets
Rarity: Magic
Plated Warmonger Greathelm of the Maelstrom
--------
Armour: 438 (augmented)
--------
Requires: Level 65, 91 Str
--------
Item Level: 67
--------
{ Prefix Modifier "Plated" (Tier: 4) — Armour }
+113(99-127) to Armour
{ Suffix Modifier "of the Maelstrom" (Tier: 3) — Elemental, Lightning, Resistance }
+31(31-35)% to Lightning Resistance`;

import { init } from "./src/assets/data";

async function run() {
  await init("en");
  const item = parseClipboard(itemText);
  if (!item) {
    console.log("Failed to parse");
    return;
  }
  const filters = createExactStatFilters(item, item.statsByType, { searchStatRange: 10, defaultAllSelected: true });
  console.log("Generated Filters:");
  for (const f of filters) {
    console.log(`- Text: "${f.text}"`);
    console.log(`  Trade IDs: ${JSON.stringify(f.tradeId)}`);
    console.log(`  isLocal: ${f.isLocal}`);
  }
}

run().catch(console.error);
