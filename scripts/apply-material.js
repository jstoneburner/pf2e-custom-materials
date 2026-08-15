import { FLAG_APPLIED, MODULE_ID, RARITY_ORDER } from "./constants.js";
import { getMaterial } from "./materials-data.js";

/**
 * Combine an item's current base price with a material grade's price.
 * This mirrors the system's own "base price plus material value" approach but omits its bulk-scaling
 * refinement for simplicity; treat the result as a close approximation rather than a rules-exact figure.
 */
function computePrice(basePriceGp, grade) {
    const total = (basePriceGp || 0) + (grade?.price || 0);
    return Math.round(total * 100) / 100;
}

/** Remove one instance of each rule in `rulesToRemove` from `rules`, matched by content rather than position. */
function subtractRules(rules, rulesToRemove) {
    const remaining = [...rules];
    for (const target of rulesToRemove) {
        const targetJson = JSON.stringify(target);
        const index = remaining.findIndex((rule) => JSON.stringify(rule) === targetJson);
        if (index !== -1) remaining.splice(index, 1);
    }
    return remaining;
}

async function applyMaterial(item, slug, gradeKey) {
    const material = getMaterial(slug);
    if (!material) throw new Error(`Unknown custom material: ${slug}`);
    const grade = material.grades[gradeKey];
    if (!grade) throw new Error(`Material "${material.label}" has no "${gradeKey}" grade.`);

    // Clear any previously applied custom material first so switching materials doesn't stack effects.
    await removeMaterial(item, { render: false });

    const priorState = {
        name: item.name,
        price: foundry.utils.deepClone(item.system.price?.value ?? {}),
        traits: [...(item.system.traits?.value ?? [])],
        rarity: item.system.traits?.rarity ?? null,
        level: item.system.level?.value ?? null,
        hardness: item.system.hardness ?? null,
        hpMax: item.system.hp?.max ?? null,
        rules: foundry.utils.deepClone(item.system.rules ?? []),
    };

    const basePriceGp = item.system.price?.value?.gp ?? 0;
    const newPriceGp = computePrice(basePriceGp, grade);

    const traits = new Set(priorState.traits);
    traits.add(material.slug);

    const rulesToAdd = foundry.utils.deepClone(material.rules ?? []);
    const newRules = [...priorState.rules, ...rulesToAdd];

    const update = {
        "system.price.value": { gp: newPriceGp },
        "system.traits.value": [...traits],
        "system.rules": newRules,
        [`flags.${MODULE_ID}.${FLAG_APPLIED}`]: {
            slug: material.slug,
            grade: gradeKey,
            addedRules: rulesToAdd,
            priorState,
        },
    };

    // A material sets a floor, the same way the system's own materials work: it never lowers an
    // item's level or rarity below what it already had, only raises it to at least the grade's value.
    if (grade.level !== null && grade.level !== undefined && priorState.level !== null) {
        update["system.level.value"] = Math.max(grade.level, priorState.level);
    }
    if (grade.rarity) {
        const currentRarity = priorState.rarity ?? "common";
        update["system.traits.rarity"] =
            (RARITY_ORDER[grade.rarity] ?? 0) > (RARITY_ORDER[currentRarity] ?? 0) ? grade.rarity : currentRarity;
    }

    if (item.type === "shield") {
        if (grade.hardness !== null && grade.hardness !== undefined) update["system.hardness"] = grade.hardness;
        if (grade.maxHP !== null && grade.maxHP !== undefined) update["system.hp.max"] = grade.maxHP;
    }

    const prefix = material.namePrefix || material.label;
    if (material.prefixName && prefix && !item.name.startsWith(prefix)) {
        update.name = `${prefix} ${item.name}`;
    }

    await item.update(update);
}

async function removeMaterial(item, { render = true } = {}) {
    const applied = item.flags?.[MODULE_ID]?.[FLAG_APPLIED];
    if (!applied) return;

    const { priorState, addedRules } = applied;
    const currentRules = foundry.utils.deepClone(item.system.rules ?? []);
    const restoredRules = addedRules?.length ? subtractRules(currentRules, addedRules) : currentRules;

    const update = {
        name: priorState.name,
        "system.price.value": priorState.price,
        "system.traits.value": priorState.traits,
        "system.rules": restoredRules,
        [`flags.${MODULE_ID}.-=${FLAG_APPLIED}`]: null,
    };

    if (priorState.level !== null) update["system.level.value"] = priorState.level;
    if (priorState.rarity !== null) update["system.traits.rarity"] = priorState.rarity;

    if (item.type === "shield") {
        if (priorState.hardness !== null) update["system.hardness"] = priorState.hardness;
        if (priorState.hpMax !== null) update["system.hp.max"] = priorState.hpMax;
    }

    await item.update(update, { render });
}

export { applyMaterial, computePrice, removeMaterial };
