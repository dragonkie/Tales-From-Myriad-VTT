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
        position: { height: 'auto', width: 'auto', top: 100, left: 200 },
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

    //=================================================================================================================
    //> Sheet Context
    //=================================================================================================================
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

    //=================================================================================================================
    //> Drag & Drop
    //=================================================================================================================
    async _onDropItem(event, item) {
        const { type, uuid } = foundry.applications.ux.TextEditor.getDragEventData(event);
        if (!Object.keys(this.document.constructor.metadata.embedded).includes(type)) return;
        const itemData = item.toObject();

        // Handle special management of specific item types
        // Usually means making additional items, or applying effects or stat changes
        if (item.type == 'trinket') return this._onDropTrinket(event, item);
        if (item.type == 'job' && this.document.type != 'character') return;// Exclusive to characters only

        const modification = {
            "-=_id": null,
            "-=ownership": null,
            "-=folder": null,
            "-=sort": null
        };

        foundry.utils.mergeObject(itemData, modification, { performDeletions: true });
        foundry.utils.getDocumentClass(type).create(itemData, { parent: this.document });
    }

    //===============================================================================================
    //>- Drop Trinket
    //===============================================================================================
    async _onDropTrinket(event, item) {
        console.log('Recieved a trinket drop');
        const { type, uuid } = foundry.applications.ux.TextEditor.getDragEventData(event);
        const modification = {
            "-=_id": null,
            "-=ownership": null,
            "-=folder": null,
            "-=sort": null
        };

        // When recieving a trinket, prompt the user and offer to place all the spells onto their sheet for them
        let confirm = await TfmDialog.confirm({ content: `Add Magic spells to actor sheet?`, modal: true });

        // adds the spells to the actor if confirmed to do so
        const trinket_data = item.toObject();
        if (confirm) {
            // Prepare the list of spells
            const spell_list = [];
            for (const spell of item.system.spells) {
                const spell_doc = await fromUuid(spell)
                if (!spell_doc) throw new Error('One of the trinkets spells is damaged or missing and cannot be automatically added until repaired');
                const item_data = spell_doc.toObject();
                spell_list.push(foundry.utils.mergeObject(item_data, modification, { performDeletions: true }));
            }

            // create the spells
            const created_spells = await foundry.utils.getDocumentClass(type).createDocuments(spell_list, { parent: this.document, renderSheet: false });

            // link the new spells to the trinket
            for (const spell of created_spells) {
                trinket_data.system.links = [];
                trinket_data.system.links.push(spell.uuid);
            }
        }

        // add the trinket to the actor
        console.log('td', trinket_data)
        foundry.utils.mergeObject(trinket_data, modification, { performDeletions: true });

        // Add the new items to the actor
        const created_trinket = await foundry.utils.getDocumentClass(type).create(trinket_data, { parent: this.document, renderSheet: false });
        const justify_link = [];
        for (const link of created_trinket.system.links) {
            let item = await fromUuid(link);
            if (!item) throw new Error('Trinket is created but has damaged links');
            justify_link.push({
                _id: item.id,
                system: {
                    trinket: created_trinket.uuid
                }
            })
        }

        if (justify_link.length > 0) this.document.updateEmbeddedDocuments(type, justify_link);
    }

    async _onDropActor(event, actor) { }
    async _onDropActiveEffect(event, effect) {
        // Clears meta data from owned items if neccesary
        const modification = {
            "-=_id": null,
            "-=ownership": null,
            "-=folder": null,
            "-=sort": null
        };
    }

    async _onSortItem(item, target) {
        if (item.documentName !== "Item") return;
        LOGGER.debug('Sorting item');
        const self = target.closest("[data-tab]")?.querySelector(`[data-uuid="${item.uuid}"]`);
        if (!self || !target.closest("[data-uuid]")) return;

        let sibling = target.closest("[data-uuid]") ?? null;
        if (sibling?.dataset.uuid === item.uuid) return;
        if (sibling) sibling = await fromUuid(sibling.dataset.uuid);

        let siblings = target.closest("[data-tab]").querySelectorAll("[data-uuid]");
        siblings = await Promise.all(Array.from(siblings).map(s => fromUuid(s.dataset.uuid)));
        siblings.findSplice(i => i === item);

        let updates = SortingHelpers.performIntegerSort(item, { target: sibling, siblings: siblings, sortKey: "sort" });
        updates = updates.map(({ target, update }) => ({ _id: target.id, sort: update.sort }));
        this.document.updateEmbeddedDocuments("Item", updates);
    }

    //============================================================================================
    //> Sheet Actions
    //============================================================================================

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onUseItem(event, target) {
        const uuid = target.closest("[data-uuid]").dataset.uuid;
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
        const uuid = target.closest(".item[data-uuid]").dataset.uuid;
        const item = await fromUuid(uuid);

        if (!item.sheet.rendered) item.sheet.render(true);
        else item.sheet.bringToFront();
    }

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onDeleteItem(event, target) {
        const uuid = target.closest(".item[data-uuid]").dataset.uuid;
        const item = await fromUuid(uuid);
        if (event.shiftKey) void item.delete();
        else void item.deleteDialog();
    }

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onEquipItem(event, target) {
        const uuid = target.closest(".item[data-uuid]").dataset.uuid;
        const item = await fromUuid(uuid);

        return item.update({ 'system.equipped': !item.system.equipped })
    }

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onGiveItem(event, target) {
        const uuid = target.closest(".item[data-uuid]").dataset.uuid;
        tfm.socket.sendItem(uuid);
    }

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onLevelProficiency(event, target) {
        if (this.document.type != `character`) return;
        if (!this.isEditMode) return;

        const doc = this.document;
        const prof = target.closest('[data-prof]').dataset.prof
        var value = doc.system.proficiency.weaponType[prof].value + (event.shiftKey ? -1 : 1);
        if (value > 3) value = 0;
        if (value < 0) value = 3;
        doc.update({ [`system.proficiency.weaponType.${prof}.value`]: value });
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

    //==================================================================================================================
    //> Sheet Config popups
    //==================================================================================================================

    /**
     * @param {Event} event
     * @param {Element} target
     */
    static async _onEditResistance(event, target) {
        let content = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">`;
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

        content += `</div>`;

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
        const field_dodge = this.document.system.schema.getField('dodge.base');
        const field_dr = this.document.system.schema.getField('dr.base');

        let content = '';
        content += field_dodge.toFormGroup({
            label: utils.localize(TFM.Generic.dodge),
        }, { value: this.document.system.dodge.base }).outerHTML;
        content += field_dr.toFormGroup({
            label: utils.localize(TFM.Generic.reduction),
        }, { value: this.document.system.dr.base }).outerHTML;

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
    //> Context Menu
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
