import { applyMaterial, removeMaterial } from "./apply-material.js";
import { FLAG_APPLIED, GRADE_LABELS, ITEM_TYPE_TRAIT_CONFIG, MODULE_ID } from "./constants.js";
import { getMaterial, getMaterials, materialGrades } from "./materials-data.js";

function eligibleMaterials(itemType) {
    return Object.values(getMaterials()).filter((material) => material.itemTypes.includes(itemType));
}

function buildOptions(materials, applied) {
    return materials.flatMap((material) =>
        materialGrades(material).map((grade) => ({
            value: `${material.slug}|${grade}`,
            label: game.i18n.format("PF2ECM.Sheet.OptionLabel", {
                material: material.label,
                grade: game.i18n.localize(GRADE_LABELS[grade]),
            }),
            selected: applied?.slug === material.slug && applied?.grade === grade,
        })),
    );
}

async function renderPanel(app, htmlEl) {
    const item = app.document ?? app.item ?? app.object;
    if (!item || !(item.type in ITEM_TYPE_TRAIT_CONFIG)) return;

    const applied = item.flags?.[MODULE_ID]?.[FLAG_APPLIED] ?? null;
    const materials = eligibleMaterials(item.type);
    if (materials.length === 0 && !applied) return;

    const appliedMaterial = applied ? getMaterial(applied.slug) : null;
    const appliedDisplay = applied
        ? {
              label: appliedMaterial?.label ?? applied.slug,
              grade: game.i18n.localize(GRADE_LABELS[applied.grade] ?? applied.grade),
          }
        : null;

    const templateData = {
        hasApplied: !!appliedDisplay,
        applied: appliedDisplay,
        hasOptions: materials.length > 0,
        options: buildOptions(materials, applied),
    };

    const html = await renderTemplate(`modules/${MODULE_ID}/templates/item-sheet-panel.hbs`, templateData);
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    const panel = wrapper.firstElementChild;
    if (!panel) return;

    const anchor =
        htmlEl.querySelector(".tab[data-tab='details']") ?? htmlEl.querySelector(".sheet-body") ?? htmlEl;
    anchor.prepend(panel);

    panel.querySelector("[data-action='apply-custom-material']")?.addEventListener("click", async () => {
        const select = panel.querySelector("select[name='pf2ecm-material']");
        if (!select?.value) return;
        const [slug, grade] = select.value.split("|");
        await applyMaterial(item, slug, grade);
    });

    panel.querySelector("[data-action='clear-custom-material']")?.addEventListener("click", async () => {
        await removeMaterial(item);
    });
}

function registerItemSheetHook() {
    Hooks.on("renderItemSheetPF2e", (app, html) => {
        const htmlEl = html instanceof jQuery ? html[0] : html;
        renderPanel(app, htmlEl);
    });
}

export { registerItemSheetHook };
