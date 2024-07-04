import { TfmActor } from "./actor.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";

export default class TfmNpc extends TfmActor {


    prepareDerivedData() {
        // Make modifications to data here. For example:
        const system = this.system;
        const attributes = system.attributes;
        const abilities = system.abilities;

        // Loop through ability scores, and add their modifiers to our sheet output.
        for (let [key, ability] of Object.entries(abilities)) {
            ability.mod = sysUtil.abilityMod(ability.value);
        }
        // Calculate dodge
        system.dodge.value = 7 + abilities.fin.mod;
    }
}