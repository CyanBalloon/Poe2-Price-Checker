async function run() {
  const res = await fetch("https://www.pathofexile.com/api/trade2/search/Standard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    },
    body: JSON.stringify({
      query: {
        status: { option: "online" },
        stats: [
          {
            type: "and",
            filters: [
              {
                id: "skill.summon_skeleton_warrior",
                value: { min: 19, max: 19 }
              }
            ]
          }
        ]
      }
    })
  });
  
  const d = await res.json();
  const res2 = await fetch(`https://www.pathofexile.com/api/trade2/fetch/${d.result.slice(0,1).join(',')}?query=${d.id}`, { headers: {'User-Agent': 'Mozilla/5.0'} });
  const d2 = await res2.json();
  console.log(JSON.stringify(d2.result[0].item.extended.skills, null, 2));
}

run();
