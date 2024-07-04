import LOGGER from "../../helpers/logger.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class TfmItem extends Item {
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

    /**
     * Should be overiden to provide additional values for unique items to the sheets prepareContext() function
     * @param {Object} context 
     */
    async getData(context) {
        context.selectors = this._getSelectors();
        context.settings = await this._getSettings(context);
        return context;
    }

    async _getSettings(context) {
        return await renderTemplate(`systems/tales-from-myriad/templates/item/settings/${this.type}.hbs`, context); // Default items dont have an item sheet
    }

    _getSelectors(context) {
        return {};
    }

    _getTags() {
        return {};
    }

    /* ------------------------- ACTION EVENTS ------------------------------- */
    async _onDeleteItem(event, target) {
        LOGGER.debug("Unhandled _onDelteItem in ", this);
    }

    /**
     * Generic function called by sheets to activate their items
     * should be overiden by their child classes
     */
    async use() {
        LOGGER.error("Missing item activation method:", this);
    };

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    async roll() {
        const item = this;

        // Initialize chat data.
        const speaker = ChatMessage.getSpeaker({ actor: this.actor });
        const rollMode = game.settings.get('core', 'rollMode');
        const label = `[${item.type}] ${item.name}`;

        // If there's no roll data, send a chat message.
        if (!this.system.formula) {
            ChatMessage.create({
                speaker: speaker,
                rollMode: rollMode,
                flavor: label,
                content: item.system.description ?? ''
            });
        }
        // Otherwise, create a roll and send a chat message from it.
        else {
            // Retrieve roll data.
            const rollData = this.getRollData();

            // Invoke the roll and submit it to chat.
            const roll = new Roll(rollData.item.formula, rollData);
            // If you need to store the value first, uncomment the next line.
            // let result = await roll.roll({async: true});
            roll.toMessage({
                speaker: speaker,
                rollMode: rollMode,
                flavor: label,
            });
            return roll;
        }
    }
}
