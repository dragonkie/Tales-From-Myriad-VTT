import TfmDialog from "../../dialog.mjs";
import TfmItemSheet from "../item.mjs";
import utils from "../../../helpers/utils.mjs";
import { TFM } from "../../../config.mjs";

export default class JobSheet extends TfmItemSheet {
    static DEFAULT_OPTIONS = {
        actions: {
            configWeaponProf: this._onConfigureWeaponProf,
            configSkills: this._onConfigureSkills,
            configPaths: this._onConfigurePaths
        }
    }

    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/job.hbs` };
        return parts;
    }

    //===========================================================================================
    //> Sheet actions
    //===========================================================================================

    /**
     * 
     * @param {Event} event 
     * @param {HTMLElement} target 
     */
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

    /**
     * 
     * @param {Event} event 
     * @param {Element} target 
     */
    static async _onConfigureSkills(event, target) {
        const input_template = `<input style="margin-bottom: 5px" type="text" value="{SKILL}"><a class="fas fa-trash flexshrink" data-action="delete"></a>`;
        const skills_list = utils.duplicate(this.document.system.skills);
        let content = `
            <div class="flexrow">
                <div>${this.document.name}s skills list</div> 
            </div>`;
        content += '<div class="dialog-skill-list">'
        for (const skill of this.document.system.skills) {
            content += `<div class="flexrow skill-wrapper flex-gap-m">${input_template.replace('{SKILL}', skill)}</div>`;
        }
        content += '</div>';
        content += `<div class="flex-align-end"><a data-action="add"><i class="fas fa-plus"></i> add</a></div>`;

        // create the config popup
        const app = await new TfmDialog({
            window: { title: 'TFM.Dialog.SkillConfig' },
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
                if (result != 'confirm') return false
                let skills = [];
                let inputs = app.element.querySelectorAll('.dialog-skill-list input');
                for (const i of inputs) skills.push(i.value);
                this.document.update({ system: { skills: skills } });
            },
        }).render(true);

        // attach event listeners
        const list_ele = app.element.querySelector('.dialog-skill-list');
        app.element.addEventListener('click', (event) => {
            const target = event.target;
            const action = target.closest('[data-action]')?.dataset.action;

            if (action == 'add') {
                skills_list.push('New Skill');
                while (list_ele.firstChild) list_ele.removeChild(list_ele.firstChild);

                for (const skill of skills_list) {
                    let node = document.createElement('DIV');
                    node.innerHTML = input_template.replace('{SKILL}', skill);
                    node.classList = 'flexrow flex-gap-m skill-wrapper';
                    list_ele.appendChild(node);
                }
            }
            else if (action == 'delete') {
                let t = target.closest('.skill-wrapper');
                let v = t.value;
                let i = skills_list.indexOf(v);
                skills_list.splice(i, 1);
                t.parentElement.removeChild(t);
            }


        })
        console.log(app.element);
    }

    static async _onConfigurePaths(event, target) {
        const input_template = `<input style="margin-bottom: 5px" type="text" value="{PATH}"><a data-action="delete" style="flex: 0;"><i class="fas fa-trash"></a></i>`;
        let content = `
            <div class="flexrow">
                <div>${this.document.name}s paths list</div> 
            </div>`;
        content += '<div class="dialog-path-list">'
        for (const path of this.document.system.paths) {
            content += `<div class="flexrow path-wrapper flex-gap-m">${input_template.replace('{PATH}', path)}</div>`;
        }
        content += '</div>';
        content += `<div class="flex-align-end"><a data-action="add"><i class="fas fa-plus"></i>add</a></div>`;

        // create the config popup
        const app = await new TfmDialog({
            window: { title: 'TFM.Dialog.PathConfig' },
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
                if (result != 'confirm') return false
                let paths = [];
                let inputs = app.element.querySelectorAll('.dialog-path-list input');
                for (const i of inputs) paths.push(i.value);
                this.document.update({ system: { paths: paths } });
            },
        }).render(true);

        // attach event listeners
        const list_ele = app.element.querySelector('.dialog-path-list');
        app.element.addEventListener('click', (event) => {
            const target = event.target;
            const action = target.closest('[data-action]')?.dataset.action;

            if (action == 'add') {
                const node = document.createElement('DIV');
                node.innerHTML = input_template.replace('{PATH}', 'New Path');
                node.classList = 'flexrow flex-gap-m path-wrapper';
                list_ele.appendChild(node);
            } else if (action == 'delete') {
                let t = target.closest('.path-wrapper');
                let v = t.value;
                t.parentElement.removeChild(t);
            }


        })
        console.log(app.element);
    }
}