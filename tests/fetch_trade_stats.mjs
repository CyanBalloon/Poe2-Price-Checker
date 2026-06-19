import https from 'https';
import fs from 'fs';

const opts = {
  hostname: 'www.pathofexile.com',
  path: '/api/trade2/data/stats',
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
};

https.get(opts, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('trade_stats_full.json', data);
    
    const parsed = JSON.parse(data);
    // Find all stats with parenthesized variants like (Local), (Jewel), etc.
    const allStats = [];
    for (const group of parsed.result) {
      for (const entry of group.entries) {
        allStats.push({
          id: entry.id,
          text: entry.text,
          type: entry.type
        });
      }
    }

    // Find stats that have parenthesized suffixes
    const parenRegex = /^(.+?)\s+\(([^)]+)\)$/;
    const withParens = [];
    const withoutParens = new Map(); // base text -> [{id, type}]
    
    for (const stat of allStats) {
      const match = stat.text.match(parenRegex);
      if (match) {
        withParens.push({ ...stat, baseText: match[1], variant: match[2] });
      }
    }

    // For each parenthesized stat, find matching base stat
    const linked = [];
    for (const pStat of withParens) {
      const baseMatches = allStats.filter(s => 
        s.text === pStat.baseText && s.type === pStat.type
      );
      if (baseMatches.length > 0) {
        linked.push({
          baseText: pStat.baseText,
          variant: pStat.variant,
          type: pStat.type,
          variantId: pStat.id,
          baseIds: baseMatches.map(b => b.id)
        });
      }
    }

    console.log(`\nFound ${withParens.length} stats with parenthesized variants`);
    console.log(`Found ${linked.length} that have a matching base stat\n`);
    console.log("=== LINKED VARIANT MODS ===\n");
    
    for (const l of linked) {
      console.log(`[${l.type}] "${l.baseText}" <-> "${l.baseText} (${l.variant})"`);
      console.log(`  Base IDs: ${l.baseIds.join(', ')}`);
      console.log(`  Variant ID: ${l.variantId}`);
      console.log('');
    }

    fs.writeFileSync('linked_variant_mods.json', JSON.stringify(linked, null, 2));
    console.log('Saved to linked_variant_mods.json');
  });
}).on('error', (e) => console.error(e));
