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
        position: { height: 'auto', width: 800, top: 100, left: 200 },
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
            editMovement: this._onEditMovement,
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
        features: { id: "features", group: "primary", label: "TFM.Tab.Features" },
        items: { id: "items", group: "primary", label: "TFM.Tab.Items" },
        spells: { id: "spells", group: "primary", label: "TFM.Tab.Spells" },
        biography: { id: "biography", group: "primary", label: "TFM.Tab.Biography" }
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
        const { type, uuid } = utils.getDragEventData(event);
        if (!Object.keys(this.document.constructor.metadata.embedded).includes(type)) return;
        const itemData = item.toObject();

        // Handle special management of specific item types
        // Usually means making additional items, or applying effects or stat changes
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

    async _onDropActor(event, actor) { }

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

    static async _onEditMovement(event, target) {
        const walk_field = this.document.system.schema.getField('movement.walk.base');
        const swim_field = this.document.system.schema.getField('movement.swim.base');
        const fly_field = this.document.system.schema.getField('movement.fly.base');
        let content = '';
        content += walk_field.toFormGroup({ label: utils.localize(TFM.Movement.walk) }, { value: this.document.system.movement.walk.base }).outerHTML;
        content += swim_field.toFormGroup({ label: utils.localize(TFM.Movement.swim) }, { value: this.document.system.movement.swim.base }).outerHTML;
        content += fly_field.toFormGroup({ label: utils.localize(TFM.Movement.fly) }, { value: this.document.system.movement.fly.base }).outerHTML;

        let app = await new TfmDialog({
            window: { title: 'MOVEMENT_CONFIG' },
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
}
