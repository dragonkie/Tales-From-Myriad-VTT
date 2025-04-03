import LOGGER from "../../helpers/logger.mjs";
import TfmSheetMixin from "./mixin.mjs";

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
            editItem: this._onEditItem,// For opening links to other items
            deleteItem: this._onDeleteItem,// For deleting item links
            equipItem: this._onEquipItem,
        }
    }

    static get PARTS() {
        return {
            header: { template: `${tfm.filepath.template}/item/header.hbs` },
            body: { template: `${tfm.filepath.template}/item/body.hbs` },
            description: { template: `${tfm.filepath.template}/item/description.hbs` },
            details: { template: `${tfm.filepath.template}/item/details.hbs` }
        }
    }

    static TABS = {
        description: { id: 'description', group: 'primary', label: 'TFM.tab.description' },
        details: { id: 'details', group: 'primary', label: 'TFM.tab.details' },
        rules: { id: 'rules', group: 'primary', label: 'TFM.tab.rules' }
    }

    tabGroups = {
        primary: 'description'
    }

    /**
     * @override 
     * Passes the context data used to render the HTML template
    */
    async _prepareContext(partId, content) {
        const context = await super._prepareContext(partId, content);

        const enrichmentOptions = {
            rollData: context.rollData
        };

        context.descriptions = {
            value: {
                label: tfm.utils.localize('TFM.Generic.Description'),
                field: this.document.system.schema.getField('description.value'),
                value: this.document.system.description.value,
                enriched: await TextEditor.enrichHTML(context.system.description.value, enrichmentOptions),
            },
            unidentified: {
                label: `${tfm.utils.localize('TFM.Generic.Unidentified')} ${tfm.utils.localize('TFM.Generic.Description')}`,
                field: this.document.system.schema.getField('description.unidentified'),
                value: this.document.system.description.unidentified,
                enriched: await TextEditor.enrichHTML(context.system.description.unidentified, enrichmentOptions),
            },
            chat: {
                label: `${tfm.utils.localize('CHAT.Chat')} ${tfm.utils.localize('TFM.Generic.Description')}`,
                field: this.document.system.schema.getField('description.chat'),
                value: this.document.system.description.chat,
                enriched: await TextEditor.enrichHTML(context.system.description.chat, enrichmentOptions),
            },
        }

        return context;
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

    /**
     * Called when foundry registers a drop of any kind on this item sheet
     * if the item defines its own drop handler, it is called
     * otherwise we output a console error for uncaught drop
     */
    async _onDrop(event) {
        LOGGER.debug("ITEM | DROP");
        var dragData = tfm.utils.getDragData(event);
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
