import json

# List of evasion boots from earlier
ev_boots = set([
    "Bound Boots",
    "Cavalry Boots",
    "Cinched Boots",
    "Dragonscale Boots",
    "Drakeskin Boots",
    "Embossed Boots",
    "Flared Boots",
    "Laced Boots",
    "Lizardscale Boots",
    "Rawhide Boots",
    "Serpentscale Boots",
    "Sleek Boots",
    "Steeltoe Boots",
    "Studded Boots"
])

ordered_boots = []

with open(r'e:\Projects\Modern-Exiled-Exchange-2\dataParser\data\json\en\items.json', 'r', encoding='utf-8') as f:
    items_data = json.load(f)

for category in items_data.get('result', []):
    for entry in category.get('entries', []):
        name = entry.get('name')
        if name in ev_boots:
            ordered_boots.append(name)
            # Remove from set to handle duplicates just in case
            ev_boots.discard(name)

# If any are missing, print them at the end
for boot in ev_boots:
    ordered_boots.append(boot + " (Unknown Tier)")

print("Evasion Boots in Tier Order (Lowest to Highest):")
for i, boot in enumerate(ordered_boots):
    print(f"Tier {i+1}: {boot}")
