import TfmDialog from "../../dialog.mjs";
import TfmItemSheet from "../item.mjs";
import utils from "../../../helpers/utils.mjs";
import { TFM } from "../../../config.mjs";

export default class JobSheet extends TfmItemSheet {
    static DEFAULT_OPTIONS = {
        position: { height: 'auto', width: 600, top: 60, left: 120 },
        actions: {
            addFeature: this._onAddFeature,
            configWeaponProf: this._onConfigureWeaponProf,
            configSkills: this._onConfigureSkills,
            configPaths: this._onConfigurePaths
        }
    }

    static get PARTS() {
        return {
            ...super.PARTS,
            details: { template: `${tfm.filepath.template}/item/details/job.hbs` },
            features: { template: `${tfm.filepath.template}/item/details/job-features.hbs` },
        };
    }

    static get TABS() {
        const tabs = {
            ...super.TABS,
            features: { id: 'features', group: 'primary', label: 'TFM.Tab.Features' }
        };
        delete tabs.rules
        return tabs;
    }

    async _prepareContext() {
        const context = await super._prepareContext();

        // Add the feature path groupings
        context.class_paths = {};
        context.system.paths.forEach(f => {
            context.class_paths[f] = {
                name: f,
                features: [] // Features should be ordered by level, and then by name
            }
        })
        context.generalFeats = [];
        context.implicitFeats = [];

        // add the features to their relevant lists
        context.system.features.forEach(async f => {
            const d = utils.duplicate(f);
            d.item = await fromUuid(d.uuid);

            if (f.implicit) context.implicitFeats.push(d)
            else if (f.general) context.generalFeats.push(d);
            else Object.keys(context.class_paths).forEach(async key => {
                if (f.path == key) context.class_paths[key].features.push(d);
            })
        })

        // Adds in metadata to help with managing sheet to remove calculations from handlebars
        Object.keys(context.class_paths).forEach(key => {
            context.class_paths[key].count = context.class_paths[key].features.length;
        })

        return context;
    }

    //===========================================================================================
    //> Sheet actions
    //===========================================================================================

    /**
     * 
     * @param {Event} event 
     * @param {HTMLElement} target 
     */
    static async _onAddFeature(event, target) {
        // Gather data relevant to the feature paths
        const active_path = target.closest('[data-path]')?.dataset.path;
        if (!active_path) throw new Error('No active feature path found');

        // Create a list with the features that should remain unchanged
        const remaining = [];
        this.document.system.features.forEach(f => { if (f.path != active_path) remaining.push(f) });

        // Render and enrich the template
        const render = await utils.renderTemplate(`${tfm.filepath.template}/dialog/feature-config.hbs`, { active_path: active_path, ...this.document.system });
        const enriched = await utils.enrichHTML(render);

        //Create the application
        const app = await new TfmDialog({
            id: `tfm-item-config-features-${this.document.id}`,
            window: { title: 'TFM.Dialog.AddClassFeature' },
            position: { height: 'auto', width: 400 },
            actions: {
                delete: (event, target) => {
                    const ele = target.closest('[data-uuid]');
                    ele.remove();
                }
            },
            classes: ['tfm'],
            content: enriched,
            buttons: [{
                action: 'cancel',
                label: 'Cancel',
                default: true,
            }, {
                action: 'confirm',
                label: 'Confirm'
            }],
            submit: async result => {
                if (result != 'confirm') return;

                // if the path name changed, update everything to match
                const nameEle = app.element.querySelector('[name=path-name]');
                const path_name = nameEle?.value ?? active_path;
                if (nameEle) {
                    if (path_name != active_path && path_name != '') {
                        let arr = duplicate(this.document.system.paths);
                        let i = arr.indexOf(active_path);
                        if (i > -1) arr.splice(i, 1);
                        arr.push(path_name);
                        await this.document.update({ system: { paths: arr } });
                    }
                }

                // Create the new features list
                let features = app.element.querySelectorAll(`.tfm-class-feature`);
                const list = [];
                for (const f of features) {
                    const data = { uuid: f.querySelector('[data-uuid]')?.dataset.uuid };
                    const item = await fromUuid(data.uuid);
                    if (!item) throw new Error('Missing ID for a feature');

                    // set data defaults
                    data.name = item.name;
                    data.level = f.querySelector('[name=level]')?.value
                    data.path = path_name;

                    // set derived data
                    if (path_name == 'implicit') data.implicit = true;
                    else if (path_name == 'general') data.general = true;
                    else data.path = path_name;

                    // push the data
                    list.push(data);
                }

                // update the feature list
                await this.document.update({ system: { features: [...remaining, ...list] } });
            }
        }).render(true);

        // Bind the drop manager
        const itemUuid = this.document.uuid;
        const list_ele = app.element.querySelector('.tfm-feature-list');
        const dd = new foundry.applications.ux.DragDrop.implementation({
            dropSelector: ".application",
            permissions: { drop: this.isEditable && this.document.isOwner },
            callbacks: {
                drop: async event => {
                    const { type, uuid } = utils.getDragEventData(event);
                    const item = await fromUuid(uuid);
                    if (item.type == 'job' || uuid == itemUuid) return; // Jobs cant hold job items or themselves
                    const e = document.createElement('DIV');
                    e.innerHTML = await utils.enrichHTML(`
                        <div class="flexrow tfm-gap-s tfm-class-feature" data-uuid="${uuid}">
                            <div>@UUID[${uuid}]</div>
                            <input class="tfm-feature-level" name="level" style="flex: 0; width: 2rem;" type="number" placeholder="level" value="1">
                        </div>
                    `);
                    list_ele.appendChild(e);
                }
            }
        });
        console.log(app.element)
        dd.bind(app.element);
    }

    /**
     * 
     * @param {Event} event 
     * @param {HTMLElement} target 
     */
    static async _onConfigureWeaponProf(event, target) {
        var content = '<div class="tfm-gap-m" style="display: grid; grid-template-columns: 1fr 1fr;">';
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
            content += `<div class="flexrow skill-wrapper tfm-gap-m">${input_template.replace('{SKILL}', skill)}</div>`;
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
                    node.classList = 'flexrow tfm-gap-m skill-wrapper';
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
    }

    static async _onConfigurePaths(event, target) {
        const input_template = `<input style="margin-bottom: 5px" type="text" value="{PATH}"><a data-action="delete" style="flex: 0;"><i class="fas fa-trash"></a></i>`;
        let content = `
            <div class="flexrow">
                <div>${this.document.name}s paths list</div> 
            </div>`;
        content += '<div class="dialog-path-list">'
        for (const path of this.document.system.paths) {
            content += `<div class="flexrow path-wrapper tfm-gap-m">${input_template.replace('{PATH}', path)}</div>`;
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
                node.classList = 'flexrow tfm-gap-m path-wrapper';
                list_ele.appendChild(node);
            } else if (action == 'delete') {
                let t = target.closest('.path-wrapper');
                let v = t.value;
                t.parentElement.removeChild(t);
            }


        })
    }
}