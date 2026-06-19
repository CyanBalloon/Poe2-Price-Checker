async function run() {
  const res = await fetch("https://www.pathofexile.com/api/trade2/search/poe2/Standard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Poe2PriceChecker/1.0"
    },
    body: JSON.stringify({
      query: {
        status: { option: "online" },
        filters: { type_filters: { filters: { category: { option: "weapon.sceptre" }, rarity: { option: "rare" } } } }
      }
    })
  });
  
  const d = await res.json();
  if (d.result && d.result.length > 0) {
    const res2 = await fetch(`https://www.pathofexile.com/api/trade2/fetch/${d.result.slice(0,1).join(',')}?query=${d.id}`, { headers: {'User-Agent': 'Poe2PriceChecker/1.0'} });
    const d2 = await res2.json();
    console.log(JSON.stringify(d2.result[0].item.explicitMods, null, 2));
    console.log(JSON.stringify(d2.result[0].item.implicitMods, null, 2));
  } else {
    console.log("No items found:", d);
  }
}

run();
