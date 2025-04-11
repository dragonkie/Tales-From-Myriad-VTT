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
                blank: false,
                ...this.RequiredConfig,
                choices: () => {
                    return { ...tfm.config.DamageTypes, }
                }
            })
        }), { initial: [{ formula: '1d6', type: 'sharp' }] });

        schema.penalty = new NumberField({ initial: 0, max: 0, min: -3, requried: true, nullable: false, label: 'TFM.Generic.Penalty' });

        // Weapon tags
        for (const [key, value] of Object.entries(tfm.config.WeaponTags)) {
            schema[key] = new BooleanField({ initial: false, label: value });
        }

        // adds equipment fields
        Object.assign(schema, this.EquipmentFields());

        return schema;
    }

    /**
     * Calls an items use events
     * @param {Event} action 
     * @param {{}} options 
     */
    async use(event, options) {
        if (!options) return this._onUseAttack();
        if (typeof options == 'string') {

        }
    }

    async _onUseAttack(event, options) {
        console.log('working', this.actor)
        if (!this.actor) return;

        const targets = [];
        for (const token of game.user.targets.entries()) {
            let doc = token[0].document;
            targets.push({
                token: token[0],
                doc: doc,
                sys: doc.actor.system
            })
        }

        console.log(targets);
        console.log(this.getAbility())
    }

    getAbility() {
        if (this.actor) {
            if (this.finesse || this.ranged || this.thrown) return this.actor.system.abilities.fin;
            else return this.actor.system.abilities.pwr;
        }
        return null;
    }


}