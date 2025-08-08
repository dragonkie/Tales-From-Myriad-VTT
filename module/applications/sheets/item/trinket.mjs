import utils from "../../../helpers/utils.mjs";
import TfmItemSheet from "../item.mjs";

export default class TrinketSheet extends TfmItemSheet {
    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/trinket.hbs` };
        return parts;
    }

    async _onDropItem(event, item) {
        const { type, uuid } = utils.getDragEventData(event);
        const itemData = item.toObject();

        // Handle special management of specific item types
        // Usually means making additional items, or applying effects or stat changes
        console.log('adding spell to trinket')
        if (item.type == 'spell') {
            // Catch for duplicate items
            for (const a of this.document.system.spells) if (a.uuid == item.uuid) return;
            let clone = utils.duplicate(this.document.system.spells);
            clone.push(item.uuid);
            this.document.update({ 'system.spells': clone });
        }
    }
}