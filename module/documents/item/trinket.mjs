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

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);

        // Checks if we have the creation of spells on sheets automated
        if (this.actor && this.system.spells.length > 0) {
            let confirmed = (game.settings.get(tfm.id, 'autoSpellSync'));
            if (confirmed) {
                const spellList = [];
                // Add spells from the trinket
                for (const spell of this.system.spells) {
                    const s = fromUuidSync(spell.uuid);
                    spellList.push(s.toObject());
                }

                this.actor.createEmbeddedDocuments(`Item`, spellList).then(results => {
                    let list = [];
                    for (const spell of results) {
                        list.push(spell.id);
                    }
                    this.setFlag(tfm.id, 'spells', list);
                });
            }
        }
    }

    /* -------------------------- RENDER DATA ----------------------------- */
    async getData(context) {
        // Retrieves the list of spell objects from their saved UUID and adds them to the render context
        context.spells = [];

        for (const [key, value] of Object.entries(this.system.spells)) {
            const spell = await fromUuid(value.uuid);
            
            context.spells.push({
                isActive: spell ? true : false,
                uuid: value.uuid,
                img: spell?.img,
                name: value.name
            });
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
            type: { label: "Type:", value: sysUtil.localize(`TYPES.magic.${this.system.type}`) }
        };

        // If the Divine Manuscript is currently empwoered
        if (this.system.type === 'div') {
            const checked = this.system.empowered ? `checked` : '';
            tags.empowered = { label: 'Empowered' }
        }
        return tags;
    }

    /* ------------------------------------ ACTION EVENT HANDLERS -------------------------------------- */
    async _prepareSpells() {
        // Ensures we have an owning actor
        if (!this.actor) return -1;
        let actor = this.actor;
        let flagSpells = this.getFlag(tfm.id, 'spells');// an array of local ID's to this actor for all items this trinkets in control of
        // Create a list of the spell items found by id on the list, this will be pushed back onto the spells flag, and verifies that the item does exist
        const active = [];
        if (flagSpells) {
            for (const id of flagSpells) {
                if (actor.items.get(id)) active.push(sysUtil.duplicate(id));
            }
        }
        // quick check to see if we have enough spells and can skip this
        if (this.system.spells.length === active.length) return 0;

        // Create a list of spells we need to add
        const update = [];
        const ids = [];
        // Create the list of spells we need by comparing against the list of spells we have
        for (const spell of this.system.spells) {// loop through the trinkets spells
            let found = false;
            for (const check of active) { // loop through the lsit of spells we found
                if (spell.uuid == check) {
                    found = true;
                    break;
                }
            }
            // If we didnt find the spell, add it to the lost of spells to create
            if (!found) {
                var obj = fromUuidSync(spell.uuid).toObject();
                // The relevant flag to be added to the item sheet
                let data = {
                    flags: {
                        'tales-from-myriad': {
                            'sourceUuid': spell.uuid
                        }
                    }
                }
                // merge the flag into the sheet
                obj = foundry.utils.mergeObject(obj, data);
                // Add it the updated object data to the list
                update.push(obj);
            }
        }

        LOGGER.debug('Spells to create', update);


        if (update.length > 0) {
            actor.createEmbeddedDocuments('Item', update).then(result => {
                // Loop through the new items and set their flag origins so we dont recursivly make them forever
                for (let a = 0; a < result.length; a++) {
                    active.push(result[a].id)
                }

                this.setFlag(tfm.id, 'spells', active);
                LOGGER.log('Newly Created Spells', result);
                LOGGER.log('Trinket flags', active);
            })
        }
    }

    _getSpells() {
        const spells = this.system.spells;
        const spellList = [];
        // Add spells from the trinket
        for (var [key, value] of Object.entries(spells)) {
            var s = fromUuidSync(value.uuid);
            let o = s.toObject();
            spellList.push(o);
        }
        return spellList;
    }

    /** @override */
    async _onDeleteItem(event, target) {
        // Deletes a spell or invocation from this trinket
        const spells = sysUtil.duplicate(this.system.spells);
        const invocation = sysUtil.duplicate(this.system.invocation);

        const uuid = target.closest(`.item[data-item-uuid]`).dataset.itemUuid;

        LOGGER.debug('Deleting trinket link');

        // Checks if this is the invocation first
        if (invocation != null) {
            if (invocation.uuid === uuid) {
                this.update({ 'system.invocation': null });
            }
        }

        // Checks for the spell to be deleted
        for (let c = 0; c < spells.length; c++) {
            if (spells[c].uuid === uuid) {
                // Remove the entry if its found
                spells.splice(c, 1)
                // Update the document
                this.update({ 'system.spells': spells });
                // Quit the loop
                break;
            }
        }

    }

    /** 
     * @override
     * Extends document.delete() to have trinket delete their linked spells from the character sheet
     * @param {Object} operation 
     */
    async delete(operation) {
        if (this.isOwned && this.actor) {
            const spellList = this.getFlag(game.system.id, 'spells');
            if (spellList) {
                var actor = this.actor;
                for (const key of spellList) {
                    actor.items.get(key)?.delete();
                }
            }
        }

        super.delete(operation);
    }

    get invocation() {

    }

    get spells() {
        return this.system.spells;
    }
}