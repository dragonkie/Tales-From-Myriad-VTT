import LOGGER from "../../helpers/logger.mjs";
import utils from "../../helpers/utils.mjs";
import TfmSheetMixin from "./mixin.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class TfmItemSheet extends TfmSheetMixin(foundry.applications.sheets.ItemSheetV2) {

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["tfm", "sheet", "item"],
        position: { height: 'auto', width: 600, top: 60, left: 120 },
        window: { resizable: false },
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
        description: { id: 'description', group: 'primary', label: 'TFM.Tab.Description' },
        details: { id: 'details', group: 'primary', label: 'TFM.Tab.Details' },
        rules: { id: 'rules', group: 'primary', label: 'TFM.Tab.Rules' }
    }

    tabGroups = {
        primary: 'description'
    }

    //==============================================================================================================
    //> Sheet Context
    //==============================================================================================================
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
            identified: {
                label: tfm.utils.localize('TFM.Generic.Description'),
                field: this.document.system.schema.getField('description.identified'),
                value: this.document.system.description.identified,
                enriched: await utils.enrichHTML(context.system.description.identified, enrichmentOptions),
            },
            unidentified: {
                label: `${tfm.utils.localize('TFM.Generic.Unidentified')} ${tfm.utils.localize('TFM.Generic.Description')}`,
                field: this.document.system.schema.getField('description.unidentified'),
                value: this.document.system.description.unidentified,
                enriched: await utils.enrichHTML(context.system.description.unidentified, enrichmentOptions),
            },
            chat: {
                label: `${tfm.utils.localize('CHAT.Chat')} ${tfm.utils.localize('TFM.Generic.Description')}`,
                field: this.document.system.schema.getField('description.chat'),
                value: this.document.system.description.chat,
                enriched: await utils.enrichHTML(context.system.description.chat, enrichmentOptions),
            },
        }

        return context;
    }

    //==============================================================================================================
    //> Sheet Actions
    //==============================================================================================================
    static async _onEditItem(event, target) {
        const uuid = target.closest(".item[data-uuid]").dataset.uuid;
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
}
