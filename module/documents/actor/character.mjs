import { TfmActor } from "./actor.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import LOGGER from "../../helpers/logger.mjs";

export default class TfmCharacter extends TfmActor {

    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        const system = this.system;
        const abilities = system.abilities;
        const inventory = system.inventory;
        const itemTypes = this.itemTypes;

        // Loop through ability scores, and add their modifiers to our sheet output.
        for (let [key, ability] of Object.entries(abilities)) {
            ability.mod = sysUtil.abilityMod(ability.value);
        }
        // Calculate character level
        system.lvl.value = sysUtil.levelXp(system.lvl.xp);
        // Calculate dodge
        system.dodge.value = 8 + abilities.fin.mod;
        // Max inventory slots
        inventory.size.max = 10 + abilities.pow.mod;
        for (var bonus of inventory.size.bonuses) {
            // Bonus structure {label: "Where this comes from", value: Number}
            if (typeof bonus === "object") inventory.size.max += bonus.value;
        }

        // Compile values from armour types
        for (const item of itemTypes.armour) {
            if (item.equipped) {
                // Only use the best DR value
                if (item.system.dr < system.dr.value) {
                    system.dr.value = item.system.dr;
                }
                // Cap off the max dodge value when wearing heavy armour
                if (item.system.weight === `hvy`) system.dodge.value = Math.min(system.dodge.value, 8);
            }
        }

        // If dual wielding weapons without prof, dodge is capped to 8, don't add modifier to attack rolls
        var weaponCount = 0;
        system.dualWield = false;
        for (const item of itemTypes.weapon) {
            if (item.system.equipped) {
                weaponCount += 1;
            }
        }

        if (weaponCount > 1) {
            system.dodge.value = Math.min(system.dodge.value, 8);
            system.dualWield = true;
        }
    }

    get level() {
        return this.system.lvl.value;
    }

    getRollData() {
        const data = super.getRollData();

        
        return data;
    }
}