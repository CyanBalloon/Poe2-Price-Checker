import json

bases = []
with open('renderer/public/data/en/items.ndjson', 'r', encoding='utf-8') as f:
    for line in f:
        if '"ITEM"' in line and '"Boots"' in line:
            item = json.loads(line)
            if item.get('craftable', {}).get('category') == 'Boots':
                tags = item.get('tags', [])
                if 'dex_armour' in tags and 'str_dex_armour' not in tags and 'dex_int_armour' not in tags and 'str_int_armour' not in tags and 'str_armour' not in tags and 'int_armour' not in tags:
                    bases.append(item['name'])

# I will just list them directly
print("\nEvasion Only Boots:")
for b in bases:
    print(b)
