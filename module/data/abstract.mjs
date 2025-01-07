const { ArrayField, NumberField, SchemaField, SetField, StringField, HTMLField } = foundry.data.fields;

/* ---------------------------------------------- */
/* Generic system data model                      */
/* ---------------------------------------------- */
export default class SystemDataModel extends foundry.abstract.TypeDataModel {
    /**
     * Adds a field that can be used for token bars with a value, min, and max
     * @param {String} value The starting value
     * @param {String} min minimum clamping value
     * @param {String} max Maximum clamping value
     * @returns {SchemaField} New ValueField
     */
    static ValueField(value, min, max) {
        return new SchemaField({
            value: new NumberField({ initial: value, required: true, nullable: false, min: min, max: max }),
            min: new NumberField({ initial: min, required: true, nullable: false }),
            max: new NumberField({ initial: max, required: true, nullable: false }),
        });
    }

    static ProficiencyField() {
        return new SchemaField({
            value: new NumberField({ initial: 0, min: 0, max: 0, required: true, nullable: false }),// 0 - 3
            min: new NumberField({ initial: 0, required: true, nullable: false }),
            max: new NumberField({ initial: 3, required: true, nullable: false }),
            label: new StringField(),// Sword, bow, dagger, etc
            type: new StringField({ initial: "None" }), // None, Half, Full
        });
    }

    getRollData() {
        const data = { ...this };
        return data;
    }
};