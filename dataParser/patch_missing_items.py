import json
import os

public_dir = os.path.join(os.path.dirname(__file__), "..", "renderer", "public", "data")
json_dir = os.path.join(os.path.dirname(__file__), "data", "json")
lang = "en"

ndjson_path = os.path.join(public_dir, lang, "items.ndjson")
static_path = os.path.join(json_dir, lang, "static.json")

# Load existing items
items = []
existing_refnames = set()
with open(ndjson_path, "r", encoding="utf-8") as f:
    for line in f:
        if not line.strip(): continue
        item = json.loads(line)
        items.append(item)
        existing_refnames.add(item.get("refName"))

# Load static
with open(static_path, "r", encoding="utf-8") as f:
    static_data = json.load(f)

# Find missing items in static and add them
added_count = 0
for category in static_data.get("result", []):
    for entry in category.get("entries", []):
        refName = entry.get("text")
        if not refName: continue
        
        # We only care about new items that are missing
        if refName not in existing_refnames:
            print(f"Injecting missing item: {refName}")
            items.append({
                "name": refName,
                "refName": refName,
                "namespace": "ITEM",
                "icon": f"https://web.poecdn.com{entry.get('image', '')}",
                "tags": [],
                "tradeTag": entry.get("id"),
                "craftable": {"category": "Unknown"},
                "w": 1,
                "h": 1
            })
            existing_refnames.add(refName)
            added_count += 1

# Re-sort and write
items.sort(key=lambda x: (x.get("namespace", ""), x.get("refName", "")))

with open(ndjson_path, "w", encoding="utf-8") as f:
    for item in items:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")

print(f"Successfully injected {added_count} missing items into items.ndjson!")
