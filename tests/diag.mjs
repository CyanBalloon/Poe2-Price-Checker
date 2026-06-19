import { init, STAT_BY_MATCH_STR } from './src/assets/data/index.js';
import { ModifierType } from './src/parser/modifiers.js';
import fs from 'fs';

// Quick mock for vitest env requirements
global.window = { location: { href: 'http://localhost' } };
global.fetch = async () => ({ json: async () => ({}) });

async function run() {
  await init('en');
  const stat = STAT_BY_MATCH_STR('# to Armour');
  console.log("Stat:", JSON.stringify(stat, null, 2));
  console.log("Explicit IDs:", stat.trade.ids[ModifierType.Explicit]);
}

run().catch(console.error);
