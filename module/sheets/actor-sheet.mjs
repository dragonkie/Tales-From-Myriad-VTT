import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";
import LOGGER from "../helpers/logger.mjs";
import sysUtil from "../helpers/sysUtil.mjs";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class TFMActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["tfm", "sheet", "actor"],
            template: `systems/${game.system.id}/templates/actor/actor-sheet.hbs`,
            width: 600,
            height: 600,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
        });
    }

    /** @override */
    get template() {
        return `systems/${game.system.id}/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    }

    /* ----------- RENDER OVERIDES --------------------*/
    render(...data) {
        LOGGER.warn(`RENDER START`, ...data);
        var val = super.render(...data);
        LOGGER.warn(`RENDER VAL`, val);
        LOGGER.warn(`RENDER END`, ...data);
        return val;
    }

    _render(...data) {
        LOGGER.warn(`_RENDER START`, ...data);
        var val = super._render(...data);
        LOGGER.warn(`_RENDER VAL`, val);
        LOGGER.warn(`_RENDER END`, ...data);
        return val;
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
    _onDrop(event) {
        LOGGER.log(`Drop event:`, event);
        super._onDrop(event);
    }

    async _onDropItem(event, data) {
        if ( !this.actor.isOwner ) return false;

        LOGGER.log(`Event data`, data);

        const item = await fromUuid(data.uuid);
        const itemData = item.toObject();

        LOGGER.log(`_onDropItem:`, item);

        // Handels if this item is already owned
        if ( this.actor.uuid === item.parent?.uuid ) return this._onSortItem(event, itemData);

        switch (item.type) {
            case `trinket`:
                const spells = item.system.spells;
                const spellList = [];
                // Add spells from the trinket
                for (var [key, value] of Object.entries(spells)) {
                    var s = await fromUuid(value.uuid);
                    spellList.push(s.toObject());
                }
                // Creates the new splles and trinkets
                const newTrinket = await this.actor.createEmbeddedDocuments(`Item`, [itemData]);
                const newSpells = await this.actor.createEmbeddedDocuments(`Item`, spellList);

                // Add flags to the spells so they know to delete themselves
                for (var spell of newSpells) {
                    LOGGER.log(`Trinket uuid:`, newTrinket[0])
                    spell.setFlag(game.system.id, `spell-source`, newTrinket[0].uuid);
                }

                return newTrinket;
                break;
            default:
                return super._onDropItem(event, data);
                break;
        }
    }

    async _onDropActor(event, data) {
        super._onDropActor(event, data);
        LOGGER.log(`Event data`, data);
    }

    async _onDropFolder(event, data) {
        super._onDropFolder(event, data);
        LOGGER.log(`Event data`, data);
    }

    async _onDropActiveEffect(event, data) {
        super._onDropActiveEffect(event, data);
        LOGGER.log(`Event data`, data);
    }

    /** @override */
    getData() {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the items array, and the effects array.

        const context = super.getData();

        // Use a safe clone of the actor data for further operations.
        const actorData = this.actor.toObject(false);

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = actorData.system;
        context.flags = actorData.flags;

        // Prepare character data and items.
        if (actorData.type == 'character') {
            this._prepareItems(context);
            this._prepareCharacterData(context);
        }

        // Prepare NPC data and items.
        if (actorData.type == 'npc') {
            // Handle ability scores.
            for (let [k, v] of Object.entries(context.system.abilities)) {
                v.label = sysUtil.localize(CONFIG.TFM.ability[k]);
                v.abbr = sysUtil.localize(CONFIG.TFM.ability.abbr[k]);
            }

            context.system.attributes.hp.percent = (context.system.attributes.hp.value / context.system.attributes.hp.max) * 100;

            context.system.attributes.dodge.label = sysUtil.localize(`TFM.attr.dodge`);
            context.system.attributes.dodge.abbr = sysUtil.localize(`TFM.attr.abbr.dodge`);

            context.system.attributes.dr.label = sysUtil.localize(`TFM.attr.dr`);
            context.system.attributes.dr.abbr = sysUtil.localize(`TFM.attr.abbr.dr`);

            this._prepareItems(context);
        }

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        // Prepare active effects
        context.effects = prepareActiveEffectCategories(this.actor.effects);

        return context;
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareCharacterData(context) {
        // Handle ability scores.
        for (let [k, v] of Object.entries(context.system.abilities)) {
            v.label = sysUtil.localize(CONFIG.TFM.ability[k]);
            v.abbr = sysUtil.localize(CONFIG.TFM.ability.abbr[k]);
        }

        context.system.attributes.lvl.toLevel = sysUtil.nextLevel(context.system.attributes.lvl.value);
        context.system.attributes.lvl.progress = (context.system.attributes.lvl.xp / context.system.attributes.lvl.toLevel) * 100;

        context.system.attributes.hp.percent = (context.system.attributes.hp.value / context.system.attributes.hp.max) * 100;

        context.system.attributes.dodge.label = sysUtil.localize(`TFM.attr.dodge`);
        context.system.attributes.dodge.abbr = sysUtil.localize(`TFM.attr.abbr.dodge`);

        context.system.attributes.dr.label = sysUtil.localize(`TFM.attr.dr`);
        context.system.attributes.dr.abbr = sysUtil.localize(`TFM.attr.abbr.dr`);
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareItems(context) {
        // Grab list of item types from the template
        const itemTypes = {};
        for (let [key, value] of Object.entries(game.system.documentTypes.Item)) {
            itemTypes[key] = [];
        }
        // Sort the items into lists by type
        for (let item of context.items) {
            LOGGER.log(`Adding [${item.type}] to list`, itemTypes);
            itemTypes[item.type].push(item);
        }
        // Assign and return
        context.itemTypes = itemTypes;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Render the item sheet for viewing/editing prior to the editable check.
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.sheet.render(true);
        });

        // Configure item equipping if applicable
        html.find('.item-equip').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.update({ "system.equipped": !item.system.equipped });
        });

        // -------------------------------------------------------------
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Add Inventory Item
        html.find('.item-create').click(this._onItemCreate.bind(this));

        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.delete();
            li.slideUp(200, () => this.render(false));
        });

        // Active Effect management
        html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

        // Rollable abilities.
        html.find('.rollable').click(this._onRoll.bind(this));

        // Drag events for macros.
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);
            html.find('li.item').each((i, li) => {
                if (li.classList.contains("inventory-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });
        }
    }

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
    async _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(header.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            system: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.system["type"];

        // Finally, create the item!
        return await Item.create(itemData, { parent: this.actor });
    }

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    _onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        // Handle item rolls.
        if (dataset.rollType) {
            if (dataset.rollType == 'item') {
                const itemId = element.closest('.item').dataset.itemId;
                const item = this.actor.items.get(itemId);
                if (item) return item.roll();
            }
        }

        // Handle rolls that supply the formula directly.
        if (dataset.roll) {
            let label = dataset.label ? `[ability] ${dataset.label}` : '';
            let roll = new Roll(dataset.roll, this.actor.getRollData());
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label,
                rollMode: game.settings.get('core', 'rollMode'),
            });
            return roll;
        }
    }

}
