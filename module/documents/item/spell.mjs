import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { TfmItem } from "./item.mjs";

export default class TfmSpell extends TfmItem {

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

    _getSelectors(context) {
        const selectors = {};

        selectors.spellSchool = foundry.applications.fields.createSelectInput({
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

        return selectors;
    }

    async use() {
        const rollData = this.getRollData();
        if (!rollData) {
            sysUtil.error(`TFM.notify.error.itemNoActor`);
            return null;
        }

        if (rollData.mod <= 0) {
            sysUtil.error(`TFM.notify.error.castingModZero`);
            return null;
        }

        let dialog = await tfm.applications.TfmDialog.spell(`systems/${tfm.id}/templates/dialog/roll/spell.hbs`, rollData);
        const options = sysUtil.getFormData(dialog.html, '[name]');

        LOGGER.debug(options);
        LOGGER.debug(rollData);

        if (!options || options.cancled) return null;
        if (options.diceCount.value <= 0) {
            sysUtil.warn(`TFM.notify.warn.spellMinDice`);
            return null;
        }

        //Sets the maximum number of dice equal to the ammount rolled + explosions allowed with min of one
        const mDice = options.diceCount + Math.max(1, 1 + rollData.lck);
        let r = new Roll(`${options.diceCount}d6x6kf${mDice}cs>=${this.cd}`, rollData);
        await r.roll();

        var render = await r.render();
        //Parse the numbers rolled to count for duplicate dice values to track miscast levels
        const results = r.dice[0].results;
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
        // Max level of miscast is 4, so we cap it off at 4
        tier = Math.min(4, tier);

        if (options.miscast) {
            // Add the miscast prompt to the chat log
            if (tier > 0) {
                render += `
                <div>Myriad.chat.miscast</div>
                <div>${this.actor.name} Suffers a tier ${tier} miscast</div>
            `
            }
        }
        let success = ``;
        if (r.total >= this.cs) {
            success = `<div>Success!</div>`;
        } else success = `<div>Failure</div>`;

        

        let msg = await r.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `
            <div>Casting: ${this.name}</div>
            <div>${success}</div>
            `,
            content: render,
            create: true,
            rollMode: game.settings.get('core', 'rollMode')
        });

        LOGGER.debug(r);
    }

    /**Retruns the spell school */
    get school() {
        return this.system.type;
    }

    /**Returns a data object of the ability this spell uses from the parent actor */
    get ability() {
        const actor = this.actor;
        if (!actor) return null;

        return sysUtil.duplicate(this.actor.system.abilities[this.system.type])
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