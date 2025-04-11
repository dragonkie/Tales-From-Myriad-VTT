import TfmActorSheet from "../actor.mjs"

export default class NpcSheet extends TfmActorSheet {
    static get PARTS() {
        const parts = {
            body: { template: `${tfm.filepath.template}/actor/character/body.hbs` },
            identity: { template: `${tfm.filepath.template}/actor/character/identity.hbs` },
            features: { template: `${tfm.filepath.template}/actor/character/features.hbs` },
            abilities: { template: `${tfm.filepath.template}/actor/character/abilities.hbs` },
            inventory: { template: `${tfm.filepath.template}/actor/character/inventory.hbs` },
        }

        return parts;
    }
}