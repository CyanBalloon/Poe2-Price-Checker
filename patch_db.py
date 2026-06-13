import json
import os

db_path = 'renderer/public/data/en/items.ndjson'
lines = []

with open(db_path, 'r', encoding='utf-8') as f:
    for line in f:
        lines.append(line)

# Check if Uhtred's Rite is already there
found = any('"name": "Uhtred\'s Rite"' in line for line in lines)

if not found:
    new_gem = {
      "name": "Uhtred's Rite",
      "refName": "Uhtred's Rite",
      "namespace": "GEM",
      "icon": "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvR2Vtcy9OZXcvTmV3U3VwcG9ydC9MaW5lYWdlL1V0aHJlZHNDaGFsaWNlIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/484fb5bdbb/UthredsChalice.png",
      "tags": [],
      "tradeTag": "uhtreds-rite",
      "craftable": {
        "category": "Support Skill Gem"
      },
      "w": 1,
      "h": 1,
      "gem": {
        "awakened": False,
        "transfigured": False
      }
    }
    
    with open(db_path, 'a', encoding='utf-8') as f:
        f.write(json.dumps(new_gem, separators=(',', ':')) + '\n')
    print("Added Uhtred's Rite to database.")
else:
    print("Uhtred's Rite already in database.")
