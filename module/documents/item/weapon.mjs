import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { TfmItem } from "./item.mjs";

export default class TfmWeapon extends TfmItem {

    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        this.system.broken = this.isBroken;
        this.system.damaged = this.isDamaged;
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

    }

    /* --------------------------------------------- RENDER CONTEXT ----------------------------------------------------*/
    _getSelectors(context) {
        const selectors = {};
        // Damage type selector
        selectors.damageTypes = foundry.applications.fields.createSelectInput({
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
        selectors.weaponType = foundry.applications.fields.createSelectInput({
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
        selectors.ability = foundry.applications.fields.createSelectInput({
            options: [
                { value: "pow", label: "TFM.ability.pow" },
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

        // Weapon proficiency type
        selectors.proficiency = foundry.applications.fields.createSelectInput({
            options: [
                { value: "axe", label: "TFM.weapon.axe" },
                { value: "bow", label: "TFM.weapon.bow" },
                { value: "dagger", label: "TFM.weapon.dagger" },
                { value: "fist", label: "TFM.weapon.fist" },
                { value: "flail", label: "TFM.weapon.flail" },
                { value: "hammer", label: "TFM.weapon.hammer" },
                { value: "katana", label: "TFM.weapon.katana" },
                { value: "pistol", label: "TFM.weapon.pistol" },
                { value: "polearm", label: "TFM.weapon.polearm" },
                { value: "sword", label: "TFM.weapon.sword" },
                { value: "thrown", label: "TFM.weapon.thrown" },
                { value: "whip", label: "TFM.weapon.whip" },
            ],
            groups: [],
            value: this.system.proficiency,
            valueAttr: "value",
            labelAttr: "label",
            name: "system.proficiency",
            sort: false,
            localize: true,
        }).outerHTML;

        return selectors;
    }

    _getTags() {
        const tags = {
            type: { label: "Type", value: sysUtil.localize(`TYPES.weapon.${this.system.type}`) },
            damage: { label: "Damage", value: sysUtil.localize(`TYPES.dmg.${this.system.damage.type}`) },
            ability: { label: "Ability", value: sysUtil.localize(`TFM.ability.${this.system.ability}`) },
            formula: { label: "Formula", value: this.system.damage.formula },

        }

        if (this.system.broken) tags.broken = { label: 'Broken' };


        return tags;
    }

    /* --------------------------------------------------- ACTION EVENTS -------------------------------------------------------- */
    async use() {
        // Load the dialog template
        const rollData = this.getRollData();

        // Grabs any targeted tokens to automate damage if enabled
        const targets = game.user.targets;
        const targetActors = [];
        let hasTargets = false;
        if (targets.size > 0) {
            hasTargets = true;
            game.user.targets.forEach((token) => {
                targetActors.push(token.actor);
            })
        }


        LOGGER.log(rollData)
        const template = await renderTemplate(`systems/${game.system.id}/templates/dialog/tfm-weapon.hbs`, rollData);

        // Create roll options dialog
        let options = await new Promise(async (resolve, reject) => {
            const buttons = [{
                action: "disadvantage",
                label: "disadvantage",
                callback: (event, button, dialog) => resolve({ form: dialog.querySelector(`form`), mode: 'disadvantage' })
            }, {
                label: "normal",
                action: "roll",
                callback: (event, button, dialog) => resolve({ form: dialog.querySelector(`form`), mode: 'normal' })
            }]

            // if the weapon is damaged, add the button to throw the weapon, should trigger a confirmation popup to be sure
            if (this.isDamaged) {
                buttons.push({
                    label: "thrown crit",
                    action: "crit",
                    callback: (event, button, dialog) => resolve({ form: dialog.querySelector(`form`), mode: 'crit' })
                })
            }

            const dialog = new foundry.applications.api.DialogV2({
                window: { title: "TFM.dialog.useWeapon" },
                content: template,
                buttons: buttons,
                submit: result => {
                    LOGGER.warn(`Dialog testing`, result);
                },
                close: () => reject(null)
            })

            let app = dialog.render(true);
        });

        const formData = sysUtil.getFormData(options.form, '[name]');

        if (options.mode === `crit`) {
            // Confirm that the player wants to throw and destroy their weapon
            confirm = await foundry.applications.api.DialogV2.confirm({
                windw: { title: `Confirm` },
                content: `${sysUtil.localize('TFM.confirm.criticalThrow')}: ${this.name}`,
                rejectClose: false,
                modal: true
            });
            if (confirm) {
                // If the user does want to make a critical throw, change the explosion ranged to x>1kf@lck.mod min 1
                // This damage does not include the damaged penalty, but is affected by proficiency so the dice crits wont help if you arent proficient
            }
            else return null;
        }

        // Get actors proficiency with the weapon, values of 0 - 2

        // Get weapon state, normal, damaged, broken
    }

    getRollData() {
        const rollData = super.getRollData();
        if (!rollData) return null; // Doesnt return anything if there is no actor found
        rollData.mod = this.mod;

        return rollData;
    }

    getProperty(property) {
        return this.system.properties[property];
    }

    // System getters, used to quickly snage valueable info from the item.system context
    get ability() {
        return this.system.ability;
    }
    /**Returns the modifier of the parent actor relevant to this weapon */
    get mod() {
        if (this.isOwned) return this.actor.system.abilities[this.ability].mod;
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
        return this.system.type === 'rng';
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
    get isProficient() {
        if (!this.isOwned) return null;
    }

    // Convinience checker to see if a weapon can be thrown
    get isThrown() {

        return this.isDamaged;
    }

    get isBroken() {
        return this.penalty <= -4;
    }

    get isDamaged() {
        return this.penalty <= -3;
    }

    /**Quick function for applying damage penalty from rolling double 1's on an attack */
    async breakWeapon(value = -1) {
        const p = this.penalty + value;
        if (p <= -3) await this.update({ "system.broken": true, "system.damage.penalty": p });// Broken weapon thrown threshold
        else await this.update({ "system.damage.penalty": p });
    }

    // Quick reference to the different available weapon proficiencies
    static PROFICIENCY = {
        axe: "TFM.weapon.axe",
        bow: "TFM.weapon.bow",
        dagger: "TFM.weapon.dagger",
        fist: "TFM.weapon.fist",
        flail: "TFM.weapon.flail",
        hammer: "TFM.weapon.hammer",
        katana: "TFM.weapon.katana",
        natural: "TFM.weapon.natural",
        pistol: "TFM.weapon.pistol",
        firearm: "TFM.weapon.firearm",
        polearm: "TFM.weapon.polearm",
        scythe: "TFM.weapon.scythe",
        sword: "TFM.weapon.sword",
        thrown: "TFM.weapon.thrown",
        unarmed: "TFM.weapon.unarmed",
        whip: "TFM.weapon.whip",
    }

    static DAMAGE = {
        physical: "TYPES.dmg.phy",
        elemental: "TYPES.dmg.ele",
        special: "TYPES.dmg.spe",
        cold: "TYPES.dmg.cld",
        fire: "TYPES.dmg.fir",
        sonic: "TYPES.dmg.thu",
        electric: "TYPES.dmg.lig",
        poison: "TYPES.dmg.poi",
        acid: "TYPES.dmg.acd",
        radiant: "TYPES.dmg.rad",
        necrotic: "TYPES.dmg.nec",
        force: "TYPES.dmg.frc",
        psychic: "TYPES.dmg.psy",
        slashing: "TYPES.dmg.sla",
        stabbing: "TYPES.dmg.stb",
        bludgeoning: "TYPES.dmg.blg",
    }

    static TYPE = {

    }
}