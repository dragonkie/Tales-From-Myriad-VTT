import { TFM } from "../config.mjs";
import utils from "../helpers/utils.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField, HTMLField, ObjectField, DataField, BooleanField } = foundry.data.fields;
const fields = foundry.data.fields;

/**
 * @typedef {Function} DataFieldValidator
 * @example field.validate(value, options) => {isNaN(value) ? false : true}
 */

/**
 * @typedef {Object} DataFieldOptions
 * @prop {Boolean} required - 
 * @prop {Boolean} nullable - 
 * @prop {Boolean} gmOnly - 
 * @prop {any} initial - 
 * @prop {String} label - 
 * @prop {String} hint - 
 * @prop {DataFieldValidator} validate - 
 * @prop {String} validationError - 
 */

/**
 * @typedef {Object} StringFieldParams
 * @prop {Boolean} blank - can this field be an empty string
 * @prop {Boolean} trim - Should string be trimmed as part of cleaning
 * @prop {Object|Function|String[]} - An array of values or an object of values/labels which represent allowed choices for the field.
 * @prop {Boolean} textSearch - Is this string field a target for text search
 */

/**
 * @typedef {DataFieldOptions & StringFieldParams} StringFieldOptions 
 */

//=================================================================================================
//Generic system data model
//=================================================================================================
export class SystemDataModel extends foundry.abstract.TypeDataModel {
    /**
     * @param {Number} value 
     * @returns {SchemaField}
     */
    static ValueField(value) {
        return new SchemaField({
            value: new NumberField({ initial: value, required: true, nullable: false }),
        });
    }

    /**
     * Adds a field that can be used for token bars with a value, min, and max
     * @param {Number} value The starting value
     * @param {Number} min minimum clamping value
     * @param {Number} max Maximum clamping value
     * @returns {SchemaField} New ValueField
     */
    static ResourceField(value = 10, max = 10, min = 0) {
        return new SchemaField({
            value: new NumberField({ initial: value, required: true, nullable: false }),
            min: new NumberField({ initial: min, required: true, nullable: false }),
            max: new NumberField({ initial: max, required: true, nullable: false }),
        })
    }

    static ProficiencyField() {
        return new SchemaField({
            value: new NumberField({ initial: 0, min: 0, max: 3, required: true, nullable: false }),// 0 - 3
            label: new StringField({ initial: '', required: false, nullable: true }),// Sword, bow, dagger, etc
        });
    }


    /**
     */
    static get RequiredConfig() {
        return { required: true, nullable: false };
    }

    /**
     * @returns {DataFieldOptions}
     */
    static get PrivateConfig() {
        return { required: true, nullable: false, gmOnly: true };
    }

    getRollData() {
        const data = { ...this };
        return data;
    }

    get document() {
        return this.parent;
    }
};

//=================================================================================================
//> Actor data model
//=================================================================================================
export class ActorDataModel extends SystemDataModel {
    static defineSchema() {
        const schema = {};

        // add in actor abilities
        const abilities = {};
        for (const key of Object.keys(TFM.Abilities)) abilities[key] = this.ValueField(6);
        schema.abilities = new SchemaField(abilities);

        // adds in resource fields
        schema.hp = this.ResourceField(6, 6);
        schema.dr = new SchemaField({
            base: new NumberField({ initial: 0 }),
        })
        schema.dodge = new SchemaField({
            base: new NumberField({ initial: 8 }),
        })

        schema.description = new HTMLField({ initial: "" });

        schema.movement = new SchemaField({
            walk: new SchemaField({
                base: new NumberField({ initial: 30 }),
            }),
            swim: new SchemaField({
                base: new NumberField({ initial: 0 }),
            }),
            fly: new SchemaField({
                base: new NumberField({ initial: 0 }),
            })
        });

        schema.size = new StringField({
            ...this.RequiredConfig,
            blank: false,
            initial: "medium",
            label: TFM.Generic.size,
            choices: () => {
                const options = TFM.Sizes;
                for (const i of Object.keys(options)) options[i] = utils.localize(options[i]);
                return options;
            }
        });

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

        schema.dual_wielder = new BooleanField({ initial: false, ...this.RequiredConfig });

        const casting_options = {};
        for (const key of Object.keys(TFM.Abilities)) casting_options[key] = new SchemaField({
            dice: new StringField({
                initial: 'd6', ...this.RequiredConfig, blank: false, choices: () => {
                    let options = { ...TFM.Dice };
                    for (const dice of Object.keys(options)) options[dice] = utils.localize(options[dice]);
                    return options;
                }
            }),
            casting: new NumberField({ initial: 0 }),
            success: new NumberField({ initial: 0 })
        })

        schema.casting = new SchemaField(casting_options);

        schema.bonuses = new SchemaField({
            dodge: new NumberField({ initial: 0 }),
            dr: new NumberField({ initial: 0 }),
            walk: new NumberField({ initial: 0 }),
            swim: new NumberField({ initial: 0 }),
            fly: new NumberField({ initial: 0 }),
            pwr: new NumberField({ initial: 0 }),
            fin: new NumberField({ initial: 0 }),
            ins: new NumberField({ initial: 0 }),
            chm: new NumberField({ initial: 0 }),
            arc: new NumberField({ initial: 0 }),
            occ: new NumberField({ initial: 0 }),
            lck: new NumberField({ initial: 0 }),
            pwr_mod: new NumberField({ initial: 0 }),
            fin_mod: new NumberField({ initial: 0 }),
            ins_mod: new NumberField({ initial: 0 }),
            chm_mod: new NumberField({ initial: 0 }),
            arc_mod: new NumberField({ initial: 0 }),
            occ_mod: new NumberField({ initial: 0 }),
            lck_mod: new NumberField({ initial: 0 }),
        });

        return schema;
    }

