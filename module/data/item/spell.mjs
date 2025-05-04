import { TFM } from "../../config.mjs";
import utils from "../../helpers/utils.mjs";
import { ItemDataModel } from "../abstract.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField,
    HTMLField, ObjectField, DataField, BooleanField } = foundry.data.fields;

export default class SpelLData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.casting = new SchemaField({
            difficulty: new NumberField({ initial: 2 }),
            level: new NumberField({ initial: 1 })
        });

        schema.range = new NumberField({ initial: 40 });
        schema.targets = new StringField({
            initial: 'any',
            blank: false,
            ...this.RequiredConfig,
            choices: () => {
                let options = { ...TFM.TargetTypes };
                for (const key of Object.keys(options)) options[key] = utils.localize(options[key]);
                return options;
            }
        })

        schema.channeled = new BooleanField({ initial: false, nullable: false });
        schema.ritual = new BooleanField({ initial: false, nullable: false });

        // Uuid of a linked trinket responsible for making this item
        // only applicable when owned by an actor, otherwise should stay blank
        schema.trinket = new StringField({ ...this.RequiredConfig, initial: '', blank: true });

        return schema;
    }
}