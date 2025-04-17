import { TFM } from "../../../config.mjs";
import utils from "../../../helpers/utils.mjs";
import TfmActorSheet from "../actor.mjs"

export default class CharacterSheet extends TfmActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ["tfm", "sheet", "actor"],
        position: { height: 800, width: 800, top: 60, left: 120 },
        window: { resizable: false }
    }

    static get PARTS() {
        const parts = {
            // main sheet
            body: { template: `${tfm.filepath.template}/actor/character/body.hbs` },
            // Parts
            header: { template: `${tfm.filepath.template}/actor/character/header.hbs` },
            // tabs
            features: { template: `${tfm.filepath.template}/actor/character/features.hbs` },
            inventory: { template: `${tfm.filepath.template}/actor/character/inventory.hbs` },
            effects: { template: `${tfm.filepath.template}/actor/shared/actor-effects.hbs` }
        }

        return parts;
    }

    static TABS = {
        features: { id: "features", group: "primary", label: "TFM.Tab.Features" },
        inventory: { id: "inventory", group: "primary", label: "TFM.Tab.Inventory" },
        spells: { id: "spells", group: "primary", label: "TFM.Tab.Spells" },
        effects: { id: "effects", group: "primary", label: "TFM.Tab.Effects" },
        details: { id: "journal", group: "primary", label: "TFM.Tab.Details" }
    }

    tabGroups = { primary: "features" };

    async _prepareContext() {
        const context = await super._prepareContext();

        // get labels for weapon proficiencies
        for (const [key, prof] of Object.entries(context.system.proficiency)) {
            prof.label = tfm.config.WeaponTypes[key];
        }

        context.system.corruption.label = utils.localize(TFM.Corruption.label[context.system.corruption.value]);
        context.system.corruption.description = utils.localize(TFM.Corruption.description[context.system.corruption.value]);

        let last_level = utils.nextLevel(context.system.level - 1)
        last_level = context.system.level <= 1 ? 0 : last_level;

        context.system.xp.next = utils.nextLevel(context.system.level);
        context.system.xp.fill = Math.max((context.system.xp.value - last_level) / (context.system.xp.next - last_level) * 100, 0);

        console.log('Context', context);
        return context;
    }
}