const fs = require('fs');

const statsJsonPath = '../dataParser/data/json/en/stats.json';
if (!fs.existsSync(statsJsonPath)) {
    console.error('stats.json not found!');
    process.exit(1);
}

const statsJson = require(statsJsonPath);
const statsNdjsonPath = 'public/data/en/stats.ndjson';
const statsNdjson = fs.readFileSync(statsNdjsonPath, 'utf8').split('\n').filter(Boolean).map(JSON.parse);

const existingIds = new Set();
statsNdjson.forEach(stat => {
    if (stat.trade && stat.trade.ids) {
        for (const type of Object.keys(stat.trade.ids)) {
            for (const id of stat.trade.ids[type]) {
                existingIds.add(id);
            }
        }
    }
});

let missingCount = 0;
const toAppend = [];
statsJson.result.forEach(group => {
    group.entries.forEach(entry => {
        if (!existingIds.has(entry.id)) {
            missingCount++;
            // Create a basic ndjson entry
            let ref = entry.text;
            if (typeof ref === 'string') {
                ref = ref.replace(/\(.*\)/g, '').replace(/\+#%/g, '#%').trim();
            }
            
            const statObj = {
                ref: ref,
                dp: false,
                better: 1,
                matchers: [{string: ref}],
                trade: {
                    ids: {
                        [entry.type]: [entry.id]
                    }
                }
            };
            toAppend.push(JSON.stringify(statObj));
        }
    });
});

console.log(`Found ${missingCount} missing stats!`);
if (toAppend.length > 0) {
    fs.appendFileSync(statsNdjsonPath, '\n' + toAppend.join('\n'));
    console.log('Appended to stats.ndjson');
}
