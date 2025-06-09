import TfmDialog from "../../dialog.mjs";
import TfmItemSheet from "../item.mjs";
import utils from "../../../helpers/utils.mjs";
import { TFM } from "../../../config.mjs";

export default class JobSheet extends TfmItemSheet {
    static DEFAULT_OPTIONS = {
        actions: {
            configWeaponProf: this._onConfigureWeaponProf
        }
    }

    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/job.hbs` };
        return parts;
    }

    static async _onConfigureWeaponProf(event, target) {
        var content = '<div class="flex-gap-m" style="display: grid; grid-template-columns: 1fr 1fr;">';
        for (const [key, value] of Object.entries(this.document.system.proficiency.weaponType)) {
            const field = this.document.system.schema.getField(`proficiency.weaponType.${key}`);
            content += field.toFormGroup({ localize: true }, { value: value }).outerHTML;
        }
        content += '</div>';

        const app = await new TfmDialog({
            window: { title: 'TFM.Dialog.WeaponProfConfig' },
            classes: ['tfm'],
            content: content,
            buttons: [{
                action: 'cancel',
                label: 'Cancel',
                default: true
            }, {
                action: 'confirm',
                label: 'Confirm'
            }],
            submit: result => {
                if (result != 'confirm') return false;
                const prof = {};
                const inputs = app.element.querySelectorAll('input[name]');
                inputs.forEach(input => { prof[input.name] = input.checked });
                this.document.update(prof);
            }
        }).render(true);
    }
}