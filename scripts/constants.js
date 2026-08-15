export const MODULE_ID = "pf2e-custom-materials";

export const SETTING_MATERIALS = "materials";

export const GRADES = ["low", "standard", "high"];

export const GRADE_LABELS = {
    low: "PF2ECM.Grade.Low",
    standard: "PF2ECM.Grade.Standard",
    high: "PF2ECM.Grade.High",
};

/** Physical item types the module can attach a custom material to, mapped to the CONFIG.PF2E trait record that governs their trait tags. */
export const ITEM_TYPE_TRAIT_CONFIG = {
    weapon: "weaponTraits",
    armor: "armorTraits",
    shield: "shieldTraits",
    equipment: "equipmentTraits",
    consumable: "consumableTraits",
};

export const ITEM_TYPES = Object.keys(ITEM_TYPE_TRAIT_CONFIG);

export const FLAG_APPLIED = "applied";

export const RARITIES = ["common", "uncommon", "rare", "unique"];

export const RARITY_LABELS = {
    common: "PF2ECM.Rarity.Common",
    uncommon: "PF2ECM.Rarity.Uncommon",
    rare: "PF2ECM.Rarity.Rare",
    unique: "PF2ECM.Rarity.Unique",
};

/** Ordering used to treat a material grade's level/rarity as a floor rather than an override. */
export const RARITY_ORDER = { common: 0, uncommon: 1, rare: 2, unique: 3 };
