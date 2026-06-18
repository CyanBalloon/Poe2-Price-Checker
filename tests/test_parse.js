const fs = require('fs');

const lines = fs.readFileSync('renderer/public/data/en/items.ndjson', 'utf8').split('\n');
const uhtreds = lines.filter(l => l.includes("Uhtred"));
console.log("Uhtred items in ndjson:");
uhtreds.forEach(u => console.log(u));

// Simulate parsing into index map
const itemsByTranslated = new Map();
const names = new Map();
itemsByTranslated.set("GEM", names);

uhtreds.forEach(u => {
    if(!u) return;
    const item = JSON.parse(u);
    const name = String(item.name || item.refName);
    names.set(name, item);
});

console.log("\nLookup test for Uhtred's Rite:");
console.log(names.get("Uhtred's Rite")?.icon);

