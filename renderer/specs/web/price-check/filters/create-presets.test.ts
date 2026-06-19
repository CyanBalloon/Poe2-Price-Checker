import { ItemRarity, ParsedItem } from "@/parser/ParsedItem";
import { ItemCategory } from "@/parser/meta";
import { createPresets } from "@/web/price-check/filters/create-presets";
import { describe, expect, it } from "vitest";
import { createTestCreateOptions, createTestItem } from "@specs/helper";

describe("createPresets tests", () => {
  it("should return both presets for magic items even if they have no crafting value", () => {
    const item: ParsedItem = {
      ...createTestItem(),
      rarity: ItemRarity.Magic,
      itemLevel: 10, // low item level, hasCraftingValue will return false
      info: {
        ...createTestItem().info,
        craftable: { category: ItemCategory.Helmet },
      },
    };

    const res = createPresets(item, createTestCreateOptions());

    expect(res.presets.map(p => p.id)).toContain("filters.preset_pseudo");
    expect(res.presets.map(p => p.id)).toContain("filters.preset_base_item");
    expect(res.active).toBe("filters.preset_base_item");
  });

  it("should return only pseudo preset for non-magic items with no crafting value", () => {
    const item: ParsedItem = {
      ...createTestItem(),
      rarity: ItemRarity.Rare,
      itemLevel: 10,
      info: {
        ...createTestItem().info,
        craftable: { category: ItemCategory.Helmet },
      },
    };

    const res = createPresets(item, createTestCreateOptions());

    expect(res.presets.map(p => p.id)).toContain("filters.preset_pseudo");
    expect(res.presets.map(p => p.id)).not.toContain("filters.preset_base_item");
    expect(res.active).toBe("filters.preset_pseudo");
  });

  it("should create presets for unidentified unique items without error", () => {
    const item: ParsedItem = {
      ...createTestItem(),
      rarity: ItemRarity.Unique,
      isUnidentified: true,
      info: {
        name: "Wicker Tiara",
        refName: "Wicker Tiara",
        namespace: "ITEM",
        icon: "",
        tags: [],
      },
    };
    const res = createPresets(item, createTestCreateOptions());
    expect(res.active).toBe("filters.preset_exact");
  });
});
