import TfmActorSheet from "../actor.mjs"

export default class NpcSheet extends TfmActorSheet {
    static get PARTS() {
        const parts = {
            body: { template: `${tfm.filepath.template}/actor/npc/body.hbs` },
            header: { template: `${tfm.filepath.template}/actor/npc/header.hbs` },
            features: { template: `${tfm.filepath.template}/actor/npc/features.hbs` },
            details: { template: `${tfm.filepath.template}/actor/npc/details.hbs` },
            effects: { template: `${tfm.filepath.template}/actor/shared/actor-effects.hbs` }
        }

        return parts;
    }

    static TABS = {
        features: { id: "features", group: "main", label: "TFM.Tab.Features" },
        effects: { id: "effects", group: "main", label: "TFM.Tab.Effects" },
        details: { id: "details", group: "main", label: "TFM.Tab.Details" },
    }

    tabGroups = { main: "features" }
}