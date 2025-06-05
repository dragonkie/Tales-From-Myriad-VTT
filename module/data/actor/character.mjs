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

        // Armour proficiency
        schema.armour = new SchemaField({
            light: new BooleanField({ initial: false, label: TFM.ArmourClass.light }),
            medium: new BooleanField({ initial: false, label: TFM.ArmourClass.medium }),
            heavy: new BooleanField({ initial: false, label: TFM.ArmourClass.heavy }),
        })

        schema.corruption = this.ResourceField(0, 10);

        // Character description
        schema.details = new SchemaField({
            age: new StringField(),
            eyes: new StringField(),
            gender: new StringField(),
            hair: new StringField(),
            height: new StringField(),
            kindred: new StringField(),
            homeland: new StringField(),
            weight: new StringField(),
        });

        // array to track users quests
        schema.quests = new ArrayField(new StringField({ initial: '' }), { initial: [] });
        schema.quest_points = new NumberField({ initial: 0, ...this.RequiredConfig, min: 0 });

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.level = this.level_class + this.level_specialty;
        this.carry_capacity = Math.max(10 + this.abilities.pwr.mod, 1);


    }
}