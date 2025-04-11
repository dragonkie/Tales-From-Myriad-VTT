import TfmActorSheet from "../actor.mjs"

export default class CharacterSheet extends TfmActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ["tfm", "sheet", "actor"],
        position: { height: 840, width: 600, top: 100, left: 200 },
        window: { resizable: true }
    }

    static get PARTS() {
        const parts = {
            // main sheet
            body: { template: `${tfm.filepath.template}/actor/character/body.hbs` },
            // sheet tabs
            header: { template: `${tfm.filepath.template}/actor/character/header.hbs` },
            features: { template: `${tfm.filepath.template}/actor/character/features.hbs` },
            inventory: { template: `${tfm.filepath.template}/actor/character/inventory.hbs` },
        }

        return parts;
    }

    static TABS = {
        features: { id: "features", group: "primary", label: "TFM.tab.features" },
        inventory: { id: "inventory", group: "primary", label: "TFM.tab.items" },
        spells: { id: "spells", group: "primary", label: "TFM.tab.spells" },
        biography: { id: "biography", group: "primary", label: "TFM.tab.biography" }
    }

    tabGroups = { primary: "features" };

    async _prepareContext() {
        const context = await super._prepareContext();

        // get labels for weapon proficiencies
        for (const [key, prof] of Object.entries(context.system.proficiency)) {
            prof.label = tfm.config.WeaponTypes[key];
        }

        console.log('Context', context);
        return context;
    }
}