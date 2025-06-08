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

        // Armour proficiencies given by this job
        schema.armour = new SchemaField({
            light: new BooleanField({ initial: false, label: TFM.ArmourClass.light }),
            medium: new BooleanField({ initial: false, label: TFM.ArmourClass.medium }),
            heavy: new BooleanField({ initial: false, label: TFM.ArmourClass.heavy }),
        })

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

                actor.update(update_data);
            } else {
                utils.warn('TFM.Warn.ToManyJobs');
                return false;
            }
        }

        return super._preCreate(data, options, user);
    }
}