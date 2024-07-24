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

        // sets the weapons damage dice based on type
        this.system.damage.dice = 4;
        switch (this.system.type) {
            case 'lit': 
                this.system.damage.dice = 4;
                break;
            case 'med':
            case 'rng':
                this.system.damage.dice = 8;
                break;
            case 'hvy':
                this.system.damage.dice = 12;
                break;
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
                { value: "firearm", label: "TFM.weapon.firearm" },
                { value: "fist", label: "TFM.weapon.fist" },
                { value: "flail", label: "TFM.weapon.flail" },
                { value: "hammer", label: "TFM.weapon.hammer" },
                { value: "katana", label: "TFM.weapon.katana" },
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
            identified: { label: "Identified", value: this.identified}
        }

        if (this.system.broken) tags.broken = { label: 'Broken' };

        return tags;
    }

    // Used when rendering an item to an actor sheet
    _getActions() {
        const list = this.constructor.ACTIONS;
        const actions = [];


    }

    getRollData() {
        const rollData = super.getRollData();
        if (!rollData) return null; // Doesnt return anything if there is no actor found
        rollData.mod = this.mod;
        rollData.penalty = this.system.damage.penalty;
        rollData.attack = rollData.mod + rollData.penalty;
        rollData.ranged = this.ranged;

        // Adds the weapons critical bonus to the actors
        rollData.crit += this.system.crit;

        // Get users weapon proficiency level
        rollData.prof.level = this.isProficient;
        rollData.prof.label = 'TFM.prof.none';
        if (rollData.prof.level > 0) rollData.prof.label = 'TFM.prof.half';
        if (rollData.prof.level == 3) rollData.prof.label = 'TFM.prof.full';

        return rollData;
    }

    /* --------------------------------------------------- ACTION EVENTS -------------------------------------------------------- */
    async use(action) {

        switch (action) {
            case 'damage':
                return this._onUseDamage();
            case 'critical':
                return this._onUseCritical();
            default:
                return this._onUseAttack();
        }
    }

    async _onUseAttack() {
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

        const template = this.constructor.TEMPLATES.attack;

        // Create roll options dialog
        let dialog = await tfm.applications.TfmDialog.roll(template, rollData);
        const formData = sysUtil.getFormData(dialog.html, '[name]');

        // Prepare dice data
        let rDice = 2;
        let rFaces = 6;
        let rCrit = sysUtil.clamp(rFaces - rollData.crit, 2, rFaces);
        let rKarma = rollData.karma;
        let rBonus = rollData.attack;

        // Prep formula pieces
        let rAdv = ``;
        let rExp = `x>=`;

        // No proficiency means at disadvantage and no explosions, weapon buttons should reflect this
        if (rollData.prof.level == 0) {
            rExp = ``;
        }

        //Half proficiency, Limited to one explosion on dice, no performing stunts
        if (rollData.prof.level > 0 && rollData.prof.level < 3) {
            rKarma = 3;// 3 = 2d6 + 1 explosion dice
        }

        // Check if we have advantage / disadvantage (unprofficient weapons are always at disadvantage)
        if (dialog.button.dataset.action == 'advantage') {
            rDice += 1;
            rAdv = `dl1`;
        }

        if (dialog.button.dataset.action == 'disadvantage' || rollData.prof.level == 0) {
            rDice += 1;
            rAdv = `dh1`
        }
        
        // Prep the formula
        let formula = `${rDice}d${rFaces}${rAdv}`;
        if (rExp != ``) formula += `${rExp}${rCrit}kf${rKarma}`;
        formula += `+ ${rBonus}`;
        

        // Append any situational bonus
        if (formData.situation != '') {
            if (Array.from(formData.situation)[0] != '-') formula += `+`;// Inject a + sign if theres nothing in front of the situation bonus already
            formula += formData.situation;
        }

        // Roll the dice
        let roll = new Roll(formula, rollData);
        await roll.evaluate();

        // Collect active dice roll results
        let results = [];
        for (var a = 0; a < roll.dice.length; a++) {
            for (var b = 0; b < roll.dice[a].results.length; b++) {
                let d = roll.dice[a].results[b];
                if (d.active) results.push(d.result);
            }
        }

        // Special conditions based on dice results
        if (results.length > 1) {
            // Check for critical failure (double 1's) by summing hte first two dice values
            if (results[0] + results[1] === 2) await this._onDamageWeapon(-1);

            // Check for critical success (double 6's) on melee weapons to perform a free stunt
            if (results[0] + results[1] === 12 && !this.ranged) {
                // Attack becomes a stunt, increasing the critical range, and forcing the first two dice to explode
                // This formula is complex since were accounting for the first two dice having already exploded
                // so it should look like 2d6 were rolled naturally and have exploded as usual
                // the actual formula will look more like [12]+(@karma)d6x>(@crit-1, min 1) + @mod
            }
        }

        await roll.toMessage();
        LOGGER.debug(roll);
    }

    async _onUseDamage() {
        const rollData = this.getRollData();
        const template = this.constructor.TEMPLATES.damage;

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

        let dialog = await tfm.applications.TfmDialog.roll(template, rollData, {buttons: tfm.applications.TfmDialog.buttons.simple});
        LOGGER.debug(dialog)
        const formData = sysUtil.getFormData(dialog.html, '[name]');

        let roll = new Roll(`1d${this.system.damage.dice}x>=${this.system.damage.dice - rollData.crit}kf${2+Math.max(rollData.lck, 0)} + @attack`, rollData);
        await roll.evaluate();
        roll.toMessage();
    }

    async _onUseCritical() {

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
        if (!this.actor) return null;
        const proficiencies = this.actor.system.prof;
        return proficiencies[this.system.proficiency];
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

    /**Quick function for applying damage penalty from rolling double 1's on an attack, or anything else someone deems neccesary I suppose */
    async _onDamageWeapon(value = -1) {
        const p = this.penalty + value;
        if (p <= -3) await this.update({ "system.broken": true, "system.damage.penalty": p });// Broken weapon thrown threshold
        else await this.update({ "system.damage.penalty": p });
    }

    static TEMPLATES = {
        attack: `systems/tales-from-myriad/templates/dialog/roll/weapon/attack.hbs`,
        damage: `systems/tales-from-myriad/templates/dialog/roll/weapon/damage.hbs`
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

    // List of actions available as buttons on item sheet to trigger this item, managed by the use() function
    static ACTIONS = {
        attack: {
            label: 'Attack',
            icon: 'fa-sword',
            action: 'attack'
        },
        damage: {
            label: 'Damage',
            icon: 'fa-droplet',
            action: 'damage'
        },
        throw: {
            label: 'Throw',
            icon: 'fa-dagger',
            action: 'throw'
        },
        shoot: {
            label: 'Shoot',
            icon: 'fa-bow-arrow',
            action: 'shoot'
        },
        fire: {
            label: 'Fire',
            icon: 'fa-gun',
            action: 'fire'
        }
    }
}