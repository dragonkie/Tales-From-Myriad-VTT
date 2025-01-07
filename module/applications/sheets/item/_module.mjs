import ArmourSheet from "./armour.mjs";
import JobSheet from "./job.mjs";
import SpellSheet from "./spell.mjs";
import TrinketSheet from "./trinket.mjs";
import WeaponSheet from "./weapon.mjs";

export { ArmourSheet };
export { JobSheet };
export { SpellSheet };
export { TrinketSheet };
export { WeaponSheet };
export const config = [{
    application: ArmourSheet,
    options: {
        label: "TFM.ItemSheet.armour",
        types: ['armour']
    }
},{
    application: JobSheet,
    options: {
        label: "TFM.ItemSheet.job",
        types: ['job']
    }
},{
    application: SpellSheet,
    options: {
        label: "TFM.ItemSheet.spell",
        types: ['spell']
    }
},{
    application: TrinketSheet,
    options: {
        label: "TFM.ItemSheet.trinket",
        types: ['trinket']
    }
},{
    application: WeaponSheet,
    options: {
        label: "TFM.ItemSheet.weapon",
        types: ['weapon']
    }
},

]