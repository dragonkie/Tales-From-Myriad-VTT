import LOGGER from "../helpers/logger.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export default class TfmItem extends Item {
    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    prepareData() {
        // As with the actor class, items are documents that can have their data
        // preparation methods overridden (such as prepareBaseData()).
        super.prepareData();
    }

    /**
     * Prepare a data object which is passed to any Roll formulas which are created related to this Item
     * @private
     */
    getRollData() {
        // If present, return the actor's roll data.
        if (!this.actor) return null;
        const rollData = this.actor.getRollData();
        // Grab the item's system data as well.
        rollData.item = foundry.utils.deepClone(this.system);

        return rollData;
    }

    async _preDelete(options, user) {
        LOGGER.debug('_preDelete Options', options);
        return super._preDelete(options, user);
    }

    async deleteDialog(options = {}) {
        const type = tfm.utils.localize(this.constructor.metadata.label);
        let confirm = await foundry.applications.api.DialogV2.confirm({
            title: `${game.i18n.format("DOCUMENT.Delete", { type })}: ${this.name}`,
            content: `<h4>${game.i18n.localize("AreYouSure")}</h4><p>${game.i18n.format("SIDEBAR.DeleteWarning", { type })}</p>`,
            options: options
        });

        if (confirm) {
            this.delete();
            return true;
        } else return false;
    }

    /* ------------------------- ACTION EVENTS ------------------------------- */
    async _onDeleteItem(event, target) {
        // Output to let us know we call for a custom delete handler but one is not defined
        LOGGER.debug("Unhandled _onDelteItem in ", this);
    }

    /**
     * Generic function called by sheets to activate their items
     * should be overiden by their child classes
     */
    async use(event, action, options) {
        return await this.system.use(event, action, options);
    };
}
