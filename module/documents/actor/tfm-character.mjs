import { TFMActor } from "../tfm-actor.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";

export default class TFMCharacter extends TFMActor {


    prepareDerivedData() {
        // Make modifications to data here. For example:
        const system = this.system;
        const attributes = system.attributes;
        const abilities = system.abilities;

        // Loop through ability scores, and add their modifiers to our sheet output.
        for (let [key, ability] of Object.entries(abilities)) {
            ability.mod = sysUtil.abilityMod(ability.value);
        }
        // Calculate character level
        attributes.lvl.value = sysUtil.levelXp(attributes.lvl.xp);
        // Calculate dodge
        attributes.dodge.value = 8 + abilities.fin.mod;
        // Max inventory slots
        attributes.inventory.size.max = 10 + abilities.pwr.mod;
        for (var bonus of attributes.inventory.size.bonuses) {
            // Bonus structure {label: "Where this comes from", value: Number}
            if (typeof bonus === "object") attributes.inventory.size.max += bonus.value;
        }
    }

    get hands() {

    }
}