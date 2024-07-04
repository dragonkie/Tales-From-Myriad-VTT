import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { TfmSheetMixin } from "../base-sheet.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class TfmItemSheet extends TfmSheetMixin(foundry.applications.sheets.ItemSheetV2) {

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["tfm", "sheet", "item"],
        position: { height: 400, width: 700, top: 100, left: 200 },
        window: { resizable: true },
        actions: {
            useItem: this._onUseItem,
            editItem: this._onEditItem,// For opening links to other items
            deleteItem: this._onDeleteItem,// For deleting item links
            equipItem: this._onEquipItem
        }
    }

    static PARTS = {
        header: { template: "systems/tales-from-myriad/templates/item/parts/item-header.hbs" },
        tabs: { template: "systems/tales-from-myriad/templates/parts/sheet-tabs.hbs" },
        body: { template: "systems/tales-from-myriad/templates/item/parts/item-body.hbs" },
        panel: { template: "systems/tales-from-myriad/templates/item/parts/item-panel.hbs" },
        description: { template: "systems/tales-from-myriad/templates/item/parts/item-description.hbs" },
        settings: { template: `systems/tales-from-myriad/templates/item/parts/item-settings.hbs` },
        rules: { template: "systems/tales-from-myriad/templates/item/parts/item-rules.hbs" },
    }

    static TABS = {
        description: { id: 'description', group: 'primary', label: 'TFM.tab.description' },
        settings: { id: 'settings', group: 'primary', label: 'TFM.tab.settings' },
        rules: { id: 'rules', group: 'primary', label: 'TFM.tab.rules' },
    }

    tabGroups = {
        primary: 'description'
    }

    async _prepareContext(options) {
        const doc = this.document;

        const context = {
            document: doc,
            system: doc.system,
            config: CONFIG.TFM,
            name: doc.name,
            tabs: this._getTabs(),
            tags: this._getTags(),
            isEditMode: this.isEditMode,
            isPlayMode: this.isPlayMode,
            isEditable: this.isEditable
        }

        // Augments the context with document specific data
        await this.document.getData(context);

        return context;
    }

    /**
     * Convinience function to access the HTML elements to add to item specific settings menu
     * @returns {Settings}
     */
    async _getSettings(context) {
        return this.document._getSettings(context);
    }

    _getTags() {
        return this.document._getTags();
    }

    /* ----------------------------- ACTION EVENTS ---------------------------------- */
    static async _onEditItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);

        if (!item.sheet.rendered) item.sheet.render(true);
        else item.sheet.bringToFront();
    }

    /**
     * Removes an item entry from an object
     * assumes that the items object uses item ID's as the property path
     * @param {*} event 
     * @param {*} target 
     */
    static async _onDeleteItem(event, target) {
        const document = this.document;

        // Checks for and calls an item managed delete function
        document._onDeleteItem(event, target);
    }


    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.item-edit').click(async ev => {
            const li = $(ev.currentTarget).parents(".item");// Jquery get the first parent element
            const item = await fromUuid(li.data("itemUuid"));
            item.sheet.render(true);
        });

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Remove a nested list item, this works awkwardly with how data needs to be stored
        // the html data needs to be given a "data-target" attribute for this to function and should follow dot notation
        // The given elements MUST HAVE a their uuid data attached to work properly
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const target = (li.data("target"));

            //searches this data object for what were looking for
            let regex = /[A-Za-z]+/g;
            let matches = target.match(regex);

            let select = this.item;
            for (var m of matches) {
                if (select.hasOwnProperty(m)) select = select[m];
                else {
                    LOGGER.error(`Property path for deletion is invalid`)
                    return null;
                }
            }
            if (!Array.isArray(select)) LOGGER.error(`ItemSheet | Item delete event not targeting item array`);

            // Select should currently be targeting our array at this point, now we just need to find our target and splice it
            for (var c = 0; c < select.length; c++) {
                if (select[c].uuid == li.data(`itemUuid`)) {
                    select.splice(c, 1);
                    break;
                }
            }

            // Update the item with the new selector
            var updateData = {};
            updateData[target] = select;
            this.item.update(updateData);// sends the update to the server
        });
    }

    /**
     * Called when foundry registers a drop of any kind on this item sheet
     * if the item defines its own drop handler, it is called
     * otherwise we output a console error for uncaught drop
     */
    async _onDrop(event) {
        LOGGER.debug("ITEM | DROP");
        var dragData = sysUtil.getDragData(event);
        var item = this.item;

        // If the item has a relevant handler, delegate the work to it instead
        if (typeof item._onDrop === `function`) item._onDrop(dragData);
        else {
            LOGGER.error(`No drop function defined for item of type ${item.type}`);
            LOGGER.error(`Event Data:`, dragData);
            super._onDrop(event);
        }
    }
}
