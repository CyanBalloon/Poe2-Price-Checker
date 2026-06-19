import fs from 'fs';
const content = fs.readFileSync('renderer/public/data/en/items.ndjson', 'utf8');
const lines = content.split('\n');
console.log("Total lines:", lines.length);

const prismatic = lines.filter(l => l.includes('Prismatic Ring'));
console.log("Prismatic Ring occurrences:", prismatic.length);
prismatic.forEach(l => console.log(l));

const uniques = lines.filter(l => l.includes('"unique"'));
console.log("Total unique items:", uniques.length);
uniques.slice(0, 10).forEach(l => console.log(l));
