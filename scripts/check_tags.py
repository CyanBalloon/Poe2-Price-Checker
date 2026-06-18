import json

with open('renderer/public/data/en/items.ndjson', 'r', encoding='utf-8') as f:
    for line in f:
        if '"ITEM"' in line and '"Boots"' in line:
            item = json.loads(line)
            if item.get('craftable', {}).get('category') == 'Boots':
                print(item['name'], item.get('tags', []))
