import { onManageActiveEffect, prepareActiveEffectCategories } from "../../helpers/effects.mjs";
import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { TfmSheetMixin } from "../base-sheet.mjs";
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
            changeProf: this._onChangeProficiency,
            roll: this._onRoll,
            rollAbility: this._onRollAbility
        }
    }

    static PARTS = {
        header: { template: "systems/tales-from-myriad/templates/actor/character/character-header.hbs" },
        tabs: { template: "systems/tales-from-myriad/templates/parts/sheet-tabs.hbs" },
        features: { template: "systems/tales-from-myriad/templates/actor/parts/actor-features.hbs" },
        items: { template: "systems/tales-from-myriad/templates/actor/parts/actor-items.hbs" },
        spells: { template: "systems/tales-from-myriad/templates/actor/parts/actor-spells.hbs" }
    }

    static TABS = {
        features: { id: "features", group: "primary", label: "TFM.tab.features" },
        items: { id: "items", group: "primary", label: "TFM.tab.items" },
        spells: { id: "spells", group: "primary", label: "TFM.tab.spells" }
    }

    tabGroups = {
        primary: "features",
    }

    /* ------------------------- RENDER CONTEXT DATA PREP ----------------------------------*/
    async _prepareContext(options) {
        const doc = this.document;
        const rollData = doc.getRollData();

        const context = {
            document: doc,
            system: doc.system,
            config: CONFIG.TFM,
            name: doc.name,
            abilities: this._prepareAbilities(),
            health: this._prepareHealth(),
            items: this._prepareItems(),
            itemTypes: doc.itemTypes,
            rollData: rollData,
            tabs: this._getTabs(),
            isEditMode: this.isEditMode,
            isPlayMode: this.isPlayMode,
            isEditable: this.isEditable
        }

        if (this.document.type === 'character') this._prepareCharacterData(context);
        else if (this.document.type === 'npc') this._prepareNpcData(context);

        return context;
    }

    _prepareAbilities() {
        const abilities = sysUtil.duplicate(this.document.system.abilities);

        for (var [key, ability] of Object.entries(abilities)) {
            ability.label = sysUtil.localize(`TFM.ability.${key}`);
            ability.abbr = sysUtil.localize(`TFM.ability.abbr.${key}`);
        }

        return abilities;
    }

    _prepareHealth() {
        const hp = sysUtil.duplicate(this.document.system.hp);
        hp.percent = sysUtil.clamp((hp.value / hp.max * 100).toFixed(0), 0, 100)

        return hp;
    }

    _prepareItems() {
        return this.document.items;
    }

    /* -------------------------------------------------------------- PREPARE CHARACTER DATA ----------------------------------------------------- */
    _prepareCharacterData(context) {
        context.level = this._prepareLevel();
    }

    _prepareLevel() {
        const prevLevel = this.document.level === 1 ? 0 : Math.max(sysUtil.nextLevel(this.document.level - 1));
        const percent = (this.document.system.lvl.xp - prevLevel) / (sysUtil.nextLevel(this.document.level) - prevLevel) * 100;

        return {
            value: this.document.level,
            xp: this.document.system.lvl.xp,
            xpToNext: sysUtil.nextLevel(this.document.level),
            progress: percent
        }
    }

    /* -------------------------------------------------------------- PREPARE NPC DATA ----------------------------------------------------- */
    _prepareNpcData(context) {

    }

    /* ----------- RENDER OVERIDES --------------------*/


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
    /**********************************************************************************************/
    /*                                                                                            */
    /*                                    ACTION TRIGGERS                                         */
    /*                                                                                            */
    /**********************************************************************************************/
    static async _onUseItem(event, target) {
        const uuid = target.closest(".item[data-item-uuid]").dataset.itemUuid;
        const item = await fromUuid(uuid);
        return item.use(target.dataset.use);
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
            content: `${sysUtil.localize('TFM.confirm.deleteItem')}: ${item.name}`,
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
    static async _onChangeProficiency(event, target) {
        if (this.document.type != `character`) return;

        const doc = this.document;
        const prof = target.closest('[data-prof]').dataset.prof
        const path = `system.prof.${prof}`;
        var value = doc.system.prof[prof] + 1;
        if (value > 3) value = 0;

        doc.update({ [path]: value });
    }

    static async _onRollAbility(event, target) {
        const template = `systems/${tfm.id}/templates/dialog/roll/ability.hbs`;
        const rollData = this.document.getRollData();
        const data = {
            ability: rollData[target.dataset.ability],
            label: `TFM.ability.${target.dataset.ability}`
        };

        const dialog = await tfm.applications.TfmDialog.roll(template, data);

        if (dialog.cancled) return;
        const options = sysUtil.getFormData(dialog.html, '[name]');

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

        const dialog = await tfm.applications.TfmDialog.roll(`systems/${tfm.id}/templates/dialog/default.hbs`);

        if (dialog.cancled) return;
        const rollOptions = sysUtil.getFormData(dialog.html, '[name]');

        LOGGER.debug(rollOptions);


        let roll = new Roll(data.roll, rollData);
        await roll.evaluate();
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
    }

    /***********************************************************************************/
    /*                                                                                 */
    /*                              CONTEXT MENU                                       */
    /*                                                                                 */
    /***********************************************************************************/

    _getItemContextOptions(item) {
        const isOwner = item.isOwner;
        const isCharacter = item.actor.type === "character";
        const isNpc = item.actor.type === "npc";
        const isEquipped = item.isEquipped;
        return [{
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
    }
}
