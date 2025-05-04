import { TFM } from "../../config.mjs";
import { ItemDataModel } from "../abstract.mjs";

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

        return schema;
    }
}