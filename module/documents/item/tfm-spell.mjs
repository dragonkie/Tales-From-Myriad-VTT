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

    // prepares data for rendering sheets
    getData(context) {
        context.selectors = {};

        context.selectors.spellSchool = foundry.applications.fields.createSelectInput({
            options: [
                { value: "arc", label: "TYPES.magic.arc" },
                { value: "div", label: "TYPES.magic.div" },
                { value: "nat", label: "TYPES.magic.nat" },
                { value: "occ", label: "TYPES.magic.occ" },
                { value: "per", label: "TYPES.magic.per" },
            ],
            groups: [],
            value: this.system.type,
            valueAttr: "value",
            labelAttr: "label",
            localize: true,
            invert: false,
            sort: false,
            name: "system.type"
        }).outerHTML;

        return context;
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

        const template = await renderTemplate(`systems/${game.system.id}/templates/dialog/dialog-roll-spell.hbs`, rollData);
        const options = await new Promise(async (resolve, reject) => {

            const dialog = new foundry.applications.api.DialogV2({
                window: { title: "TFM.dialog.rollSpell" },
                content: template,
                buttons: [{
                    action: "disadvantage",
                    label: "disadvantage",
                    callback: (event, button, dialog) => resolve(dialog.querySelector(`form`))
                }, {
                    label: "normal",
                    callback: (event, button, dialog) => resolve(dialog.querySelector(`form`))
                }],
                submit: result => {
                    LOGGER.warn(`Dialog testing`, result);
                },
                close: () => reject(null)
            })

            var app = dialog.render({force: true});
            sysUtil.waitForElm(`#${dialog.id}`).then(() => {
                var element = document.getElementById(dialog.id);
                element.querySelector(`[name="plus"]`).addEventListener(`click`, () => {
                    var val = Number(element.querySelector(`[name="diceCount"]`).value);
                    val = Math.min(val + 1, rollData.mod);
                    element.querySelector(`[name="diceCount"]`).value = val;
                });

                element.querySelector(`[name="minus"]`).addEventListener(`click`, () => {
                    var val = Number(element.querySelector(`[name="diceCount"]`).value);
                    val = Math.max(val - 1, 1);
                    element.querySelector(`[name="diceCount"]`).value = val;
                });
            });
        });

        if (!options) return null;
        if (options.diceCount.value <= 0) {
            sysUtil.warn(`TFM.notify.warn.spellMinDice`);
            return null;
        }

        //Sets the maximum number of dice equal to the ammount rolled + explosions allowed with min of one
        const mDice = parseInt(options.diceCount.value) + Math.max(1, 1 + rollData.lck.mod);
        let r = new Roll(`${options.diceCount.value}d6x6kf${mDice}cs>=${this.cd}`, rollData);
        await r.roll();
        var render = await r.render();

        //Parse the numbers rolled to count for duplicate dice values to track miscast levels
        const results = r.dice[0].results;
        const l = results.length;
        var miscasts = {};
        var tier = 0;
        //Counts dice duplicates for any active dice
        results.forEach((i) => {
            if (i.active) miscasts[i.result] = (miscasts[i.result] || 0) + 1;
        });

        //Adds up the miscast tiers
        for (var key in miscasts) {
            tier += Math.max(miscasts[key] - 1, 0);
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
        const actor = this.actor;
        if (!actor) return null;

        var a = {};

        return foundry.utils.duplicate(this.actor.system.abilities[this.system.ability])

        switch (this.system.ability) {
            case "arc":
                a = duplicate(this.actor.system.abilities.arc);
                a.label = "arc";
                break;
            case "occ":
                a = duplicate(this.actor.system.abilities.occ);
                a.label = "occ";
                break;
            case "ins":
                a = duplicate(this.actor.system.abilities.ins);
                a.label = "ins";
                break;
            default: return null;
        }
        return a;
    }

    get cd() {
        return this.system.cd;
    }

    get cs() {
        return this.system.cs;
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

    // Used to check if this spells trinket exists
    get hasTrinket() {
        if (this.isOwned) {
            switch (this.system.type) {

            }
        }
    }
}