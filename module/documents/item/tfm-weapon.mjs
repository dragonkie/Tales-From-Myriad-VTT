import { TFMItem } from "../tfm-item.mjs";

export default class TFMWeapon extends TFMItem {

    prepareBaseData() {

    }

    prepareDerivedData() {

    }

    async roll() {
        // Attack roll
        let rollData = this.rollData;

        let rAttack = new Roll(`2d6 + @mod`, rollData);
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
        return `2d6 + @mod`;
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
}