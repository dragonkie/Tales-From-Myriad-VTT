import { TFM } from "../../config.mjs";
import utils from "../../helpers/utils.mjs";
import { ItemDataModel } from "../abstract.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField,
    HTMLField, ObjectField, DataField, BooleanField } = foundry.data.fields;

export default class ArmourData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.weight = new StringField({
            ...this.RequiredConfig,
            label: TFM.Generic.type,
            blank: false,
            initial: 'light',
            choices: () => {
                const options = TFM.ArmourClass;
                for (const key of Object.keys(TFM.ArmourClass)) options[key] = utils.localize(options[key]);
                return options;
            }
        });

        schema.damage_reduction = new SchemaField({
            base: new NumberField({ initial: 0, label: utils.localize(TFM.Generic.reduction) }),
            bonus: new NumberField({ initial: 0, label: utils.localize(TFM.Generic.bonus) })
        })


        // array of resistances this actor has to different damage types
        schema.resistances = new ArrayField(new SchemaField({
            type: new StringField({
                ...this.RequiredConfig,
                blank: false,
                initial: 'sharp',
                label: TFM.Generic.type,
                choices: () => {
                    const options = utils.duplicate(TFM.DamageTypes);
                    for (const i of Object.keys(options)) options[i] = utils.localize(options[i]);
                    return options;
                }
            }),
            value: new StringField({
                ...this.RequiredConfig,
                blank: false,
                initial: 'normal',
                label: TFM.Generic.resistance,
                choices: () => {
                    const options = utils.duplicate(TFM.DamageResistance);
                    for (const i of Object.keys(options)) options[i] = utils.localize(options[i]);
                    return options;
                }
            })
        }), { initial: [] });

        Object.assign(schema, this.EquipmentFields());

        return schema;
    }

    prepareBaseData() {
        this.damage_reduction.base = 0;
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        // damage reduction is calculated based on your item with the best value up until it gets destroyed
        if (this.weight == 'light') this.damage_reduction.base = 2;
        if (this.weight == 'medium') this.damage_reduction.base = 3;
        if (this.weight == 'heavy') this.damage_reduction.base = 4; // also caps doge to 8

        this.damage_reduction.total = this.damage_reduction.base + this.damage_reduction.bonus;
    }
}