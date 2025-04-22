import { TFM } from "../../config.mjs";
import utils from "../../helpers/utils.mjs";
import { ActorDataModel } from "../abstract.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField, HTMLField } = foundry.data.fields;

export default class CharacterData extends ActorDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.skills = new ArrayField(new StringField({ initial: 'new skill' }), { initial: [] });

        let weaponTypes = TFM.WeaponTypes;
        let profData = {};

        for (const [key, weapon] of Object.entries(weaponTypes)) {
            profData[key] = new SchemaField({ value: new NumberField({ initial: 0, min: 0, max: 3 }) });
        }
        schema.proficiencies = new SchemaField(profData);

        schema.corruption = this.ResourceField(0, 10);

        schema.level_class = new NumberField({ initial: 1, min: 1, max: 10, ...this.RequiredConfig });
        schema.level_specialty = new NumberField({ initial: 0, min: 0, max: 9, ...this.RequiredConfig });

        schema.details = new SchemaField({
            age: new StringField(),
            eyes: new StringField(),
            gender: new StringField(),
            hair: new StringField(),
            height: new StringField(),
            kindred: new StringField(),
            homeland: new StringField(),
            weight: new StringField(),
            quests: new ArrayField(new StringField({ initial: "" }), {
                initial: ["", "", ""]
            })
        });

        schema.dice = new SchemaField({
            casting_arcane: new NumberField({ ...this.RequiredConfig, initial: 6 }),
            casting_occult: new NumberField({ ...this.RequiredConfig, initial: 6 }),
            casting_insight: new NumberField({ ...this.RequiredConfig, initial: 6 }),
            attack_melee: new NumberField({ ...this.RequiredConfig, initial: 6 }),
            attack_ranged: new NumberField({ ...this.RequiredConfig, initial: 6 }),
        })

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.level = this.level_class + this.level_specialty;
        this.carry_capacity = Math.max(10 + this.abilities.pwr.mod, 1);
    }
}