import TfmDialog from "../../applications/dialog.mjs";
import { TFM } from "../../config.mjs";
import utils from "../../helpers/utils.mjs";
import { ItemDataModel } from "../abstract.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField,
    HTMLField, ObjectField, DataField, BooleanField } = foundry.data.fields;

export default class TrinketData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        // What kind of trinket is this
        schema.type = new StringField({
            initial: 'arc',
            ...this.RequiredConfig,
            choices: () => {
                let options = { ...TFM.TrinketTypes };
                for (const key of Object.keys(options)) options[key] = utils.localize(options[key]);
                return options;
            }
        });

        // if this is a divine manuscript, charged state is used to replace a component
        schema.charged = new BooleanField({ initial: true });

        // List of spell UUID's to reference
        schema.spells = new ArrayField(
            new StringField({ initial: '', blank: true, ...this.RequiredConfig })
            , { initial: [] }
        );

        // UUID referencing an invocation 
        schema.invocation = new StringField({ initial: '' });

        // holds links to other items that this trinket is responsible for managing
        schema.links = new ArrayField(new StringField({ ...this.RequiredConfig, initial: '', blank: true }), { initial: [] });

        // Overide the dice rolled to cast this spell, attributing the trinkets ability to enhance / hinder casting
        // This feature takes priority over character casting dice settings
        // If the option is left blank, it will not overide the characters settings
        schema.dice = new StringField({
            ...this.RequiredConfig, initial: '', blank: true,
            choices: () => {
                let options = { ...TFM.Dice };
                return options;
            }
        })

        // Bonus to the casting roll made by this trinket, eg /r 2d6 = [3, 4] would turn into /r 2d6 = [3+1, 4+1]
        schema.casting = new NumberField({ initial: 0 })

        // Flat bonus to the number of successes this trinket rolls with spells its linked too
        schema.success = new NumberField({ initial: 0 })

        Object.assign(schema, this.EquipmentFields());

        return schema;
    }
    
    async _preCreate(data, options, user) {
        console.log({ data: data, options: options, user: user });

        const modification = {
            "-=_id": null,
            "-=ownership": null,
            "-=folder": null,
            "-=sort": null
        };

        if (this.actor) {
            // When recieving a trinket, prompt the user and offer to place all the spells onto their sheet for them
            const confirm = await TfmDialog.confirm({ content: `Add spells to actor sheet?`, modal: true });

            // adds the spells to the actor if confirmed to do so
            if (confirm) {
                // Prepare the list of spells
                const spell_list = [];
                for (const uuid of data.system.spells) {
                    const spell = await fromUuid(uuid)
                    if (!spell) {
                        utils.error('TFM.Error.BrokenSpellLink');
                        throw new Error('One of the trinkets spells is damaged or missing and cannot be automatically added until repaired');
                    }
                    const item_data = spell.toObject();
                    spell_list.push(foundry.utils.mergeObject(item_data, modification, { performDeletions: true }));
                }
                const items = await this.actor.createEmbeddedDocuments('Item', spell_list);
                let linkID = foundry.utils.randomID();
                let list = [];
                items.forEach(async item => {
                    list.push({
                        name: item.name,
                        uuid: item.uuid
                    })
                    await item.setFlag(game.system.id, 'trinket', linkID);
                })
                await this.document.updateSource({ flags: { tfm: { spells: { id: linkID, list: list } } } })
            }
        }

        return super._preCreate(data, options, user);
    }

    async _preDelete(options, user) {
        console.log('pre delete called');
        if (this.actor && (this.links.length > 0 || this.invocation != '')) {
            let confirm = await TfmDialog.confirm({ content: 'Would you like to delete linked items as well?', modal: true });

            if (confirm) {
                for (const uuid of this.links) {
                    const spell = await fromUuid(uuid);
                    if (!spell) {
                        utils.warn('TFM.Warn.LinkedDeletionFail');
                        continue;
                    }

                    spell.delete();
                }

                if (this.invocation != '') {
                    const invocation = await fromUuid(this.invocation);
                    if (!invocation) utils.warn('TFM.Warn.LinkedDeletionFail');
                    else invocation.delete();
                }
            }
        }

        return super._preDelete(options, user);
    }

    /**
     * @override
     * 
     * Casts one of the spells stored inside the trinket
     * The trinket provides itself as context so the spell can reference which casting stat to use
     * 
     * @param {*} action 
     * @param {*} options 
     */
    async use(event, action, options) {
        const uuid = event.target.closest("[data-spell]").dataset.spell;

        for (const spell of this.spells) {
            if (spell == uuid) {
                const item = await fromUuid(spell);
                return item.use(event, 'cast', { actor: this.document.actor, trinket: this.document });
            }
        }

        console.error("Failed to find the spell");
    }
}