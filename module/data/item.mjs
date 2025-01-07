import SystemDataModel from "./abstract.mjs";
const { ArrayField, NumberField, SchemaField, SetField, StringField, HTMLField } = foundry.data.fields;

/* ---------------------------------------------- */
/* Generic item data model                        */
/* ---------------------------------------------- */
export default class ItemDataModel extends SystemDataModel {
    static defineSchema() {
        const schema = {};

        schema.description = new HTMLField({ initial: "" });

        return schema;
    }
};