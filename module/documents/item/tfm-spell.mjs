import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { TFMItem } from "../tfm-item.mjs";

export default class TFMSpell extends TFMItem {
    prepareBaseData() {

    }

    prepareDerivedData() {

    }

    getRollData() {
        const rollData = super.getRollData();
        if (!rollData) return null;

        rollData.mod = this.ability.mod;

        return rollData;
    }

    async roll() {
        const rollData = this.getRollData();
        if (!rollData) {
            sysUtil.error(`TFM.notify.error.itemNoActor`);
            return null;
        }

        if (rollData.mod <= 0) {
            sysUtil.error(`TFM.notify.error.castingModZero`);
            return null;
        }
        // Rolls a number of dice, up to the modifier value, chosen by the player


        /* 
        This is here to help me with understanding promises
        so to start off a promise requires a total of 3 functions, one that determins if its succesful or not
        then the resolve / reject functions which you can call from inside the main function to return if the 
        promise is succesful or not
        
        resolve and reject as such act like a return value

        dialog boxs always attempt to pass their HTML to the callback functions as the first and only paramater
        */
        async function getRollOptions(data) {
            const template = await renderTemplate(`systems/${game.system.id}/templates/dialog/dialog-roll-spell.hbs`, data);
            return new Promise((resolve, reject) => {
                const dialog = new Dialog({
                    title: "TFM.dialog.rollSpell",
                    content: template,
                    buttons: {
                        disadvantage: {
                            label: "disadvantage",
                            callback: (html) => resolve(html[0].querySelector(`form`))
                        },
                        normal: {
                            label: "normal",
                            callback: (html) => resolve(html[0].querySelector(`form`))
                        }
                    },
                    close: () => reject(null)
                });
                const jqHtml = dialog.render(true);
            })
        }

        const options = await getRollOptions(rollData);

        if (!options) return null;
        if (options.diceCount.value <= 0) {
            sysUtil.warn(`TFM.notify.warn.spellMinDice`);
            return null;
        }

        //Sets the maximum number of dice equal to the ammount rolled + explosions allowed which is min of 1
        const mDice = parseInt(options.diceCount.value) + Math.max(1, 1 + rollData.lck.mod);
        let r = new Roll(`${options.diceCount.value}d6x6kf${mDice}cs>=${this.cd}`, rollData);
        await r.roll();
        var render = await r.render();

        //Parse the numbers rolled to count for duplicate dice values to track miscast levels
        const results = r.dice[0].results;
        const l = results.length;
        var miscasts = {};
        var tier = 0;
        //Grabs the counts of dice
        results.forEach(function (i) { miscasts[i.result] = (miscasts[i.result] || 0) + 1; });
        //Adds up the miscast tiers
        for (var key in miscasts) {
            if (miscasts.hasOwnProperty(key)) {
                tier += miscasts[key] - 1;
            }
        }
        // Add the miscast prompt to the chat log
        if (tier > 0) {
            render += `
                <div>TFM.chat.miscast</div>
                <div>${this.actor.name} Suffers a tier ${tier} miscast</div>
            `
        }

        let msg = await r.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `Casting: ${this.name}`,
            content: render,
            create: true,
            rollMode: game.settings.get('core', 'rollMode')
        });
    }
    /**Retruns the spell school */
    get school() {
        return this.system.type;
    }
    /**Returns a data object of the ability this spell uses from the parent actor */
    get ability() {
        // Changes the ability returned based off the spell type
        // Types: Arcane, Occult, Divine, Nature
        // Divine and Nature both use insight
        // Performances use charm
        const actor = this.actor;
        if (!actor) return null;

        var a = {};

        switch (this.system.type) {
            case "arc":
                a = duplicate(this.actor.system.abilities.arc);
                a.label = "arc";
                break;
            case "occ":
                a = duplicate(this.actor.system.abilities.occ);
                a.label = "occ";
                break;
            case "dic":
            case "nat":
                a = duplicate(this.actor.system.abilities.ins);
                a.label = "ins";
                break;
            default: return null;
        }
        return a;
    }
    get cd() {
        return this.system.difficulty.value;
    }
    get cs() {
        return this.system.difficulty.count;
    }
    get isRitual() {
        return this.system.ritual;
    }
    get isChanneled() {
        return this.system.channeled;
    }
    get range() {
        return this.system.range;
    }
}