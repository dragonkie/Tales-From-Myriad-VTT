import { TFM } from "../../config.mjs";
import utils from "../../helpers/utils.mjs";
import { ItemDataModel } from "../abstract.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField,
    HTMLField, ObjectField, DataField, BooleanField } = foundry.data.fields;

export default class FeatureData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.type = new StringField({
            ...this.RequiredConfig,
            initial: 'passive',
            blank: false,
            label: TFM.Generic.type,
            choices: {active: 'Active', passive: 'Passive'}
        })

        return schema;
    }
}