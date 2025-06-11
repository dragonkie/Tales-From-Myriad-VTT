import { TFM } from "../../../config.mjs";
import utils from "../../../helpers/utils.mjs";
import TfmDialog from "../../dialog.mjs";
import TfmActorSheet from "../actor.mjs"

export default class CharacterSheet extends TfmActorSheet {
    static DEFAULT_OPTIONS = {
        classes: ["tfm", "sheet", "actor"],
        position: { height: 'auto', width: 800, top: 60, left: 120 },
        window: { resizable: false },
        actions: {
            skillConfig: this._onConfigureSkills
        }
    }

    static get PARTS() {
        const parts = {
            // main sheet
            body: { template: `${tfm.filepath.template}/actor/character/body.hbs` },
            // Parts
            header: { template: `${tfm.filepath.template}/actor/character/header.hbs` },
            // tabs
            features: { template: `${tfm.filepath.template}/actor/character/features.hbs` },
            inventory: { template: `${tfm.filepath.template}/actor/character/inventory.hbs` },
            effects: { template: `${tfm.filepath.template}/actor/shared/actor-effects.hbs` },
            details: { template: `${tfm.filepath.template}/actor/character/details.hbs` }
        }

        return parts;
    }

    static TABS = {
        features: { id: "features", group: "primary", label: "TFM.Tab.Features" },
        inventory: { id: "inventory", group: "primary", label: "TFM.Tab.Inventory" },
        spells: { id: "spells", group: "primary", label: "TFM.Tab.Spells" },
        effects: { id: "effects", group: "primary", label: "TFM.Tab.Effects" },
        details: { id: "details", group: "primary", label: "TFM.Tab.Details" }
    }

    tabGroups = { primary: "features" };

    async _prepareContext() {
        const context = await super._prepareContext();

        // get labels for weapon proficiencies
        for (const [key, prof] of Object.entries(context.system.proficiency.weaponType)) {
            prof.label = TFM.WeaponTypes[key];
        }

        context.system.corruption.label = utils.localize(TFM.Corruption.label[context.system.corruption.value]);
        context.system.corruption.description = utils.localize(TFM.Corruption.description[context.system.corruption.value]);

        let last_level = utils.nextLevel(context.system.level - 1)
        last_level = context.system.level <= 1 ? 0 : last_level;

        context.system.xp.next = utils.nextLevel(context.system.level);
        context.system.xp.fill = Math.max((context.system.xp.value - last_level) / (context.system.xp.next - last_level) * 100, 0);

        context.inventory = {
            contents: [],
            get size() { return context.inventory.contents.length }
        };

        this.document.items.contents.forEach(item => {
            // fill inventory with applicable items
            const whitelist = ['weapon', 'trinket', 'armour'];
            if (whitelist.includes(item.type)) {
                context.inventory.contents.push(item);
            }

            
        });

        return context;
    }

    //===========================================================================================
    //> Sheet actions
    //===========================================================================================

    /**
     * 
     * @param {Event} event 
     * @param {Element} target 
     */
    static async _onConfigureSkills(event, target) {
        const input_template = `<input style="margin-bottom: 5px" type="text" value="{SKILL}"><a data-action="delete" style="flex: 0;"><i class="fas fa-trash"></a></i>`;
        const skills_list = utils.duplicate(this.document.system.skills);
        let content = `
        <div class="flexrow">
            <div>${this.document.name}s skills list</div> 
        </div>`;
        content += '<div class="dialog-skill-list">'
        for (const skill of this.document.system.skills) {
            content += `<div class="flexrow skill-wrapepr flex-gap-m">${input_template.replace('{SKILL}', skill)}</div>`;
        }
        content += '</div>';
        content += `<div><a style="float: right;" data-action="add">add <i class="fas fa-plus"></i></a></div>`;

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

    async _onDropItem(event, item) {
        return super._onDropItem(event, item);
    }

    //===============================================================================================
    //> Drag & Drop
    //===============================================================================================

}