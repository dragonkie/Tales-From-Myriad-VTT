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

/* ---------------------------------------------- */
/* Generic system data model                      */
/* ---------------------------------------------- */
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
     * @returns {DataFieldOptions}
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

/* ---------------------------------------------- */
/* Generic actor data model                       */
/* ---------------------------------------------- */
export class ActorDataModel extends SystemDataModel {
    static defineSchema() {
        const schema = {};

        // add in actor abilities
        const abilities = {};
        for (const key of Object.keys(tfm.config.Abilities)) abilities[key] = this.ValueField(6);
        schema.abilities = new SchemaField(abilities);

        // adds in resource fields
        schema.hp = this.ResourceField(6, 6);
        schema.corruption = this.ResourceField(0, 10);

        // tracks player experience points, or a monsters given exp
        schema.xp = new NumberField({ initial: 0, required: true, nullable: false });

        return schema;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        for (const ability in this.abilities) this.abilities[ability].mod = tfm.utils.abilityMod(this.abilities[ability].value);
        this.level = tfm.utils.levelXp(this.xp);
    }
};

/* ---------------------------------------------- */
/* Generic item data model                        */
/* ---------------------------------------------- */
export class ItemDataModel extends SystemDataModel {
    static defineSchema() {
        const schema = {};

        // Item descriptions
        schema.description = new SchemaField({
            value: new HTMLField({ initial: "" }),
            chat: new HTMLField({ initial: "" }),
            unidentified: new HTMLField({ initial: "" }),
        })

        /*
        Large items take 2 slots - heavy weapons, spare heavy armour, etc
        Regular items take one slot - Swords, shields, bows
        Small items stack up to 10 - candles, rations, caltrops
        Ammo stacks up to 30 - arrows, bullets
        Tiny items do not take up a slot
        */
        schema.quantity = new NumberField({ initial: 1 }); // used only on stacking tiny items
        schema.size = new StringField({// Overide for the number of slots an item takes up
            initial: 'regular',
            choices: () => {
                return tfm.config.ItemSizes;
            }
        });
        schema.price = new NumberField({ initial: 3, label: tfm.config.Generic.price });// price in crowns to purchase

        return schema;
    }

    static get MixinIdentify() {
        return class EquipmentData extends this {
            static defineSchema() {
                const schema = super.defineSchema();
                schema.identified = new BooleanField
                return schema;
            }
        }
    }
};