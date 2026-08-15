import { ITEM_TYPE_TRAIT_CONFIG } from "./constants.js";
import { getMaterials } from "./materials-data.js";

/** Slugs this module has previously written into each CONFIG.PF2E trait record, so stale entries can be cleaned up. */
const previouslyRegistered = new Map();

/**
 * Mirror the world's custom materials into CONFIG.PF2E's trait records so they render with a proper
 * label anywhere PF2e displays item traits (sheets, chat cards, the compendium browser).
 */
function refreshConfig() {
    const materials = getMaterials();
    const wanted = new Map();

    for (const material of Object.values(materials)) {
        for (const itemType of material.itemTypes) {
            const configKey = ITEM_TYPE_TRAIT_CONFIG[itemType];
            if (!configKey) continue;
            if (!wanted.has(configKey)) wanted.set(configKey, new Map());
            wanted.get(configKey).set(material.slug, material.label || material.slug);
        }
    }

    const configKeys = new Set([...previouslyRegistered.keys(), ...wanted.keys()]);
    for (const configKey of configKeys) {
        const record = CONFIG.PF2E[configKey];
        if (!record) continue;

        const stale = previouslyRegistered.get(configKey) ?? new Set();
        const fresh = wanted.get(configKey) ?? new Map();

        for (const slug of stale) {
            if (!fresh.has(slug)) delete record[slug];
        }
        for (const [slug, label] of fresh) {
            record[slug] = label;
        }

        previouslyRegistered.set(configKey, new Set(fresh.keys()));
    }
}

export { refreshConfig };
