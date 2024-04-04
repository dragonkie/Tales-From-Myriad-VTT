import LOGGER from "../../helpers/logger.mjs";
import { TFMItem } from "../tfm-item.mjs";

export default class TFMWeapon extends TFMItem {

    prepareBaseData() {

    }

    prepareDerivedData() {

    }

    async roll() {
        // Attack roll
        let rollData = this.getRollData();
        LOGGER.debug(rollData);
        let rAttack = new Roll(this.attack, rollData);
        await rAttack.evaluate();
        return rAttack.toMessage();

        // Damage roll
    }

    getRollData() {
        const rollData = super.getRollData();
        if (!rollData) return null; // Doesnt return anything if there is no actor found
        if (this.actor) {
            rollData.mod = this.mod;
        }

        return rollData;
    }

    // System getters, used to quickly snage valueable info from the item.system context
    get ability() {
        return this.system.ability;
    }
    /**Returns the modifier of the parent actor relevant to this weapon */
    get mod() {
        if (this.actor) return this.actor.system.abilities[this.ability].mod;
        return null
    }
    /**Returns the finished damage formula */
    get damage() {
        return `${this.system.damage.formula}`;
    }
    /**Returns the finished attack roll */
    get attack() {
        if (this.actor) return `2d6x6kf${Math.max(this.actor.system.abilities.lck.mod+3, 3)} + @mod`;
        return null;
    }
    get ranged() {
        return this.system.ranged;
    }
    get enchantments() {
        return this.system.enchantments;
    }
    get curses() {
        return this.system.curses;
    }
    get hands() {
        return this.system.hands;
    }
    get identified() {
        return this.system.identified;
    }
    /**If there is a parent actor, check if its proficient */
    get proficient() {

    }
}