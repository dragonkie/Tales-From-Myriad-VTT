import { ItemDataModel } from "../abstract.mjs";
const { ArrayField, NumberField, SchemaField, SetField, StringField,
    HTMLField, ObjectField, DataField, BooleanField } = foundry.data.fields;

export default class ArmourData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.armour_class = new StringField({
            ...this.RequiredConfig,
            initial: 'light',
            choices: () => { return tfm.config.ArmourClass }
        });

        schema.destroyed = new BooleanField({ initial: false });

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        // damage reduction is calculated based on your item with the best value up until it gets destroyed
        this.damage_reduction = 0;
        if (this.armour_class == 'light') this.damage_reduction = 2;
        if (this.armour_class == 'medium') this.damage_reduction = 3;
        if (this.armour_class == 'heavy') this.damage_reduction = 4; // also caps doge to 8
    }
}