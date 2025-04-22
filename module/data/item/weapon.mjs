import TfmDialog from "../../applications/dialog.mjs";
import { TFM } from "../../config.mjs";
import utils from "../../helpers/utils.mjs";
import { ItemDataModel } from "../abstract.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField,
    HTMLField, ObjectField, DataField, BooleanField } = foundry.data.fields;

export default class WeaponData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.damage_parts = new ArrayField(new SchemaField({
            formula: new StringField({ initial: '1d8' }),
            type: new StringField({
                initial: 'auto',
                blank: false,
                ...this.RequiredConfig,
                choices: () => {
                    let options = {};
                    for (const key of Object.keys(TFM.DamageTypes)) options[key] = utils.localize(TFM.DamageTypes[key]);
                    return options;
                }
            })
        }), { initial: [{ formula: '1d6', type: 'sharp' }] });

        schema.ability = new StringField({
            ...this.RequiredConfig,
            initial: "pwr",
            label: TFM.Generic.ability,
            blank: false,
            choices: () => {
                let options = { auto: TFM.Generic.auto, ...TFM.Abilities };
                for (const a of Object.keys(options)) options[a] = utils.localize(options[a]);
                return options;
            }
        })
        schema.proficiency = new StringField({
            ...this.RequiredConfig,
            initial: 'sword',
            label: 'WEAPON TYPE',
            choices: () => {
                let options = {};
                for (const key of Object.keys(TFM.WeaponTypes)) options[key] = utils.localize(TFM.WeaponTypes[key]);
                return options;
            }
        })

        schema.penalty = new NumberField({ initial: 0, max: 0, min: -3, requried: true, nullable: false, label: 'TFM.Generic.Penalty' });
        schema.critical = new NumberField({ initial: 0, min: 0, ...this.RequiredConfig });
        schema.critical_attack = new NumberField({ initial: 0, min: 0, ...this.RequiredConfig });
        schema.critical_damage = new NumberField({ initial: 0, min: 0, ...this.RequiredConfig });

        // Weapon tags
        for (const [key, value] of Object.entries(tfm.config.WeaponTags)) {
            schema[key] = new BooleanField({ initial: false, label: value });
        }

        // adds equipment fields
        Object.assign(schema, this.EquipmentFields());

        return schema;
    }

    //============================================================================================
    // Roll data setup
    //============================================================================================
    getRollData() {
        let data = super.getRollData();
        data.ability = this.getAbility();
        data.proficiency = this.getProficiencyLevel();
        data.canExplode = true;
        data.canStunt = false;

        switch (data.proficiency) {
            case 0:
                data.canExplode = false;
                break; // not proficient, roll at disadvantage, no explosions allowed
            case 3:
                data.canStunt = true;
                break; // full proficiency, as is
            default:// half proficient ( 1 - 2 ) limited to 1 explosion, no stunting
                data.karma = 3;
                break;
        }

        return data;
    }

    //============================================================================================
    // Data getters
    //============================================================================================
    getAbility() {

        const actor = this.actor;
        if (!actor) return null;

        if (this.ability != 'auto') return { ...actor.system.abilities[this.ability], key: this.ability };

        if (this.finesse || this.ranged || this.thrown) return { ...actor.system.abilities.fin, key: 'fin' };
        else return { ...actor.system.abilities.pwr, key: 'pwr' }
    }

    getProficiencyLevel() {
        const actor = this.actor;
        if (!actor) return null;
        return actor.system.proficiencies[this.proficiency].value;
    }

    //============================================================================================
    // Item use actions
    //============================================================================================
    /**
     * Calls an items use events
     * @param {Event} event 
     * @param {String} Action 
     * @param {Object|String} options - pre converted options, or 
     */
    async use(event, action = 'attack', options = {}) {
        if (action == 'attack') return this._onUseAttack(event, options);
        if (action == 'damage') return this._onUseDamage(event, options);
    }

    async _onUseAttack(event, options) {
        if (!this.actor) return;

        const rollData = this.getRollData();
        console.log('weapon roll data', rollData);
        const targets = [];
        for (const token of game.user.targets.entries()) {
            let doc = token[0].document;
            targets.push({
                token: token[0],
                doc: doc,
                sys: doc.actor.system
            })
        }

        let inputs = [{
            label: 'Ability',
            value: rollData.ability.mod
        }, {

        }];

        let roll_type = await new Promise(async (resolve, reject) => {
            let app = await new TfmDialog({
                window: { title: 'Attack Roll' },
                buttons: [{
                    label: 'Disadvantage',
                    action: 'disadvantage'
                }, {
                    label: "Normal",
                    action: "normal",
                    default: true
                }, {
                    label: 'Advantage',
                    action: 'advantage',
                }],
                submit: result => {
                    console.log('result:', result);
                    resolve(result);
                }
            }).render(true);
        })

        let dice = '2d6';
        let explode = 'x>=' + Math.max(2, 6 - this.critical - this.critical_attack);
        let limit = 'kf' + rollData.karma;

        if (rollData.proficiency == 0) {
            if (roll_type == 'advantage') {
                roll_type = 'normal'
                limit = 'kf3';
            } else {
                roll_type = 'disadvantage';
                explode = '';
                limit = '';
            }
        }

        if (roll_type == 'advantage') dice = '3d6dl1';
        if (roll_type == 'disadvantage') dice = '3d6dh1';

        let formula = dice + explode + limit + `+ ${rollData.ability.mod}`;

        let attack = new Roll(formula, rollData);
        await attack.evaluate();
        let msg = await attack.toMessage({
            flavor: `Attack with ${this.parent.name}[${rollData.ability.key}]`,
            speaker: ChatMessage.getSpeaker({ actor: this.actor })
        });
    }

    async _onUseDamage(event, options) {
        const rollData = this.getRollData();

        // formats the given dice formulas to match myriads standards
        let formulas = [];
        for (const part of this.damage_parts) {
            let f = part.formula + `[${part.type}]`;
            console.log(f);
            formulas.push(f);
        }

        let formula = '';
        for (const f of formulas) {
            if (formula != '') formula += '+';
            formula += f;
        }

        let damage = new Roll(formula, rollData);
        await damage.evaluate();
        let msg = await damage.toMessage({
            flavor: `Damage dealt by ${this.parent.name}`,
            speaker: ChatMessage.getSpeaker({ actor: this.actor })
        });
        console.log(damage)
    }
}