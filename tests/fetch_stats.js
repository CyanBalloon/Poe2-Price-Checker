const https = require('https');

const options = {
  hostname: 'www.pathofexile.com',
  path: '/api/trade2/data/stats',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      let found = [];
      json.result.forEach(group => {
        group.entries.forEach(entry => {
          if (entry.text.toLowerCase().includes('armour')) {
            found.push(`[${group.label}] ${entry.text}: ${entry.id}`);
          }
        });
      });
      console.log(found.join('\n'));
    } catch(e) {
      console.log("Failed to parse JSON. Might be blocked.");
      console.log("Data sample:", data.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
