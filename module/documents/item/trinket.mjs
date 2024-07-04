import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { TfmItem } from "./item.mjs";

export default class TfmTrinket extends TfmItem {

    async _onDrop(data) {
        //Called by the item sheet class
        const item = await fromUuid(data.uuid);
        if (item.type === `spell`) {
            for (const spell of this.system.spells) {
                if (spell.uuid == data.uuid) {
                    sysUtil.warn(`TFM.notify.warn.trinket Duplicate Spell`)
                    return null;
                }
            }

            this.system.spells.push({
                name: item.name,
                uuid: item.uuid
            })


            await this.update({ "system.spells": this.system.spells });
            this.render(false);
        }
    }

    /* -------------------------- RENDER DATA ----------------------------- */
    async getData(context) {
        // Retrieves the list of spell objects from their saved UUID and adds them to the render context
        context.spells = [];

        for (const [key, value] of Object.entries(this.system.spells)) {
            const spell = await fromUuid(value.uuid);
            context.spells.push(spell);
        }

        await super.getData(context);
    }

    _getSelectors() {
        const selectors = {};

        selectors.spellSchool = foundry.applications.fields.createSelectInput({
            options: [
                { value: "arc", label: "Arcane Focus" },
                { value: "div", label: "Divine Manuscript" },
                { value: "occ", label: "Occult Trinket" },
            ],
            groups: [],
            value: this.system.type,
            valueAttr: "value",
            labelAttr: "label",
            localize: true,
            invert: false,
            sort: false,
            name: "system.type"
        }).outerHTML;

        return selectors;
    }

    _getTags() {
        const tags = {
            type: { label: "Type:", value: sysUtil.localize(`TYPES.magic.${this.system.type}`)}
        };

        // If the Divine Manuscript is currently empwoered
        if (this.system.type === 'div') {
            const checked = this.system.empowered ? `checked` : '';
            tags.empowered = { label: 'Empowered'}
        }
        return tags;
    }

    /* ------------------------------------ ACTION EVENT HANDLERS -------------------------------------- */
    /** @override */
    async _onDeleteItem(event, target) {
        // Deletes a spell from the trinkets list of spells, or removes its invocation
        const spells = sysUtil.duplicate(this.system.spells);
        const invocation = sysUtil.duplicate(this.system.invocation);

        const uuid = target.closest(`.item[data-item-uuid]`).dataset.itemUuid;

        LOGGER.debug('Deleting trinket link');

        // Checks if this is the invocation first
        if (invocation != null) {
            if (invocation.uuid === uuid) {
                this.update({ 'system.invocation': null});
            }
        }
        // Checks for the spell to be deleted
        for (let c = 0; c < spells.length; c++) {
            if (spells[c].uuid === uuid) {
                // Remove the entry if its found
                spells.splice(c, 1)
                // Update the document
                this.update({ 'system.spells': spells});
                // Quit the loop
                break;
            }   
        }
    
    }

    /** 
     * @override
     * Extends document.delete() to have trinket delete their linked spells from the character sheet
     * @param {idk} operation 
     */
    async delete(operation) {
        if (this.isOwned) {
            const spellList = this.getFlag(game.system.id, 'spells');
            if (spellList) {
                var actor = this.actor;
                for (const [key, value] of Object.entries(spellList)) {
                    actor.items.get(key).delete();
                }
            }
        }

        super.delete(operation);
    }

    get invocation() {

    }
}