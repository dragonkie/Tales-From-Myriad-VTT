import { ActorDataModel } from "../abstract.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField, HTMLField } = foundry.data.fields;

export default class CharacterData extends ActorDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.skills = new ArrayField(new StringField({ initial: tfm.utils.localize("TFM.ActorSheet.newSkill") }), { initial: [] });
        
        let weaponTypes = tfm.config.WeaponTypes;
        let profData = {};

        for (const [key, weapon] of Object.entries(weaponTypes)) {
            profData[key] = new SchemaField({
                value: new NumberField({initial: 0, min: 0, max: 3}),
                label : new StringField({initial: weapon})
            });
        }

        schema.proficiency = new SchemaField(profData);
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

        return schema;
    }
}