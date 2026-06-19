const https = require('https');

const options = {
  hostname: 'www.pathofexile.com',
  path: '/api/trade2/data/stats',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
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
          if (entry.id.includes('4052037485') || entry.id.includes('3484657501') || entry.id.includes('809229260')) {
            found.push(`[${group.label}] ${entry.text}: ${entry.id}`);
          }
        });
      });
      console.log(found.join('\n'));
    } catch(e) {
      console.error(e);
    }
  });
});

req.end();
