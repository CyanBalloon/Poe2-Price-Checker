import json
import os

public_dir = os.path.join(os.path.dirname(__file__), "..", "renderer", "public", "data")
lang = "en"
ndjson_path = os.path.join(public_dir, lang, "items.ndjson")
overrides_path = os.path.join(os.path.dirname(__file__), "overrides.json")

with open(overrides_path, 'r', encoding='utf-8') as f:
    overrides = json.load(f)

# Load existing items
items = []
existing_refnames = set()
with open(ndjson_path, "r", encoding="utf-8") as f:
    for line in f:
        if not line.strip(): continue
        item = json.loads(line)
        items.append(item)
        existing_refnames.add(item.get("refName"))

added_count = 0
updated_count = 0

for name, icon_url in overrides.items():
    if name.startswith("[DNT]"): 
        name = name.replace("[DNT] ", "").strip()
        
    found = False
    for item in items:
        if item.get("refName") == name or item.get("name") == name:
            item["icon"] = icon_url
            found = True
            updated_count += 1
            # We don't break because there might be duplicates (e.g. GEM and ITEM), we update all of them
            
    if not found:
        print(f"Injecting missing lineage support: {name}")
        items.append({
            "name": name,
            "refName": name,
            "namespace": "GEM",  # Lineage supports are gems
            "icon": icon_url,
            "tags": [],
            "tradeTag": name.replace("'", "").replace(" ", "-").lower(),
            "craftable": {"category": "Unknown"},
            "w": 1,
            "h": 1
        })
        existing_refnames.add(name)
        added_count += 1

# Re-sort and write
items.sort(key=lambda x: (x.get("namespace", ""), x.get("refName", "")))

with open(ndjson_path, "w", encoding="utf-8") as f:
    for item in items:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")

print(f"Successfully added {added_count} items and updated icons for {updated_count} items!")
