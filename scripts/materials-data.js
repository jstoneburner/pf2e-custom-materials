import { GRADES, MODULE_ID, SETTING_MATERIALS } from "./constants.js";

/**
 * A single material definition as stored in the world setting.
 * @typedef {object} MaterialGrade
 * @property {number|null} level
 * @property {number|null} price      Price in gp for this grade.
 * @property {number|null} hardness   Only meaningful for shields.
 * @property {number|null} maxHP      Only meaningful for shields.
 *
 * @typedef {object} MaterialDefinition
 * @property {string} slug
 * @property {string} label
 * @property {string[]} itemTypes
 * @property {boolean} prefixName
 * @property {string} description
 * @property {Record<"low"|"standard"|"high", MaterialGrade|null>} grades
 * @property {object[]} rules         Raw PF2e rule element source objects applied while the material is active.
 */

function registerSetting() {
    game.settings.register(MODULE_ID, SETTING_MATERIALS, {
        scope: "world",
        config: false,
        type: Object,
        default: {},
    });
}

/** @returns {Record<string, MaterialDefinition>} */
function getMaterials() {
    return foundry.utils.deepClone(game.settings.get(MODULE_ID, SETTING_MATERIALS));
}

/** @returns {MaterialDefinition|null} */
function getMaterial(slug) {
    return getMaterials()[slug] ?? null;
}

async function saveMaterial(material) {
    const materials = getMaterials();
    materials[material.slug] = material;
    await game.settings.set(MODULE_ID, SETTING_MATERIALS, materials);
}

async function deleteMaterial(slug) {
    const materials = getMaterials();
    delete materials[slug];
    await game.settings.set(MODULE_ID, SETTING_MATERIALS, materials);
}

function emptyGrade() {
    return { level: null, price: null, hardness: null, maxHP: null };
}

function emptyMaterial(slug) {
    return {
        slug,
        label: "",
        itemTypes: ["weapon"],
        prefixName: true,
        description: "",
        grades: { low: null, standard: emptyGrade(), high: null },
        rules: [],
    };
}

function materialGrades(material) {
    return GRADES.filter((grade) => material.grades[grade]);
}

export { deleteMaterial, emptyGrade, emptyMaterial, getMaterial, getMaterials, materialGrades, registerSetting, saveMaterial };
