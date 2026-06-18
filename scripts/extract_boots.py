import json

ev_boots = []
with open('renderer/public/data/en/items.ndjson', 'r', encoding='utf-8') as f:
    for line in f:
        if '"ITEM"' in line and 'Boots' in line:
            item = json.loads(line)
            if item.get('craftable', {}).get('category') == 'Boots':
                tags = item.get('tags', [])
                # Evasion only means it has "evasion" but not "armour" and not "energy_shield"
                if 'evasion' in tags and 'armour' not in tags and 'energy_shield' not in tags:
                    ev_boots.append(item['name'])

print("Evasion Only Boots:")
for b in ev_boots:
    print(b)
