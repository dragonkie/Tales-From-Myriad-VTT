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
            initial: "auto",
            label: TFM.Generic.ability,
            blank: false,
            choices: () => {
                let options = { auto: TFM.Generic.auto, ...TFM.Abilities };
                for (const a of Object.keys(options)) options[a] = utils.localize(options[a]);
                return options;
            }
        });

        schema.proficiency = new StringField({
            ...this.RequiredConfig,
            initial: 'sword',
            label: TFM.Generic.type,
            choices: () => {
                let options = {};
                for (const key of Object.keys(TFM.WeaponTypes)) options[key] = utils.localize(TFM.WeaponTypes[key]);
                return options;
            }
        });

        schema.penalty = new NumberField({ initial: 0, max: 0, min: -3, requried: true, nullable: false, label: 'TFM.Generic.Penalty' });

        // the critical range of dice rolled by this weapon for all / attack / damage dice
        schema.critical = new SchemaField({
            value: new NumberField({ initial: 0, min: 0, ...this.RequiredConfig }),
            attack: new NumberField({ initial: 0, min: 0, ...this.RequiredConfig }),
            damage: new NumberField({ initial: 0, min: 0, ...this.RequiredConfig }),
        });

        // Flat modifiers added to damage of the main weapon damage part, always treated as [auto] tagged damage
        // Usually adding an additional damage part for tis is more than sufficient
        schema.bonuses = new SchemaField({
            attack_bonus: new StringField({ initial: '', ...this.RequiredConfig, blank: true }),
            damage_bonus: new StringField({ initial: '', ...this.RequiredConfig, blank: true })
        });

        // Weapon tags
        for (const [key, value] of Object.entries(TFM.WeaponTags)) {
            schema[key] = new BooleanField({ initial: false, label: value });
        }

        schema.price = new NumberField({ initial: 3, label: TFM.Generic.price });

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
        // If the weapon assigns which ability to use manually
        if (this.ability != 'auto') return { ...actor.system.abilities[this.ability], key: this.ability };
        console.log('deducing ability');
        // Determin the ability to use from context clues
        if (this.finesse || this.thrown || (this.ranged && !this.great)) return { ...actor.system.abilities.fin, key: 'fin' };
        return { ...actor.system.abilities.pwr, key: 'pwr' }
    }

    getProficiencyLevel() {
        const actor = this.actor;
        if (!actor) return null;
        if (actor.type != 'character') return 3;
        return actor.system.proficiency.weaponType[this.proficiency].value;
    }

    // used to render damage formula in other sheets as handlebars can call getter functions
    get damageFormula() {
        let formula = "";
        for (const part of this.damage_parts) {
            if (formula != "") formula += " + ";
            formula += part.formula + ` ${part.type} `;
        }
        return formula;
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

    /**
     * 
     * @param {*} event 
     * @param {*} options 
     * @returns 
     */
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
        }];

        if (this.bonuses.attack != '') inputs.push({ label: 'Weapon Bonus', value: this.bonuses.attack });

        let content = ``;
        for (const input of inputs) content += new StringField().toFormGroup({ label: utils.localize(input.label) }, { value: input.value, disabled: true }).outerHTML;

        let app = await new TfmDialog({
            window: { title: 'TFM.Dialog.Attack' },
            position: { width: 300, height: 'auto' },
            content: content,
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
            submit: async (result) => {
                let dice = '2d6';
                let explode = 'x>=' + Math.max(2, 6 - this.critical.value - this.critical.attack);
                let limit = 'kf' + rollData.karma;

                if (rollData.proficiency == 0) {
                    if (result == 'advantage') {
                        result = 'normal'
                        limit = 'kf3';
                    } else {
                        result = 'disadvantage';
                        explode = '';
                        limit = '';
                    }
                }

                if (result == 'advantage') dice = '3d6dl1';
                if (result == 'disadvantage') dice = '3d6dh1';

                const formula = dice + explode + limit + `+ ${rollData.ability.mod}`;

                const attack = new Roll(formula, rollData);
                await attack.evaluate();

                let msg_flavour = `Attack with ${this.parent.name}[${utils.localize(TFM.Abilities[rollData.ability.key])}]<br>`
                if (rollData.proficiency == 0) msg_flavour += `Not Proficient`;
                else if (rollData.proficiency >= 3) msg_flavour += `Fully Proficient`;
                else msg_flavour += `Half Proficient`;

                // Add role to the content body
                const msg_data = {
                    targets: [],
                    weapon: this.document,
                    user: this.actor,
                    has_hits: false,
                    has_misses: false,
                    roll: await attack.render()
                };

                for (const t of targets) {
                    const d = {
                        uuid: t.doc.actor.uuid,
                        name: t.doc.actor.name,
                        hit: false
                    };
                    if (attack.total >= t.sys.dodge.total) {
                        d.hit = true;
                        msg_data.has_hits = true;
                    } else msg_data.has_misses = true;
                    msg_data.targets.push(d);
                }

                // Enrich the content for enhanced html
                const template = await utils.renderTemplate(`${tfm.filepath.template}/chat/weapon-attack.hbs`, msg_data);
                const enriched = await utils.enrichHTML(template);

                // Push out the message
                const msg = await attack.toMessage({
                    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                    content: enriched
                });

                // Add attack details to the message for parsing
                msg.setFlag(game.system.id, 'context', {
                    type: 'attack',
                    targets: msg_data.targets,
                    user: this.actor.uuid,
                    item: this.document.uuid,
                });
            }
        }).render(true);
    }

    /**
     * 
     * @param {*} event 
     * @param {Object} options 
     * @param {Bool} options.isChatMessage
     */
    async _onUseDamage(event, options) {
        const rollData = this.getRollData();

        // create the targets list to create apply damage buttons for
        const targets = [];
        if (options.targets) for (const t of options.targets) targets.push(await fromUuid(t.uuid))
        else for (const t of game.user.targets.entries()) targets.push(t[0].actor);

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

        // creates the roll object
        const damage = new Roll(formula, rollData);
        await damage.evaluate();

        // Prepare context for rendering the chat message
        const msg_data = {
            targets: targets,
            user: game.user,
            roll: await damage.render(),
            item: this.document
        }

        // Enrich the content for enhanced html
        const template = await utils.renderTemplate(`${tfm.filepath.template}/chat/weapon-damage.hbs`, msg_data);
        const enriched = await utils.enrichHTML(template);

        // create the chat message
        const msg = await damage.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: enriched
        });

        msg.setFlag(game.system.id, 'context', {
            type: 'damage',
            targets: msg_data.targets,
            user: this.actor.uuid,
            item: this.document.uuid,
        })
    }
}