import TfmActorSheet from "../actor.mjs"

export default class CharacterSheet extends TfmActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ["tfm", "sheet", "actor"],
        position: { height: 840, width: 600, top: 100, left: 200 },
        window: { resizable: true }
    }

    static get PARTS() {
        const parts = {
            body: { template: `${tfm.filepath.template}/sheet/actor/character/body.hbs` },
            identity: { template: `${tfm.filepath.template}/sheet/actor/character/identity.hbs` },
            details: { template: `${tfm.filepath.template}/sheet/actor/character/details.hbs` },
            abilities: { template: `${tfm.filepath.template}/sheet/actor/character/abilities.hbs` },
            defence: { template: `${tfm.filepath.template}/sheet/actor/character/defence.hbs` },
            proficiency: { template: `${tfm.filepath.template}/sheet/actor/character/proficiency.hbs` },
            skills: { template: `${tfm.filepath.template}/sheet/actor/character/skills.hbs` },
        }

        return parts;
    }

    static TABS = {
        features: { id: "features", group: "primary", label: "TFM.tab.features" },
        items: { id: "items", group: "primary", label: "TFM.tab.items" },
        spells: { id: "spells", group: "primary", label: "TFM.tab.spells" },
        biography: { id: "biography", group: "primary", label: "TFM.tab.biography" }
    }
}