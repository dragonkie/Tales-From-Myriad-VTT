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

        schema.type = new StringField({
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

    /**
     * Define the data structure of the casting options
     * @typedef SpellcastData
     * @prop {Object} trinket - reference to a trinket document if cast from one
     * @prop {Object} actor - reference to an actor document
     */

    /**
     * @param {Event} event 
     * @param {String} action 
     * @param {SpellcastData} options 
     * @returns 
     */
    async use(event, action = 'cast', options = {}) {
        return this._onCastSpell(event, options);
    }

    /**
     * Casts this spell, using context in the options to procided additional details
     * This includes setting which characteristic should be used if cast from a trinket
     * @param {MouseEvent|KeyboardEvent} event 
     * @param {SpellcastData} options 
     */
    async _onCastSpell(event, options) {
        const { actor, trinket } = options;
        // construct the roll context if there is one to be had
        const rolldata = { ...this.toObject(), doc: this.document };

        // adds actor rolldata
        if (actor) {
            rolldata.actor = actor;

            // player features can change the dice being rolled
            // eg. scholar rolling d8's for arcane spells

            // Gather a list of components that could be used for this spell
            rolldata.components = [];
            for (const item of actor.items) {
                if (item.type == 'consumable') {

                }
                else if (item.type == 'trinket' && item.system.type == 'div' && item.system.charged) {
                    rolldata.components.push(item);
                }
            }

            // add extra context for a caster and trinket source for this item
            if (trinket) {
                rolldata.trinket = trinket;

                // Trinkets override the default casting stat to be used in case of a mismatch
                rolldata.type = trinket.system.type;
                rolldata.casting.ability = {
                    ...actor.system.abilities[TFM.MagicTypeKeys[trinket.system.type]]
                }
            } else {
                rolldata.casting.ability = {
                    ...actor.system.abilities[TFM.MagicTypeKeys[rolldata.type]]
                }
            }
        }

        console.log(rolldata);

        // validate the casting request to ensure the player can cast it, or if its being overriden
        if ((rolldata.casting.ability.mod < this.casting.level || rolldata.casting.ability.mod <= 0) && !event.shiftKey) {
            utils.warn("TFM.Warn.LowCastingAbility");
            return;
        }

        // render the dialog popup template
        const template = await utils.renderTemplate(`${tfm.filepath.template}/dialog/roll/spell.hbs`, rolldata);
        const enriched = await utils.enrichHTML(template);

        // create the application
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
                // callback for when the user confirms the roll
                if (result != 'roll') return;
                const inputs = app.element.querySelectorAll('input[name]');
                const data = {};
                for (const i of inputs) {
                    if (i.type == 'checkbox') data[i.name] = i.checked;
                    else if (i.type == 'number') data[i.name] = +i.value;
                    else data[i.name] = i.value;
                }

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

                // calculate the level of mishaps that occur
                let miscast = 0
                for (const k of Object.keys(miscastCounter)) miscast += Math.max(0, miscastCounter[k] - 1);

                // prepare chat message rendering data
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

    }
}