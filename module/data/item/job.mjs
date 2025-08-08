import { TFM } from "../../config.mjs";
import { ItemDataModel } from "../abstract.mjs";
import LOGGER from "../../helpers/logger.mjs";
import utils from "../../helpers/utils.mjs";
import TfmDialog from "../../applications/dialog.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField, HTMLField, ObjectField, DataField, BooleanField } = foundry.data.fields;
const fields = foundry.data.fields;

export default class JobData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.level = new NumberField({ ...this.RequiredConfig, integer: true, initial: 1 });

        const ability_options = {};
        for (const ability of Object.keys(TFM.Abilities)) ability_options[ability] = new NumberField({ ...this.RequiredConfig, integer: true, initial: 0 });
        schema.abilities = new SchemaField(ability_options);

        schema.features = new ArrayField(new SchemaField({
            level: new NumberField({ initial: 0 }),// What level is this feature made available
            unlocked: new BooleanField({ initial: false }),// Was this feature unlocked
            link: new StringField({ initial: null, nullable: true }),// ID to the owning actors copy of this features items
        }), {
            initial: []
        })

        // Weapon proficiencies
        const weaponData = {};
        for (const [key, value] of Object.entries(TFM.WeaponTypes)) {
            weaponData[key] = new BooleanField({ initial: false, label: value });
        }

        // Actor proficiency fields
        schema.proficiency = new SchemaField({
            armour: new SchemaField({
                light: new BooleanField({ initial: false, label: TFM.ArmourClass.light }),
                medium: new BooleanField({ initial: false, label: TFM.ArmourClass.medium }),
                heavy: new BooleanField({ initial: false, label: TFM.ArmourClass.heavy }),
            }),
            weapon: new SchemaField({
                light: new BooleanField({ initial: false, label: TFM.WeaponClass.light }),
                medium: new BooleanField({ initial: false, label: TFM.WeaponClass.medium }),
                heavy: new BooleanField({ initial: false, label: TFM.WeaponClass.heavy }),
                ranged: new BooleanField({ initial: false, label: TFM.WeaponClass.ranged }),
            }),
            weaponType: new SchemaField(weaponData)
        })

        // list of skills provided by the jobs
        schema.skills = new ArrayField(new StringField({ initial: '' }), { initial: [] });

        // the paths the features can go in
        schema.paths = new ArrayField(new StringField({ initial: 'New Path' }), { initial: [] });

        schema.features = new ArrayField(new SchemaField({
            level: new NumberField({ initial: 1 }), // level the actor needs to be to unlock this feature
            path: new StringField({ initial: '' }), // which skill path does this qualify as
            general: new BooleanField({ initial: false }),// features that can be learned at any point
            implicit: new BooleanField({ initial: false }),// features that you recieve when the job is given to an actor
            name: new StringField({ initial: '' }),// The name for the skill in case it can't be found in linking
            uuid: new StringField({ initial: '' }),// uuid to link the item with
        }), { initial: [] })

        return schema;
    }

    async _preCreate(data, options, user) {
        LOGGER.debug('JobData _preCreate Options', { data: data, options: options, user: user });

        // If this document is being created for an actor
        if (this.document.actor) {
            const actor = this.document.actor;
            // Actors are capped at having 2 jobs, one base and one speciality
            if (actor.itemTypes.job.length < 2) {
                const update_data = {};
                // Add job stats to the actor
                let confirm_stats = await TfmDialog.confirm({ content: `Would you like to apply Job stat modifiers?`, modal: true });
                if (confirm_stats) {
                    for (const key of Object.keys(this.abilities)) {
                        update_data[`system.abilities.${key}.value`] = this.abilities[key] + actor.system.abilities[key].value;
                    }
                }

                // Add the implicit abilities to the actor'
                let confirm_features = await TfmDialog.confirm({ content: `Would you like to add starting features?`, modal: true });
                if (confirm_features) {
                    update_data.items = [];
                    for (const f of data.system.features) {
                        const item = await fromUuid(f.uuid);
                        if (item && f.implicit) update_data.items.push(item.toObject());
                    }
                }

                actor.update(update_data);
            } else {
                utils.warn('TFM.Warn.ToManyJobs');
                return false;
            }
        }

        return super._preCreate(data, options, user);
    }

    async _preDelete() {
        const confirm = super._preDelete();
        if (!confirm) return false;

        // if this is owned by an actor, clean up the modified data
        if (this.document.actor) {
            // actor modifications to undo
            const update_data = {};
            const actor = this.document.actor;

            // confirm to remove stats
            let confirm_stats = await TfmDialog.confirm({ content: `Would you like to remove Job stat modifiers?`, modal: true });
            if (confirm_stats) {
                console.log('confirmed stat change on delete')
                for (const key of Object.keys(this.abilities)) {
                    update_data[`system.abilities.${key}.value`] = actor.system.abilities[key].value - this.abilities[key];
                }
            }

            // Apply the new update
            await actor.update(update_data);
        }
    }
}