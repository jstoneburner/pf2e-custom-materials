import { refreshConfig } from "./config-registration.js";
import { MODULE_ID } from "./constants.js";
import { registerItemSheetHook } from "./item-sheet.js";
import { MaterialManager } from "./material-manager.js";
import { registerSetting } from "./materials-data.js";

Hooks.once("init", () => {
    registerSetting();

    game.settings.registerMenu(MODULE_ID, "materialManager", {
        name: "PF2ECM.Settings.ManagerName",
        label: "PF2ECM.Settings.ManagerLabel",
        hint: "PF2ECM.Settings.ManagerHint",
        icon: "fa-solid fa-gem",
        type: MaterialManager,
        restricted: true,
    });

    registerItemSheetHook();
    refreshConfig();
});

Hooks.once("ready", () => {
    refreshConfig();
});
