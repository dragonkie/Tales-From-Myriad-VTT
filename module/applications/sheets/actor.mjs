import LOGGER from "../../helpers/logger.mjs";
import TfmSheetMixin from "./mixin.mjs";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class TfmActorSheet extends TfmSheetMixin(foundry.applications.sheets.ActorSheetV2) {

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["tfm", "sheet", "actor"],
        position: { height: 600, width: 600, top: 100, left: 200 },
        window: { resizable: true },
        actions: {
            useItem: this._onUseItem,
            editItem: this._onEditItem,
            deleteItem: this._onDeleteItem,
            equipItem: this._onEquipItem,
            giveItem: this._onGiveItem,
            levelProf: this._onLevelProficiency,
            roll: this._onRoll,
            rollAbility: this._onRollAbility
        }
    }

    static get PARTS() {
        return {
            header: { template: `${tfm.filepath.template}/actor/character/header.hbs` },
            tabs: { template: `${tfm.filepath.template}/parts/sheet-tabs.hbs` },
            features: { template: `${tfm.filepath.template}/actor/parts/actor-features.hbs` },
            items: { template: `${tfm.filepath.template}/actor/parts/actor-items.hbs` },
            spells: { template: `${tfm.filepath.template}/actor/parts/actor-spells.hbs` },
            biography: { template: `${tfm.filepath.template}/actor/parts/actor-bio.hbs` }
        }
    }

    static TABS = {
        features: { id: "features", group: "primary", label: "TFM.tab.features" },
        items: { id: "items", group: "primary", label: "TFM.tab.items" },
        spells: { id: "spells", group: "primary", label: "TFM.tab.spells" },
        biography: { id: "biography", group: "primary", label: "TFM.tab.biography" }
    }

    tabGroups = {
        primary: "features",
    }

    /* ------------------------- RENDER CONTEXT DATA PREP ----------------------------------*/
    async _prepareContext(options) {
        const context = await super._prepareContext();

        context.itemTypes = this.document.itemTypes;
        context.items = this.document.items;
        context.item_count = this.document.items.contents.length;

        // prepare ability localization tags
        for (const [key, ability] of Object.entries(context.system.abilities)) {
            ability.label = tfm.config.Abilities[key]
            ability.abbr = tfm.config.AbilitiesAbbr[key]
        }

        return context;
    }

    /* ----------- DRAG AND DROP OVERIDES ------------- */

    /**
     * Built in drop event handeler, will automatically parse and get data from the event
     * triggers appropriate registered action as listed below, any others are added
     * from this system
     * 
     * _onDropItem    _onDropActor
     * _onDropFolder  _onDropActiveEffect
     * 
     * these functions can be overiden, or an interception can be added into this function
     * to access a custom handler instead of calling super._onDrop() to use the default
     * handlers
     * 
     * @param {DragEvent} event 
     */
    async _onDrop(event) {
        LOGGER.log(`Drop event:`, event);
        super._onDrop(event);
    }

    async _onDropItem(event, data) {
        if (!this.actor.isOwner) return false;

        const item = await fromUuid(data.uuid);
        const itemData = item.toObject();

        switch (item.type) {
            case `trinket`:
            /*
            const spells = item.system.spells;
            const spellList = [];
            // Add spells from the trinket
            for (var [key, value] of Object.entries(spells)) {
                var s = await fromUuid(value.uuid);
                spellList.push(s.toObject());
            }

            const trinket = await this.actor.createEmbeddedDocuments(`Item`, [itemData]);
            const newSpells = await this.actor.createEmbeddedDocuments(`Item`, spellList);

            LOGGER.log('trinket', trinket)
            LOGGER.log('Spell list', spellList);

            for (const spell of newSpells) {
                trinket[0].setFlag(game.system.id, 'spells', {
                    [spell.id]: spell.name
                })
            }

            return false;
            */
            default:
                LOGGER.log('Actor recieved item drop');
                break;
        }

        return true;
    }
    //============================================================================================
    // Sheet Actions
    //============================================================================================
    static async _onUseItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);

        const action = target.closest("[data-use]")?.dataset.use;// the action the item is performing if applicable
        const options = target.closest("[data-use-options]")?.dataset.useOptions;// configuration for the item action

        return item.use(event, action, options);
    }

    static async _onEditItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);

        if (!item.sheet.rendered) item.sheet.render(true);
        else item.sheet.bringToFront();
    }

    static async _onDeleteItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);
        const confirm = await foundry.applications.api.DialogV2.confirm({
            content: `${tfm.utils.localize('TFM.confirm.deleteItem')}: ${item.name}`,
            rejectClose: false,
            modal: true
        });
        if (confirm) return item.delete();
        return undefined;
    }

    static async _onEquipItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);

        return item.update({ 'system.equipped': !item.system.equipped })
    }

    static async _onGiveItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        tfm.socket.sendItem(uuid);
    }

    // This is only relevant on player characters and can be ignore otherwise
    static async _onLevelProficiency(event, target) {
        if (this.document.type != `character`) return;

        const doc = this.document;
        const prof = target.closest('[data-prof]').dataset.prof
        var value = doc.system.proficiencies[prof].value + 1;
        if (value > 3) value = 0;
        doc.update({ [`system.proficiencies.${prof}.value`]: value });
    }

    static async _onRollAbility(event, target) {
        const template = `systems/${tfm.id}/templates/dialog/roll/ability.hbs`;
        const rollData = this.document.getRollData();
        const data = {
            ability: rollData[target.dataset.ability],
            label: `TFM.ability.${target.dataset.ability}`
        };

        const dialog = await tfm.application.TfmDialog.roll(template, data);

        if (dialog.cancled) return;
        const options = tfm.utils.getFormData(dialog.html, '[name]');

        // Create the roll formula from input
        let formula = '2d6x6kf@karma+@ability';
        if (dialog.button.dataset.action == 'advantage') formula = `3d6dl1x6kf@karma+@ability`;
        else if (dialog.button.dataset.action == 'disadvantage') formula = `3d6dh1x6kf@karma+@ability`;
        if (!options.explode) formula = formula.replace(/x6/, '');

        if (options.situation != '') {
            if (Array.from(options.situation)[0] != '-') formula += `+${options.situation}`;
            else formula += ` ${options.situation}`;
        }

        LOGGER.debug(formula);

        // Assembles the final roll
        let label = `TFM.generic.ability: <b>${data.label}</b>`;
        let roll = new Roll(formula, { ability: rollData[target.dataset.ability], karma: rollData.karma });
        await roll.evaluate();
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: label,
            rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
    }

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    static async _onRoll(event, target) {
        const rollData = this.document.getRollData();
        const data = target.dataset;

        let roll = new Roll(data.roll, rollData);
        await roll.evaluate();
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: data.flavor,
            rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
    }

    //============================================================================================
    // Context Menu
    //============================================================================================

    _getItemContextOptions(item) {
        const isOwner = item.isOwner;
        const isCharacter = item.actor.type === "character";
        const isNpc = item.actor.type === "npc";
        const isEquipped = item.isEquipped;
        const options = [{
            name: "TFM.ContextMenu.Edit",
            icon: "<i class='fa-solid fa-fw fa-edit'></i>",
            condition: () => isOwner,
            callback: () => item.sheet.render(true),
            group: "manage"
        }, {
            name: "TFM.ContextMenu.Gift",
            icon: "<i class='fa-solid fa-fw fa-gift'></i>",
            condition: () => isOwner,
            callback: () => tfm.socket.sendItem(item.uuid),
            group: "manage"
        }, {
            name: "TFM.ContextMenu.Delete",
            icon: "<i class='fa-solid fa-fw fa-trash'></i>",
            condition: () => isOwner,
            callback: () => item.delete(),
            group: "manage"
        }];

        return options;
    }
}
