import LOGGER from "../../helpers/logger.mjs";
import TfmDialog from "../dialog.mjs";
import TfmSheetMixin from "./mixin.mjs";
import utils from "../../helpers/utils.mjs"
import { TFM } from "../../config.mjs";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class TfmActorSheet extends TfmSheetMixin(foundry.applications.sheets.ActorSheetV2) {

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["tfm", "sheet", "actor"],
        position: { height: 600, width: 600, top: 100, left: 200 },
        window: { resizable: true },
        actions: {
            useItem: this._onUseItem,
            editItem: this._onEditItem,
            deleteItem: this._onDeleteItem,
            equipItem: this._onEquipItem,
            giveItem: this._onGiveItem,
            levelProf: this._onLevelProficiency,
            roll: this._onRoll,
            editResistance: this._onEditResistance,
            editDefence: this._onEditDefence,
        }
    }

    static get PARTS() {
        return {
            header: { template: `${tfm.filepath.template}/actor/character/header.hbs` },
            tabs: { template: `${tfm.filepath.template}/parts/sheet-tabs.hbs` },
            features: { template: `${tfm.filepath.template}/actor/parts/actor-features.hbs` },
            items: { template: `${tfm.filepath.template}/actor/parts/actor-items.hbs` },
            spells: { template: `${tfm.filepath.template}/actor/parts/actor-spells.hbs` },
            biography: { template: `${tfm.filepath.template}/actor/parts/actor-bio.hbs` }
        }
    }

    static TABS = {
        features: { id: "features", group: "primary", label: "TFM.tab.features" },
        items: { id: "items", group: "primary", label: "TFM.tab.items" },
        spells: { id: "spells", group: "primary", label: "TFM.tab.spells" },
        biography: { id: "biography", group: "primary", label: "TFM.tab.biography" }
    }

    tabGroups = {
        primary: "features",
    }

    /* ------------------------- RENDER CONTEXT DATA PREP ----------------------------------*/
    async _prepareContext(options) {
        const context = await super._prepareContext();

        context.itemTypes = this.document.itemTypes;
        context.items = this.document.items;
        context.item_count = this.document.items.contents.length;

        // prepare ability localization tags
        for (const [key, ability] of Object.entries(context.system.abilities)) {
            ability.label = tfm.config.Abilities[key]
            ability.abbr = tfm.config.AbilitiesAbbr[key]
        }

        return context;
    }

    /* ----------- DRAG AND DROP OVERIDES ------------- */

    /**
     * Built in drop event handeler, will automatically parse and get data from the event
     * triggers appropriate registered action as listed below, any others are added
     * from this system
     * 
     * _onDropItem    _onDropActor
     * _onDropFolder  _onDropActiveEffect
     * 
     * these functions can be overiden, or an interception can be added into this function
     * to access a custom handler instead of calling super._onDrop() to use the default
     * handlers
     * 
     * @param {DragEvent} event 
     */
    async _onDrop(event) {
        LOGGER.log(`Drop event:`, event);
        super._onDrop(event);
    }

    async _onDropItem(event, data) {
        if (!this.actor.isOwner) return false;

        const item = await fromUuid(data.uuid);
        const itemData = item.toObject();

        switch (item.type) {
            case `trinket`:
            /*
            const spells = item.system.spells;
            const spellList = [];
            // Add spells from the trinket
            for (var [key, value] of Object.entries(spells)) {
                var s = await fromUuid(value.uuid);
                spellList.push(s.toObject());
            }

            const trinket = await this.actor.createEmbeddedDocuments(`Item`, [itemData]);
            const newSpells = await this.actor.createEmbeddedDocuments(`Item`, spellList);

            LOGGER.log('trinket', trinket)
            LOGGER.log('Spell list', spellList);

            for (const spell of newSpells) {
                trinket[0].setFlag(game.system.id, 'spells', {
                    [spell.id]: spell.name
                })
            }

            return false;
            */
            default:
                LOGGER.log('Actor recieved item drop');
                break;
        }

        return true;
    }
    //============================================================================================
    // Sheet Actions
    //============================================================================================

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onUseItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);

        const action = target.closest("[data-use]")?.dataset.use;// the action the item is performing if applicable
        const options = target.closest("[data-use-options]")?.dataset.useOptions;// configuration for the item action

        return item.use(event, action, options);
    }

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onEditItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);

        if (!item.sheet.rendered) item.sheet.render(true);
        else item.sheet.bringToFront();
    }

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onDeleteItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);
        const confirm = await TfmDialog.confirm({
            content: `${utils.localize('TFM.confirm.deleteItem')}: ${item.name}`,
            rejectClose: false,
            modal: true
        });
        if (confirm) return item.delete();
        return undefined;
    }

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onEquipItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);

        return item.update({ 'system.equipped': !item.system.equipped })
    }

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onGiveItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        tfm.socket.sendItem(uuid);
    }

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onLevelProficiency(event, target) {
        if (this.document.type != `character`) return;

        const doc = this.document;
        const prof = target.closest('[data-prof]').dataset.prof
        var value = doc.system.proficiencies[prof].value + 1;
        if (value > 3) value = 0;
        doc.update({ [`system.proficiencies.${prof}.value`]: value });
    }

    /**
     * Handle clickable rolls.
     * @param {Event} event - The originating click event
     * @param {Element} target
     * @private
     */
    static async _onRoll(event, target) {
        const rollData = this.document.getRollData();
        const data = target.dataset;

        let roll = new Roll(data.roll, rollData);
        await roll.evaluate();
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: data.flavor,
            rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
    }

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onEditResistance(event, target) {
        let content = ``;

        let resists = this.document.system.resistances;

        // create the inputs for the different groups
        for (const type of Object.keys(TFM.DamageTypes)) {
            let label = utils.localize(TFM.DamageTypes[type]);
            let value = "normal";
            for (const resist of resists) if (resist.type == type) value = resist.value

            /**@type {Element} */
            let ele = new foundry.data.fields.StringField({
                name: type,
                label: label,
                initial: value,
                required: true,
                nullable: false,
                blank: false,
                choices: () => {
                    let options = { normal: TFM.Generic.normal, ...utils.duplicate(TFM.DamageResistance) };
                    for (const i of Object.keys(options)) options[i] = utils.localize(options[i]);
                    return options;
                }
            }).toFormGroup();

            ele.setAttribute('data-type', type);

            content += ele.outerHTML;
        }

        let app = await new TfmDialog({
            window: { title: 'RESISTANCE_CONFIG' },
            content: content,
            classes: ['tfm'],
            buttons: [{
                action: 'cancel',
                label: 'Cancel'
            }, {
                action: 'confirm',
                label: 'Confirm'
            }],
            submit: result => {
                if (result != 'confirm') return;
                const list = [];
                let inputs = app.element.querySelectorAll('[data-type]');

                for (const input of inputs) {
                    let t = input.dataset.type;
                    let v = input.querySelector('select').value;
                    if (v == 'normal') continue;
                    list.push({ type: t, value: v });
                }

                this.document.update({ system: { resistances: list } });
            }
        }).render(true);
    }

    /**
     * 
     * @param {Event} event 
     * @param {Element} target 
     */
    static async _onEditDefence(event, target) {
        let content = '';
        content += this.document.system.schema.getField('dodge.bonus').toFormGroup({
            label: utils.localize(TFM.Generic.dodge),
        }, { value: this.document.system.dodge.bonus }).outerHTML;
        content += this.document.system.schema.getField('dr.bonus').toFormGroup({
            label: utils.localize(TFM.Generic.reduction),
        }, { value: this.document.system.dr.bonus }).outerHTML;

        let app = await new TfmDialog({
            window: { title: 'DEFENCE_CONFIG' },
            content: content,
            classes: ['tfm'],
            buttons: [{
                action: 'cancel',
                label: 'Cancel'
            }, {
                action: 'confirm',
                label: 'Confirm'
            }],
            submit: result => {
                if (result != 'confirm') return;
                let inputs = app.element.querySelectorAll('input[name]');
                let data = {};
                for (const i of inputs) data[i.name] = i.value;
                this.document.update(data);
            }
        }).render(true);
    }

    //============================================================================================
    // Context Menu
    //============================================================================================

    _getItemContextOptions(item) {
        const isOwner = item.isOwner;
        const isCharacter = item.actor.type === "character";
        const isNpc = item.actor.type === "npc";
        const isEquipped = item.isEquipped;
        const options = [{
            name: "TFM.ContextMenu.Edit",
            icon: "<i class='fa-solid fa-fw fa-edit'></i>",
            condition: () => isOwner,
            callback: () => item.sheet.render(true),
            group: "manage"
        }, {
            name: "TFM.ContextMenu.Gift",
            icon: "<i class='fa-solid fa-fw fa-gift'></i>",
            condition: () => isOwner,
            callback: () => tfm.socket.sendItem(item.uuid),
            group: "manage"
        }, {
            name: "TFM.ContextMenu.Delete",
            icon: "<i class='fa-solid fa-fw fa-trash'></i>",
            condition: () => isOwner,
            callback: () => item.delete(),
            group: "manage"
        }];

        return options;
    }
}
