import { TFM } from "../../config.mjs";
import utils from "../../helpers/utils.mjs";
import { ActorDataModel } from "../abstract.mjs";

const { ArrayField, BooleanField, NumberField, SchemaField, SetField, StringField, HTMLField } = foundry.data.fields;

export default class CharacterData extends ActorDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.skills = new ArrayField(new StringField({ initial: 'new skill' }), { initial: [] });

        const WeaponTypeSchema = {};

        for (const [key, weapon] of Object.entries(TFM.WeaponTypes)) {
            WeaponTypeSchema[key] = new SchemaField({ value: new NumberField({ initial: 0, min: 0, max: 3, label: weapon }) });
        }

        // Proficiency modifiers for the character
        schema.proficiency = new SchemaField({
            weaponType: new SchemaField({ ...WeaponTypeSchema }),
            weapon: new SchemaField({
                light: new BooleanField({ initial: false, label: TFM.WeaponClass.light }),
                medium: new BooleanField({ initial: false, label: TFM.WeaponClass.medium }),
                heavy: new BooleanField({ initial: false, label: TFM.WeaponClass.heavy }),
                ranged: new BooleanField({ initial: false, label: TFM.WeaponClass.ranged }),
            }),
            armour: new SchemaField({
                light: new BooleanField({ initial: false, label: TFM.ArmourClass.light }),
                medium: new BooleanField({ initial: false, label: TFM.ArmourClass.medium }),
                heavy: new BooleanField({ initial: false, label: TFM.ArmourClass.heavy }),
            })
        })

        // tracks player experience points
        schema.xp = new SchemaField({
            value: new NumberField({ required: true, nullable: false, min: 0, initial: 0 })
        })

        schema.corruption = this.ResourceField(0, 10);

        // Character description
        schema.details = new SchemaField({
            age: new StringField({ label: TFM.Generic.age }),
            gender: new StringField({ label: TFM.Generic.gender }),
            height: new StringField({ label: TFM.Generic.height }),
            homeland: new StringField({ label: TFM.Generic.homeland }),
            kindred: new StringField({ label: TFM.Generic.kindred }),
            weight: new StringField({ label: TFM.Generic.weight }),
        });

        // array to track users quests
        schema.quests = new ArrayField(new StringField({ initial: '' }), { initial: [] });
        schema.quest_points = new NumberField({ initial: 0, ...this.RequiredConfig, min: 0 });

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.level = utils.levelXp(this.xp.value);
        this.carry_capacity = Math.max(10 + this.abilities.pwr.mod, 1);

        for (const job of this.document.itemTypes.job) {
            this.proficiency.armour.light = job.system.proficiency.armour.light;
            this.proficiency.armour.medium = job.system.proficiency.armour.medium;
            this.proficiency.armour.heavy = job.system.proficiency.armour.heavy;

            for (const [key, value] of Object.entries(this.proficiency.weapon)) {
                this.proficiency.weapon[key] = job.system.proficiency.weapon[key];
            }

            for (const [key, value] of Object.entries(this.proficiency.weaponType)) {
                this.proficiency.weaponType[key].value = job.system.proficiency.weaponType[key] ? 3 : this.proficiency.weaponType[key].value;
            }
        }
    }

    async _preUpdate(changed, options, user) {
        return super._preUpdate(changed, options, user);
    }
}