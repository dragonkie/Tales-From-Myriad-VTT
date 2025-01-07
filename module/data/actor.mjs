import sysUtil from "../helpers/sysUtil.mjs";
import SystemDataModel from "./abstract.mjs";
const { ArrayField, NumberField, SchemaField, SetField, StringField, HTMLField } = foundry.data.fields;

/* ---------------------------------------------- */
/* Generic actor data model                       */
/* ---------------------------------------------- */
export default class ActorDataModel extends SystemDataModel {
    static defineSchema() {
        const schema = {};

        schema.abilities = new SchemaField({
            pwr: new SchemaField({
                value: new NumberField({ initial: 6 })
            }),
            fin: new SchemaField({
                value: new NumberField({ initial: 6 })
            }),
            ins: new SchemaField({
                value: new NumberField({ initial: 6 })
            }),
            chm: new SchemaField({
                value: new NumberField({ initial: 6 })
            }),
            arc: new SchemaField({
                value: new NumberField({ initial: 6 })
            }),
            occ: new SchemaField({
                value: new NumberField({ initial: 6 })
            }),
            lck: new SchemaField({
                value: new NumberField({ initial: 6 })
            })
        })

        schema.hp = new SchemaField({
            value: new NumberField({ initial: 6 }),
            max: new NumberField({ initial: 6 }),
            min: new NumberField({ initial: 0 })
        });

        schema.xp = new SchemaField({
            value: new NumberField(),
            min: new NumberField(),
            max: new NumberField(),
            pct: new NumberField()
        });

        schema.corruption = new SchemaField({
            value: new NumberField(),
            min: new NumberField({ initial: 0, max: 0, min: 0, required: true, nullable: false }),
            max: new NumberField()
        });

        

        schema.bonuses = new SchemaField({

        });

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        for (const ability in this.abilities) this.abilities[ability].mod = sysUtil.abilityMod(this.abilities[ability].value);
    }
};