    //=============================================================================================
    //>- Prepare Derived Data
    //=============================================================================================
    prepareDerivedData() {
        super.prepareDerivedData();

        //=========================================================================================
        //>-- Prepare Abilities
        //=========================================================================================
        for (const ability in this.abilities) {
            this.abilities[ability].total = this.abilities[ability].value + this.bonuses[ability];
            this.abilities[ability].mod = utils.abilityMod(this.abilities[ability].total) + this.bonuses[ability + '_mod'];
        }
        this.dodge.total = Math.max(this.dodge.base + this.abilities.fin.mod + this.bonuses.dodge, 1);
        this.dr.total = this.dr.base + this.bonuses.dr;

        //=========================================================================================
        //>-- Prepare Movement
        //=========================================================================================
        this.movement.walk.total = this.movement.walk.base + this.bonuses.walk;
        this.movement.swim.total = this.movement.swim.base + this.bonuses.swim;
        this.movement.fly.total = this.movement.fly.base + this.bonuses.fly;

        //=========================================================================================
        //>-- Prepared data from items
        //=========================================================================================
        const document = this.parent;
        let held_weapons = 0;

        for (const item of document.items.contents) {
            // Equipped armours
            if (item.type == 'armour' && item.system.equipped) {
                this.dr.total = this.dr.base + this.dr.bonus + item.system.damage_reduction.base + item.system.damage_reduction.bonus;
                if (item.system.weight == 'heavy') this.dodge.total = Math.min(this.dodge.total, 8);
            }

            // Equipped Weapons

            if (item.type == 'weapon' && item.system.equipped) {
                held_weapons += 1;


            }
        }

        if (held_weapons >= 2 && !this.dual_wielder) {
            // Dual wielding can reduce dodge unless an override is toggled
            this.dodge.total = Math.min(this.dodge.total, 8)
        }
    }
};

//=================================================================================================
//> Item Data Model
//=================================================================================================
export class ItemDataModel extends SystemDataModel {
    static defineSchema() {
        const schema = {};

        // Item descriptions
        schema.description = new SchemaField({
            value: new HTMLField({ initial: "" }),
            chat: new HTMLField({ initial: "" }),
            unidentified: new HTMLField({ initial: "" }),
        })

        return schema;
    }

    get actor() { return this.parent.actor }

    getRollData() {
        let data = super.getRollData();

        data.actor = this.actor;

        let actorData = {};
        if (data.actor) {
            console.log('adding actor roll data');
            actorData = data.actor.getRollData();
            data = { ...data, ...actorData };
        }

        return data;
    }

    //==============================================
    //>- Item field mixins
    //==============================================
    static StackingFields() {
        return new SchemaField({
            /*
            Large items take 2 slots - heavy weapons, spare heavy armour, etc
            Regular items take one slot - Swords, shields, bows
            Small items stack up to 10 - candles, rations, caltrops
            Ammo stacks up to 30 - arrows, bullets
            Tiny items do not take up a slot
            */
            quantity: new NumberField({ initial: 1 }), // used only on stacking tiny items
            size: new StringField({// Overide for the number of slots an item takes up
                blank: false,
                initial: 'medium',
                choices: () => {
                    let options = utils.duplicate(TFM.Sizes);
                    for (const i of Object.keys(options)) options[i] = utils.localize(options[i]);
                    return options;
                }
            }),
            price: new NumberField({ initial: 3, label: TFM.Generic.price })// price in crowns to purchase
        });
    }

    /**
     * Returns the list for holding enchantments, curses and blessings
     * @returns {ArrayField}
     */
    static EnchantmentField() {
        // arrays for magical effects on the item
        return new ArrayField(new SchemaField({
            label: new StringField({ ...this.PrivateConfig, initial: '', label: TFM.Generic.label }), // localizable curse name
            description: new HTMLField({ ...this.PrivateConfig, initial: '', label: TFM.Generic.description }), // description of enchantment, supports enriched HTML
            chat: new HTMLField({ ...this.PrivateConfig, initial: '', label: TFM.Generic.chatDescription }), // Chat card to output for enchantment, supports enriched html
            curse: new BooleanField({ ...this.PrivateConfig, initial: false, label: TFM.Generic.curse }), // does this enchantment qualify as a curse
            identified: new BooleanField({ ...this.PrivateConfig, initial: false, label: TFM.Generic.identified }), // is this effect visible to players
        }), {
            initial: [],
            label: TFM.Generic.enchantments,
        });
    }

    /**
     * returns a selection of equipment specific modifications to be applied to a schema
     */
    static EquipmentFields() {
        return {
            enchantments: this.EnchantmentField(),
            identified: new BooleanField({ ...this.PrivateConfig, initial: false, label: TFM.Generic.identified }),
            broken: new BooleanField({ ...this.RequiredConfig, initial: false, label: TFM.Generic.broken }),
            equipped: new BooleanField({ ...this.RequiredConfig, initial: false, label: TFM.Generic.equipped })
        };
    }

    async use(event, options) {
        if (game.settings.get(game.system.id, 'debug')) console.log(`Item type[${this.parent.type}] system.use() called but with no handler`, this.parent);
    }
};