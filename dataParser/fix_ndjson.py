import json
import os

json_dir = os.path.join(os.path.dirname(__file__), "data", "json")
public_dir = os.path.join(os.path.dirname(__file__), "..", "renderer", "public", "data")
languages = ["en", "ru", "cmn-Hant", "ko", "ja", "de", "es", "pt", "fr"]

MANUAL_IMAGE_OVERRIDES = {
    "Uhtred's Chalice": "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvR2Vtcy9OZXcvTmV3U3VwcG9ydC9MaW5lYWdlL1V0aHJlZHNDaGFsaWNlIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/484fb5bdbb/UthredsChalice.png"
}

# Metadata for missing base types
MISSING_BASES_META = {
    "Aberrant Sledge": ("Two Hand Mace", 2, 4, []),
    "Ancient Leggings": ("Boots", 2, 2, ["str_dex_armour"]),
    "Ancient Mail": ("Body Armour", 2, 3, ["str_armour"]),
    "Ancient Visor": ("Helmet", 2, 2, ["str_armour"]),
    "Engraved Bracers": ("Gloves", 2, 2, ["dex_armour"]),
    "Exquisite Vest": ("Body Armour", 2, 3, ["dex_armour"]),
    "Glacial Fortress": ("Shield", 2, 3, ["str_armour", "shield"]),
    "Heartwood Shortbow": ("Bow", 2, 4, ["weapon"]),
    "Kalguuran Forgehammer": ("One Hand Mace", 2, 3, ["weapon"]),
    "Ornate Ringmail": ("Body Armour", 2, 3, ["str_int_armour"]),
    "Perching Staff": ("Staff", 2, 4, ["weapon"]),
    "Primal Markings": ("Body Armour", 2, 3, ["str_dex_int_armour"]),
    "Revered Vestments": ("Body Armour", 2, 3, ["str_int_armour"]),
    "Runeforged Hardwood Spear": ("Spear", 2, 4, ["weapon"]),
    "Runeforged Kalguuran Forgehammer": ("One Hand Mace", 2, 3, ["weapon"]),
    "Runeforged Morning Star": ("One Hand Mace", 2, 3, ["weapon"]),
    "Runeforged Nettle Talisman": ("Amulet", 1, 1, ["amulet"]),
    "Runemastered Aberrant Sledge": ("Two Hand Mace", 2, 4, ["weapon"]),
    "Runemastered Ancient Leggings": ("Boots", 2, 2, ["str_dex_armour"]),
    "Runemastered Ancient Mail": ("Body Armour", 2, 3, ["str_armour"]),
    "Runemastered Exquisite Vest": ("Body Armour", 2, 3, ["dex_armour"]),
    "Runemastered Glacial Fortress": ("Shield", 2, 3, ["str_armour", "shield"]),
    "Runemastered Knight Armour": ("Body Armour", 2, 3, ["str_dex_armour"]),
    "Runemastered Nettle Talisman": ("Amulet", 1, 1, ["amulet"]),
    "Runemastered Ornate Ringmail": ("Body Armour", 2, 3, ["str_int_armour"]),
    "Runemastered Primal Markings": ("Body Armour", 2, 3, ["str_dex_int_armour"]),
    "Runemastered Revered Vestments": ("Body Armour", 2, 3, ["str_int_armour"]),
    "Runemastered Runic Fork": ("Wand", 1, 3, ["weapon"]),
    "Runemastered Shaman Mantle": ("Body Armour", 2, 3, ["dex_int_armour"]),
    "Runemastered Stocky Mitts": ("Gloves", 2, 2, ["str_armour"]),
    "Runemastered Tenebrous Crown": ("Helmet", 2, 2, ["str_int_armour"]),
    "Runemastered Venerable Defender": ("Shield", 2, 3, ["str_int_armour", "shield"]),
    "Runemastered Veridical Chain": ("Amulet", 1, 1, ["amulet"]),
    "Runemastered Warding Quarterstaff": ("Warstaff", 2, 4, ["weapon"]),
    "Runic Fork": ("Wand", 1, 3, ["weapon"]),
    "Tenebrous Crown": ("Helmet", 2, 2, ["str_int_armour"]),
    "Trarthan Cannon": ("Crossbow", 2, 4, ["weapon"]),
    "Twisted Wand": ("Wand", 1, 3, ["weapon"]),
    "Two-Stone Ring": ("Ring", 1, 1, ["ring"]),
    "Venerable Defender": ("Shield", 2, 3, ["str_int_armour", "shield"]),
    "Veridical Chain": ("Amulet", 1, 1, ["amulet"]),
    "Warding Quarterstaff": ("Warstaff", 2, 4, ["weapon"])
}

UNIQUE_ITEMS_FIXED_STATS = {
    "Darkness Enthroned": ["#% increased effect of Socketed Items", "Has # Charm Slot"],
    "Cursecarver": [
        "#% increased Spell Damage",
        "#% increased Cast Speed",
        "#% increased Mana Regeneration Rate",
        "Gain # Life per Enemy Killed",
    ],
    "The Unborn Lich": ["#% increased Desecrated Modifier magnitudes"],
    "Morior Invictus": ["#% increased Armour, Evasion and Energy Shield"],
    "Rite of Passage": ["Used when you Kill a Rare or Unique Enemy"],
    "Grip of Kulemak": [
        "Inflict Abyssal Wasting on Hit",
        "#% increased Presence Area of Effect",
        "#% increased Light Radius",
    ],
    "Heroic Tragedy": ["Historic"],
    "Undying Hate": ["Historic"],
    "Megalomaniac": [],
    "From Nothing": [],
    "Prism of Belief": [],
    "Heart of the Well": [],
    "Against the Darkness": [],
}

