import { TFM } from "../../config.mjs";
import utils from "../../helpers/utils.mjs";
import { ActorDataModel } from "../abstract.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField, HTMLField, ObjectField, DataField, BooleanField } = foundry.data.fields;

export default class NpcData extends ActorDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.type = new StringField({
            ...this.RequiredConfig,
            label: TFM.Generic.type,
            blank: false,
            initial: 'humanoid',
            choices: () => {
                let options = utils.duplicate(TFM.CreatureTypes);
                for (const key of Object.keys(options)) options[key] = utils.localize(options[key]);
                return options;
            }
        });

        return schema;
    }
}