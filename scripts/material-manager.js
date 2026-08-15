import { refreshConfig } from "./config-registration.js";
import { GRADES, ITEM_TYPES, MODULE_ID } from "./constants.js";
import { deleteMaterial, emptyGrade, emptyMaterial, getMaterials, saveMaterial } from "./materials-data.js";

function itemTypeChoices(editing) {
    return ITEM_TYPES.map((type) => ({ type, checked: editing?.itemTypes?.includes(type) ?? false }));
}

function gradeRows(editing) {
    return GRADES.map((key) => ({
        key,
        checked: !!editing?.grades?.[key],
        data: editing?.grades?.[key] ?? emptyGrade(),
    }));
}

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

function slugify(text) {
    if (game.pf2e?.system?.sluggify) return game.pf2e.system.sluggify(text);
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

class MaterialManager extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "pf2ecm-material-manager",
        tag: "form",
        window: {
            title: "PF2ECM.Manager.Title",
            icon: "fa-solid fa-gem",
            resizable: true,
        },
        position: { width: 640, height: 700 },
        classes: ["pf2ecm-manager"],
    };

    static PARTS = {
        body: { template: `modules/${MODULE_ID}/templates/material-manager.hbs` },
    };

    /** The material currently being created or edited, or null when showing the list. */
    #editing = null;

    async _prepareContext() {
        const materials = Object.values(getMaterials())
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((material) => ({ ...material, itemTypesLabel: material.itemTypes.join(", ") }));
        const editing = this.#editing;
        return {
            materials,
            hasMaterials: materials.length > 0,
            editing,
            isNew: editing ? !materials.some((m) => m.slug === editing.slug) : false,
            itemTypeChoices: itemTypeChoices(editing),
            gradeRows: gradeRows(editing),
            rulesJson: JSON.stringify(editing?.rules ?? [], null, 2),
        };
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const root = this.element;

        root.querySelector("[data-action='new-material']")?.addEventListener("click", () => {
            this.#editing = emptyMaterial("");
            this.render();
        });

        for (const button of root.querySelectorAll("[data-action='edit-material']")) {
            button.addEventListener("click", () => {
                const slug = button.closest("[data-slug]")?.dataset.slug;
                const materials = getMaterials();
                if (materials[slug]) {
                    this.#editing = materials[slug];
                    this.render();
                }
            });
        }

        for (const button of root.querySelectorAll("[data-action='delete-material']")) {
            button.addEventListener("click", async () => {
                const slug = button.closest("[data-slug]")?.dataset.slug;
                if (!slug) return;
                const confirmed = await foundry.applications.api.DialogV2.confirm({
                    window: { title: game.i18n.localize("PF2ECM.Manager.DeleteTitle") },
                    content: `<p>${game.i18n.format("PF2ECM.Manager.DeleteConfirm", { slug })}</p>`,
                });
                if (!confirmed) return;
                await deleteMaterial(slug);
                refreshConfig();
                this.render();
            });
        }

        for (const checkbox of root.querySelectorAll("[data-grade-toggle]")) {
            checkbox.addEventListener("change", () => {
                const grade = checkbox.dataset.gradeToggle;
                const fields = root.querySelector(`[data-grade-fields="${grade}"]`);
                if (fields) fields.hidden = !checkbox.checked;
            });
        }

        root.querySelector("[data-action='cancel-edit']")?.addEventListener("click", () => {
            this.#editing = null;
            this.render();
        });

        root.querySelector("[data-action='save-material']")?.addEventListener("click", async () => {
            await this.#save(root);
        });
    }

    async #save(root) {
        const label = root.querySelector("[name='label']").value.trim();
        if (!label) {
            ui.notifications.error(game.i18n.localize("PF2ECM.Manager.ErrorNoLabel"));
            return;
        }

        const slugInput = root.querySelector("[name='slug']");
        const isNew = !slugInput.readOnly;
        let slug = slugInput.value.trim() || slugify(label);
        slug = slugify(slug);
        if (!slug) {
            ui.notifications.error(game.i18n.localize("PF2ECM.Manager.ErrorNoSlug"));
            return;
        }

        const existing = getMaterials();
        if (isNew && existing[slug]) {
            ui.notifications.error(game.i18n.format("PF2ECM.Manager.ErrorDuplicateSlug", { slug }));
            return;
        }

        const itemTypes = ITEM_TYPES.filter((type) => root.querySelector(`[name="itemType-${type}"]`)?.checked);
        if (itemTypes.length === 0) {
            ui.notifications.error(game.i18n.localize("PF2ECM.Manager.ErrorNoItemTypes"));
            return;
        }

        const grades = {};
        let hasGrade = false;
        for (const grade of GRADES) {
            const enabled = root.querySelector(`[data-grade-toggle="${grade}"]`)?.checked;
            if (!enabled) {
                grades[grade] = null;
                continue;
            }
            hasGrade = true;
            const num = (name) => {
                const raw = root.querySelector(`[name="grade-${grade}-${name}"]`)?.value;
                return raw === "" || raw === undefined ? null : Number(raw);
            };
            grades[grade] = {
                level: num("level"),
                price: num("price"),
                hardness: num("hardness"),
                maxHP: num("maxHP"),
            };
        }
        if (!hasGrade) {
            ui.notifications.error(game.i18n.localize("PF2ECM.Manager.ErrorNoGrades"));
            return;
        }

        let rules = [];
        const rulesRaw = root.querySelector("[name='rules']").value.trim();
        if (rulesRaw) {
            try {
                rules = JSON.parse(rulesRaw);
                if (!Array.isArray(rules)) throw new Error("not an array");
            } catch {
                ui.notifications.error(game.i18n.localize("PF2ECM.Manager.ErrorBadRules"));
                return;
            }
        }

        const material = {
            slug,
            label,
            itemTypes,
            prefixName: !!root.querySelector("[name='prefixName']")?.checked,
            description: root.querySelector("[name='description']")?.value.trim() ?? "",
            grades,
            rules,
        };

        await saveMaterial(material);
        refreshConfig();
        this.#editing = null;
        this.render();
    }
}

export { MaterialManager };