def main():
    # Load English items.json for baseline
    en_items_json_path = os.path.join(json_dir, "en", "items.json")
    with open(en_items_json_path, "r", encoding="utf-8") as f:
        en_items_data = json.load(f)

    # Build unique items mapping in English
    # Key: (category_index, entry_index) -> item_details
    en_uniques = {}
    for c_idx, category in enumerate(en_items_data["result"]):
        for e_idx, entry in enumerate(category.get("entries", [])):
            if entry.get("flags", {}).get("unique"):
                en_uniques[(c_idx, e_idx)] = entry

    print(f"Total uniques in trade data: {len(en_uniques)}")

    for lang in languages:
        print(f"Processing language: {lang}")
        
        # Load existing ndjson
        ndjson_path = os.path.join(public_dir, lang, "items.ndjson")
        items = []
        existing_unique_refnames = set()
        existing_item_refnames = set()
        
        if os.path.exists(ndjson_path):
            with open(ndjson_path, "r", encoding="utf-8") as f:
                for line in f:
                    if not line.strip():
                        continue
                    item = json.loads(line)
                    items.append(item)
                    if item.get("namespace") == "UNIQUE":
                        existing_unique_refnames.add(item["refName"])
                    elif item.get("namespace") == "ITEM":
                        existing_item_refnames.add(item["refName"])
                        
        print(f"  Existing uniques in items.ndjson: {len(existing_unique_refnames)}")
        print(f"  Existing bases in items.ndjson: {len(existing_item_refnames)}")

        # Load localized items.json
        lang_items_json_path = os.path.join(json_dir, lang, "items.json")
        with open(lang_items_json_path, "r", encoding="utf-8") as f:
            lang_items_data = json.load(f)

        # Loop through English uniques and find what's missing
        added_uniques = 0
        added_bases = 0
        for (c_idx, e_idx), en_entry in en_uniques.items():
            en_name = en_entry.get("name")
            en_base = en_entry.get("type")
            
            if en_name not in existing_unique_refnames:
                # Align localized entry if size matches
                can_align = False
                if c_idx < len(lang_items_data["result"]):
                    lang_cat = lang_items_data["result"][c_idx]
                    if e_idx < len(lang_cat.get("entries", [])):
                        # Check if the English entries count matches the localized entries count in this category
                        en_cat_len = len(en_items_data["result"][c_idx].get("entries", []))
                        lang_cat_len = len(lang_cat.get("entries", []))
                        if en_cat_len == lang_cat_len:
                            can_align = True
                
                if can_align:
                    lang_entry = lang_items_data["result"][c_idx]["entries"][e_idx]
                    lang_name = lang_entry.get("name")
                    lang_base = lang_entry.get("type")
                else:
                    # Fallback to English names
                    lang_name = en_name
                    lang_base = en_base
                
                # Check if base type is in items.ndjson
                if en_base not in existing_item_refnames:
                    # Construct base item
                    if en_base in MISSING_BASES_META:
                        cat_name, w, h, tags = MISSING_BASES_META[en_base]
                    else:
                        # Fallback for unrecognized bases
                        cat_name, w, h, tags = "Unknown", 1, 1, []
                        
                    base_item = {
                        "name": lang_base,
                        "refName": en_base,
                        "namespace": "ITEM",
                        "icon": "%NOT_FOUND%",
                        "tags": tags,
                        "craftable": {"category": cat_name},
                        "w": w,
                        "h": h
                    }
                    items.append(base_item)
                    existing_item_refnames.add(en_base)
                    added_bases += 1

                # Construct unique item
                unique_field = {"base": en_base}
                if en_name in UNIQUE_ITEMS_FIXED_STATS:
                    unique_field["fixedStats"] = UNIQUE_ITEMS_FIXED_STATS[en_name]
                    
                if en_base in MISSING_BASES_META:
                    _, w, h, _ = MISSING_BASES_META[en_base]
                else:
                    w, h = 1, 1
                    
                unique_item = {
                    "name": lang_name,
                    "refName": en_name,
                    "namespace": "UNIQUE",
                    "unique": unique_field,
                    "icon": "%NOT_FOUND%",
                    "tags": [],
                    "w": w,
                    "h": h
                }
                items.append(unique_item)
                existing_unique_refnames.add(en_name)
                added_uniques += 1

        print(f"  Added uniques: {added_uniques}, Added bases: {added_bases}")

        # Apply manual image overrides
        for item in items:
            if item.get("refName") in MANUAL_IMAGE_OVERRIDES:
                item["icon"] = MANUAL_IMAGE_OVERRIDES[item["refName"]]

        # Sort the items: by namespace, then refName
        items.sort(key=lambda x: (x.get("namespace"), x.get("refName")))

        # Write back to ndjson
        with open(ndjson_path, "w", encoding="utf-8") as f:
            for item in items:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

    print("Successfully fixed all items.ndjson files!")

if __name__ == "__main__":
    main()
