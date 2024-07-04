// Import base models
import { TfmActor } from "./actor/actor.mjs";
import { TfmItem } from "./item/item.mjs";

// Import model types
import TfmCharacter from "./actor/character.mjs";
import TfmNpc from "./actor/npc.mjs";

import TfmArmour from "./item/armour.mjs";
import TfmConsumable from "./item/consumable.mjs";
import TfmFeature from "./item/feature.mjs";
import TfmJob from "./item/job.mjs";
import TfmPerformance from "./item/performance.mjs";
import TfmSpell from "./item/spell.mjs";
import TfmTrinket from "./item/trinket.mjs";
import TfmWeapon from "./item/weapon.mjs";

export const dataModels = {
    actor: TfmActor,
    item: TfmItem
}

export const documents = {
    actor: {
        character: TfmCharacter,
        npc: TfmNpc,
    },
    item: {
        armour: TfmArmour,
        consumable: TfmConsumable,
        feature: TfmFeature,
        job: TfmJob,
        performance: TfmPerformance,
        spell: TfmSpell,
        trinket: TfmTrinket,
        weapon: TfmWeapon
    }
}