import { TFMActor } from "../tfm-actor.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import LOGGER from "../../helpers/logger.mjs";

export default class TFMCharacter extends TFMActor {

    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        const system = this.system;
        const attributes = system.attributes;
        const abilities = system.abilities;
        const inventory = system.inventory;
        const itemTypes = this.itemTypes;

        // Loop through ability scores, and add their modifiers to our sheet output.
        for (let [key, ability] of Object.entries(abilities)) {
            ability.mod = sysUtil.abilityMod(ability.value);
        }
        // Calculate character level
        attributes.lvl.value = sysUtil.levelXp(attributes.lvl.xp);
        // Calculate dodge
        attributes.dodge.value = 8 + abilities.fin.mod;
        // Max inventory slots
        inventory.size.max = 10 + abilities.pwr.mod;
        for (var bonus of inventory.size.bonuses) {
            // Bonus structure {label: "Where this comes from", value: Number}
            if (typeof bonus === "object") inventory.size.max += bonus.value;
        }

        LOGGER.debug(`PREPARE | DERIVED | ITEMS`);
        // Compile values from armour types
        for (const item of itemTypes.armour) {
            LOGGER.debug("ARMOUR:", item);
            if (item.equipped) {
                if (item.system.dr < attributes.dr.value) {
                    LOGGER.log(`Equipped armour ${item.name} with value ${item.system.dr}`, item);
                    attributes.dr.value = item.system.dr;
                }
                if (item.system.weight === `heavy`) attributes.dodge.value = Math.min(attributes.dodge.value, 8);
            }
        }

        // If dual wielding weapons, dodge is capped to 8, do NOT add modifier to attack rolls
        var weaponCount = 0;
        system.dualWield = false;
        for (const item of itemTypes.weapon) {
            LOGGER.debug("WEAPON:", item);
            if (item.system.equipped) {
                weaponCount += 1;
            }
        }

        if (weaponCount > 1) {
            attributes.dodge.value = Math.min(attributes.dodge.value, 8);
            system.dualWield = true;
        }

    }
}