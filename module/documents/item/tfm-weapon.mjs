import { TFM } from "../../helpers/config.mjs";
import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { TFMItem } from "../tfm-item.mjs";

export default class TFMWeapon extends TFMItem {

    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    }

    async roll() {
        // Attack roll
        let rollData = this.getRollData();
        if (!rollData) {
            sysUtil.error(`TFM.notify.error.weapon.unownedRoll`);
            return null;
        }

        // Attack roll
        if (this.system.damage.penalty >= 4) {
            //When a weapon is beyond repair, the next attack roll always hits, and has special modifiers applied to it
            //Ignore the attack roll, and skip straight to damage, all dice except 1's explode here, and ignore damage penalty
            var formula = this.damage;
            var matches = formula.match(/\d+d\d+/g);
            for (var a of matches) {
                const count = Number(a.match(/\d+d/)[0].slice(0, -1));
                const faces = Number(a.match(/d\d+/)[0].substring(1));
                const max = count + Math.max(1, 1 + rollData.lck.mod);
                formula = formula.replace(a, `${count}d${faces}x>=${faces}kf${max}`);
            }

            LOGGER.warn("FORMULA", formula);
            const rDamage = new Roll(formula);
            await rDamage.evaluate(rollData);
            return rDamage.toMessage();
        } else {
            // Roll the attack normally
            const rAttack = new Roll(this.attack, rollData);
            await rAttack.evaluate();
            let aMsg = await rAttack.toMessage();

            // Track to see if double 1's were rolled for the attack, if so, damage the weapon
            var attackDice = rAttack.dice;
            var counter = 0;
            for (var v of attackDice[0].results) {
                if (v.result === 1 && v.active) counter += 1;
            }

            if (counter > 1) {
                LOGGER.warn(`WEAPON | DAMAGED`, this);
                this.breakWeapon();
            }
        }

        // Damage roll
        /*
        const rDamage = new Roll(this.damage);
        await rDamage.evaluate();
        let rMsg = rDamage.toMessage();
        */

    }

    // prepares data for rendering item sheets
    getData(context) {
        context.selectors = {};

        // Damage type selector
        context.selectors.damageTypes = foundry.applications.fields.createSelectInput({
            options: [
                { value: "sla", label: "TYPES.dmg.sla", group: "TYPES.dmg.phy" },
                { value: "stb", label: "TYPES.dmg.stb", group: "TYPES.dmg.phy" },
                { value: "blg", label: "TYPES.dmg.blg", group: "TYPES.dmg.phy" },
                { value: "cld", label: "TYPES.dmg.cld", group: "TYPES.dmg.ele" },
                { value: "fir", label: "TYPES.dmg.fir", group: "TYPES.dmg.ele" },
                { value: "thu", label: "TYPES.dmg.thu", group: "TYPES.dmg.ele" },
                { value: "lig", label: "TYPES.dmg.lig", group: "TYPES.dmg.ele" },
                { value: "poi", label: "TYPES.dmg.poi", group: "TYPES.dmg.ele" },
                { value: "acd", label: "TYPES.dmg.acd", group: "TYPES.dmg.ele" },
                { value: "rad", label: "TYPES.dmg.rad", group: "TYPES.dmg.spe" },
                { value: "nec", label: "TYPES.dmg.nec", group: "TYPES.dmg.spe" },
                { value: "frc", label: "TYPES.dmg.frc", group: "TYPES.dmg.spe" },
                { value: "psy", label: "TYPES.dmg.phy", group: "TYPES.dmg.spe" },
            ],
            groups: ["TYPES.dmg.phy", "TYPES.dmg.ele", "TYPES.dmg.spe"],
            value: this.system.damage.type,
            valueAttr: "value",
            labelAttr: "label",
            localize: true,
            sort: true,
            name: "system.damage.type"
        }).outerHTML;

        // Weapon type
        context.selectors.weaponType = foundry.applications.fields.createSelectInput({
            options: [
                { value: "lit", label: "TYPES.weapon.lit" },
                { value: "med", label: "TYPES.weapon.med" },
                { value: "hvy", label: "TYPES.weapon.hvy" },
                { value: "rng", label: "TYPES.weapon.rng" },
            ],
            groups: [],
            value: this.system.type,
            valueAttr: "value",
            labelAttr: "label",
            name: "system.type",
            sort: false,
            localize: true,
        }).outerHTML;

        // Ability selector
        context.selectors.ability = foundry.applications.fields.createSelectInput({
            options: [
                { value: "pwr", label: "TFM.ability.pwr" },
                { value: "fin", label: "TFM.ability.fin" },
                { value: "ins", label: "TFM.ability.ins" },
                { value: "chr", label: "TFM.ability.chr" },
                { value: "arc", label: "TFM.ability.arc" },
                { value: "occ", label: "TFM.ability.occ" },
                { value: "lck", label: "TFM.ability.lck" },
            ],
            groups: [],
            value: this.system.ability,
            valueAttr: "value",
            labelAttr: "label",
            name: "system.ability",
            sort: false,
            localize: true,
        }).outerHTML;

        return context;
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
        const a = this.actor;
        if (!a) return null;
        const s = a.system;
        if (a) {
            var f = `2d6x6kf${s.maxDice}`
            if (s.dualWield) {
                var m = s.abilities[this.ability].mod;
                if (m >= 0) return f;
                else return f + `${m}`;
            } else {
                return `2d6x6kf${Math.max(s.abilities.lck.mod + 3, 3)} + @mod`;
            }
        }
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
    get penalty() {
        return this.system.damage.penalty;
    }
    /**If there is a parent actor, check if its proficient */
    get proficient() {

    }
    /**Quick function for applying damage penalty from rolling double 1's on an attack */
    async breakWeapon() {
        const p = this.penalty - 1;
        if (p <= -3) await this.update({ "system.broken": true, "system.damage.penalty": p });
        else await this.update({ "system.damage.penalty": p });
    }
}