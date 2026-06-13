import { ITEM_BY_TRANSLATED } from "./src/assets/data";

const res1 = ITEM_BY_TRANSLATED("GEM", "Uhtred's Augury");
console.log("GEM search:", res1?.[0]?.icon);

const res2 = ITEM_BY_TRANSLATED("SkillGem", "Uhtred's Augury");
console.log("SkillGem search:", res2?.[0]?.icon);
