import { ItemDataModel } from "../abstract.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField,
    HTMLField, ObjectField, DataField, BooleanField } = foundry.data.fields;

export default class WeaponData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.damage_parts = new ArrayField(new SchemaField({
            formula: new StringField({ initial: '1d6' }),
            type: new StringField({
                initial: 'sharp',
                choices: () => {
                    return { ...tfm.config.DamageTypes }
                }
            })
        }), { initial: [{ formula: '1d6', type: 'sharp' }] });

        schema.penalty = new NumberField({ initial: 0, max: 0, min: -3, requried: true, nullable: false, label: 'TFM.Generic.Penalty' });

        // Weapon tags
        for (const [key, value] of Object.entries(tfm.config.WeaponTags)) {
            schema[key] = new BooleanField({ initial: false, label: value });
        }

        // arrays for magical effects on the item
        schema.curses = new ArrayField(new SchemaField({
            label: new StringField({ initial: '' }),
            description: new StringField({ initial: '' }),
            revealed: new BooleanField({ initial: false, ...this.PrivateConfig })
        }), { initial: [], label: tfm.config.Generic.curse });

        schema.enchantments = new ArrayField(new SchemaField({
            label: new StringField({ initial: '' }),
            description: new StringField({ initial: '' }),
            revealed: new BooleanField({ initial: false, ...this.PrivateConfig })
        }), { initial: [], label: tfm.config.Generic.enchantment });

        // identified check to see if enchantments and curses should all be revealed
        schema.identified = new BooleanField({ initial: false });

        return schema;
    }
}