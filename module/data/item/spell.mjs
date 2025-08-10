import TfmDialog from "../../applications/dialog.mjs";
import { TFM } from "../../config.mjs";
import utils from "../../helpers/utils.mjs";
import { ItemDataModel } from "../abstract.mjs";

const { ArrayField, NumberField, SchemaField, SetField, StringField,
    HTMLField, ObjectField, DataField, BooleanField } = foundry.data.fields;

export default class SpellData extends ItemDataModel {
    static defineSchema() {
        const schema = super.defineSchema();
        schema.casting = new SchemaField({
            difficulty: new NumberField({ initial: 2 }),
            level: new NumberField({ initial: 1 })
        });

        schema.range = new NumberField({ initial: 40 });
        schema.targets = new StringField({
            initial: 'any',
            blank: false,
            ...this.RequiredConfig,
            choices: () => {
                let options = { ...TFM.TargetTypes };
                for (const key of Object.keys(options)) options[key] = utils.localize(options[key]);
                return options;
            }
        })

        schema.school = new StringField({
            label: "TFM.Generic.SpellSchool",
            initial: 'arc',
            blank: false,
            ...this.RequiredConfig,
            choices: () => {
                let options = { ...TFM.MagicTypes };
                for (const key of Object.keys(options)) options[key] = utils.localize(options[key]);
                return options;
            }
        })
        schema.channeled = new BooleanField({ initial: false, nullable: false });
        schema.ritual = new BooleanField({ initial: false, nullable: false });

        // Uuid of a linked trinket responsible for making this item
        // only applicable when owned by an actor, otherwise should stay blank
        schema.trinket = new StringField({ ...this.RequiredConfig, initial: '', blank: true });

        return schema;
    }

    async use(event, action = 'cast', options = {}) {
        return this._onCastSpell(event, options);
    }

    async _onCastSpell(event, options) {
        // get roll data, actor data can be passed through trinkets to cast spells without an owning actor
        let rolldata = { ...this.toObject(), doc: this.document };
        if (this.actor) rolldata = { ...rolldata, actorData: this.actor.getRollData() };
        else rolldata = { ...rolldata, actorData: options.actorData };
        console.log('rolldata', rolldata);
        console.log('options', options);

        const template = await utils.renderTemplate(`${tfm.filepath.template}/dialog/roll/spell.hbs`, rolldata);
        const enriched = await utils.enrichHTML(template);
        const app = await new TfmDialog({
            window: { title: utils.localize('TFM.Dialog.CastingSpell') + ': ' + this.document.name },
            content: enriched,
            buttons: [{
                action: 'roll',
                label: 'Roll'
            }, {
                action: 'cancel',
                label: 'Cancel'
            }],
            submit: async result => {
                if (result != 'roll') return;
                const inputs = app.element.querySelectorAll('input[name]');
                const data = {};
                for (const i of inputs) {
                    if (i.type == 'checkbox') data[i.name] = i.checked;
                    else if (i.type == 'number') data[i.name] = +i.value;
                    else data[i.name] = i.value;
                }

                console.log(data);

                // Create the dice roll
                const roll = new Roll(`${data.dice}d6x6kf${Math.max(1, rolldata.actorData.lck) + data.dice}cs>=${rolldata.casting.difficulty}`);
                await roll.evaluate();

                // Count up miscast level
                const miscastCounter = {};
                for (const die of roll.dice) {
                    for (const r of die.results) {
                        if (!r.active || r.discarded) continue;
                        if (miscastCounter[r.result] == undefined) miscastCounter[r.result] = 0;
                        miscastCounter[r.result] += 1;
                    }
                }

                let miscast = 0
                for (const k of Object.keys(miscastCounter)) miscast += Math.max(0, miscastCounter[k] - 1);

                const chatData = {
                    doc: this.document,
                    system: this,
                    desc: this.description.identified,
                    actor: this.actor || options.actor || null,
                    rollRender: await roll.render(),
                    roll: roll,
                    success: roll.total >= this.casting.level,
                    miscast: miscast,
                }

                // Create the chat message
                const chatTemplate = await utils.renderTemplate(`systems/${game.system.id}/templates/chat/spell-cast.hbs`, chatData);
                const chatEnriched = await utils.enrichHTML(chatTemplate);
                await roll.toMessage({
                    content: chatEnriched
                });

            }
        }).render(true);
        const roll = new Roll();
    }
}