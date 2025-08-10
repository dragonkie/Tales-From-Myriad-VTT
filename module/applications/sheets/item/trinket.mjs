import utils from "../../../helpers/utils.mjs";
import TfmItemSheet from "../item.mjs";

export default class TrinketSheet extends TfmItemSheet {
    static DEFAULT_OPTIONS = {
        actions: {
            delete: this._onDeleteItem,
            cast: this._onCastSpell
        }
    }

    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/trinket.hbs` };
        return parts;
    }

    static get TABS() {
        const tabs = super.TABS;
        tabs.spells = { id: 'spells', group: 'primary', label: 'TFM.Tab.Spells' };
        delete tabs.rules;
        return tabs;
    }

    async _prepareContext() {
        const context = await super._prepareContext();
        context.spells = [];
        for (const uuid of context.system.spells) {
            const data = {};
            const item = await fromUuid(uuid);
            if (item) {
                data.item = item;
                data.enriched = await utils.enrichHTML(item.system.description.identified);
                context.spells.push(data);
            }
        }
        return context;
    }

    async _onDropItem(event, item) {
        const { type, uuid } = utils.getDragEventData(event);
        const itemData = item.toObject();

        // Handle special management of specific item types
        // Usually means making additional items, or applying effects or stat changes
        if (item.type == 'spell') {
            // Catch for duplicate items
            for (const spell of this.document.system.spells) {
                if (spell == item.uuid) {
                    utils.warn('TFM.Warn.DuplicateSpell');
                    return;
                }
            }

            let clone = utils.duplicate(this.document.system.spells);
            clone.push(item.uuid);
            this.document.update({ 'system.spells': clone });
        }
    }

    static async _onDeleteItem(event, item) {
        console.log('working')

    }

    static async _onCastSpell(event, target) {
        if (!this.document.actor) {
            utils.warn('TFM.Warn.NoActor');
            return;
        }

        const actor = this.document.actor;
        console.log('trinket actor', actor);
        const uuid = target.closest('[data-uuid]').dataset.uuid;
        const spell = await fromUuid(uuid);
        if (spell) return spell.system._onCastSpell(event, { actor: this.document.actor });
    }
}