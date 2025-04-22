import utils from "../../../helpers/utils.mjs";
import TfmItemSheet from "../item.mjs";

export default class WeaponSheet extends TfmItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["weapon"],
        actions: {
            removeDamage: this._onRemoveDamage,
            addDamage: this._onAddDamage
        }
    }

    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/weapon.hbs` };
        return parts;
    }

    async _prepareContext() {
        const context = await super._prepareContext();

        const schema = this.document.system.schema;
        context.damage_parts = [];
        for (let i = 0; i < context.system.damage_parts.length; i++) {
            const dmg = context.system.damage_parts[i];
            context.damage_parts.push({
                formula: {
                    value: dmg.formula,
                    field: schema.fields.damage_parts.element.fields.formula,
                    path: `system.damage_parts.${i}.formula`
                },
                type: {
                    value: dmg.type,
                    field: schema.fields.damage_parts.element.fields.type,
                    path: `system.damage_parts.${i}.type`
                }
            })
        }

        return context;
    }

    static async _onRemoveDamage(event, target) {
        let index = target.closest('[data-damage-index]')?.dataset.damageIndex;
        if (!index) return;

        const damage_parts = utils.duplicate(this.document.system.damage_parts);
        damage_parts.splice(index, 1);

        this.document.update({ "system.damage_parts": damage_parts });
    }

    static async _onAddDamage(event, target) {
        const damage_parts = utils.duplicate(this.document.system.damage_parts);
        damage_parts.push({ formula: "1d8", type: damage_parts[0].type });
        this.document.update({ "system.damage_parts": damage_parts });
    }
}