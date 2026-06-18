import json
import os

evasion_boots = []

# To get the tier/requirements, we need the raw items.json data
with open('dataParser/data/en/items.json', 'r', encoding='utf-8') as f:
    items_json = json.load(f)

# Build a lookup for level requirements to approximate "tier"
req_lookup = {}
for category in items_json.get('result', []):
    for item in category.get('entries', []):
        name = item.get('name')
        # Some items have level requirements embedded in their properties or it might not be easily accessible here
        # Let's just capture the order they appear in the JSON, as they are usually sorted by tier!
        req_lookup[name] = item

with open('renderer/public/data/en/items.ndjson', 'r', encoding='utf-8') as f:
    for line in f:
        if '"ITEM"' in line and '"Boots"' in line:
            item = json.loads(line)
            if item.get('craftable', {}).get('category') == 'Boots':
                tags = item.get('tags', [])
                # 'dex_armour' is Evasion ONLY (str=Armour, int=Energy Shield)
                if 'dex_armour' in tags and 'str_dex_armour' not in tags and 'dex_int_armour' not in tags:
                    name = item['name']
                    # We'll rely on the order in req_lookup or just output the raw list
                    evasion_boots.append(name)

# Evasion boots usually have "Boots" in their name or specific bases
print("Evasion Boots:", evasion_boots)
