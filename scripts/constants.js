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
