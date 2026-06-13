import urllib.request
import re
import json

url = "https://raw.githubusercontent.com/PathOfBuildingCommunity/PathOfBuilding-PoE2/master/Data/Bases/Equipment.lua"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    content = urllib.request.urlopen(req).read().decode('utf-8')
except Exception as e:
    print("Error fetching Equipment.lua:", e)
    exit(1)

# Extract item bases using regex
# Example: itemBases["Rawhide Boots"] = { type = "Boots", req = { level = 1, dex = 0 }, ... }
bases = {}
pattern = r'itemBases\["([^"]+)"\]\s*=\s*\{.*?type\s*=\s*"([^"]+)".*?req\s*=\s*\{(.*?)\}'
for match in re.finditer(pattern, content, re.DOTALL):
    name = match.group(1)
    btype = match.group(2)
    req_str = match.group(3)
    
    level_match = re.search(r'level\s*=\s*(\d+)', req_str)
    level = int(level_match.group(1)) if level_match else 1
    
    if btype not in bases:
        bases[btype] = []
    bases[btype].append({"name": name, "level": level})

tiers_map = {}
for btype, items in bases.items():
    # Sort by level descending (highest level = Tier 1)
    items.sort(key=lambda x: x["level"], reverse=True)
    for i, item in enumerate(items):
        tiers_map[item["name"]] = i + 1

with open('e:/Projects/Modern-Exiled-Exchange-2/renderer/public/data/en/tiers.json', 'w', encoding='utf-8') as f:
    json.dump(tiers_map, f, indent=2)

print(f"Successfully generated tiers.json with {len(tiers_map)} base types!")
print("Example Tier map:")
for name in ["Dragonscale Boots", "Rawhide Boots", "Studded Boots"]:
    print(f"{name}: Tier {tiers_map.get(name, 'Unknown')}")
