import CharacterSheet from "./character.mjs";
import NpcSheet from "./npc.mjs";
import PartySheet from "./party.mjs";
import ShopSheet from "./shop.mjs";

export { CharacterSheet };
export { NpcSheet };
export { PartySheet };
export { ShopSheet };

export const config = [{
        application: CharacterSheet,
        options: {
            label: "TFM.ActorSheet.character",
            types: ['character']
        }
    },{
        application: NpcSheet,
        options: {
            label: "TFM.ActorSheet.npc",
            types: ['npc']
        }
    },{
        application: PartySheet,
        options: {
            label: "TFM.ActorSheet.party",
            types: ['party']
        }
    },{
        application: ShopSheet,
        options: {
            label: "TFM.ActorSheet.shop",
            types: ['shop']
        }
    },
]