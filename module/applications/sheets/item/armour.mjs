import { TFM } from "../../../config.mjs";
import utils from "../../../helpers/utils.mjs";
import TfmDialog from "../../dialog.mjs";
import TfmItemSheet from "../item.mjs";

export default class ArmourSheet extends TfmItemSheet {

    static DEFAULT_OPTIONS = {
        actions: {
            editResistance: this._onEditResistance,
        }
    }

    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/armour.hbs` };
        return parts;
    }

    /**
         * @param {Event} event
         * @param {Element} target
         */
    static async _onEditResistance(event, target) {
        let content = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">`;
        let resists = this.document.system.resistances;

        // create the inputs for the different groups
        for (const type of Object.keys(TFM.DamageTypes)) {
            let label = utils.localize(TFM.DamageTypes[type]);
            let value = "normal";
            for (const resist of resists) if (resist.type == type) value = resist.value

            /**@type {Element} */
            let ele = new foundry.data.fields.StringField({
                name: type,
                label: label,
                initial: value,
                required: true,
                nullable: false,
                blank: false,
                choices: () => {
                    let options = { normal: TFM.Generic.normal, ...utils.duplicate(TFM.DamageResistance) };
                    for (const i of Object.keys(options)) options[i] = utils.localize(options[i]);
                    return options;
                }
            }).toFormGroup();

            ele.setAttribute('data-type', type);

            content += ele.outerHTML;
        }

        content += `</div>`;

        let app = await new TfmDialog({
            window: { title: 'RESISTANCE_CONFIG' },
            content: content,
            classes: ['tfm'],
            buttons: [{
                action: 'cancel',
                label: 'Cancel'
            }, {
                action: 'confirm',
                label: 'Confirm'
            }],
            submit: result => {
                if (result != 'confirm') return;
                const list = [];
                let inputs = app.element.querySelectorAll('[data-type]');

                for (const input of inputs) {
                    let t = input.dataset.type;
                    let v = input.querySelector('select').value;
                    if (v == 'normal') continue;
                    list.push({ type: t, value: v });
                }

                this.document.update({ system: { resistances: list } });
            }
        }).render(true);
    }
}