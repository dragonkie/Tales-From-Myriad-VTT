import { TFM } from "../../config.mjs";
import LOGGER from "../../helpers/logger.mjs";
import utils from "../../helpers/utils.mjs";
import TfmContextMenu from "../context-menu.mjs";
import TfmDialog from "../dialog.mjs";

export default function TfmSheetMixin(Base) {
    const mixin = foundry.applications.api.HandlebarsApplicationMixin;
    return class TfmDocumentSheet extends mixin(Base) {

        static SHEET_MODES = { EDIT: 0, PLAY: 1 };
        _sheetMode = this.constructor.SHEET_MODES.PLAY;

        static DEFAULT_OPTIONS = {
            form: { submitOnChange: true },
            actions: {// Default actions must be static functions
                editImage: this._onEditImage,
                toggleSheet: this._onToggleSheet,
                toggleOpacity: this._ontoggleOpacity,

                // Active effects
                effectToggle: this._onToggleEffect,
                effectEdit: this._onEditEffect,
                effectDelete: this._onDeleteEffect,
                effectCreate: this._onCreateEffect,

                toggleDescription: this._onToggleDescription,
                collapse: this._onToggleCollapse,
                toggleMode: this._onToggleMode,
                edit: this._onEditUuid,
                delete: this._onDeleteEmbedded,

                // Useful and common things
                configField: this._onConfigureField,
            }
        };

        tabGroups = {};

        static TABS = {};

        _getTabs() {
            return Object.values(this.constructor.TABS).reduce((acc, v) => {
                const isActive = this.tabGroups[v.group] === v.id;
                acc[v.id] = {
                    ...v,
                    active: isActive,
                    cssClass: isActive ? "item active" : "item",
                    tabCssClass: isActive ? "tab active" : "tab"
                };
                return acc;
            }, {});
        }

        //============================================================================================
        //> Sheet Context
        //============================================================================================
        async _prepareContext(options) {
            const doc = this.document;
            const context = {
                document: doc,
                system: {},
                config: CONFIG.TFM,
                rollData: doc.getRollData(),
                name: doc.name,
                flags: this.document.flags,
                tabs: this._getTabs(),
                isEditMode: this.isEditMode,
                isPlayMode: this.isPlayMode,
                isEditable: this.isEditable,
                isGM: game.user.isGM,
                effects: {}
            }

            // add in effect documents to sorted lists
            for (const [key, value] of Object.entries(TFM.Effects)) {
                context.effects[key] = {
                    label: value,
                    effects: [],
                }
            }

            for (const entry of doc.effects.entries()) {
                const effect = entry[1];
                if (effect.isSuppressed) context.effects.suppressed.effects.push(effect);
                else if (effect.disabled) context.effects.disabled.effects.push(effect);
                else if (effect.isTemporary) context.effects.active.effects.push(effect);
                else context.effects.passive.effects.push(effect);
                console.log(effect);
            }

            // special method for copying the system, utils.deepClone doesnt decouple its version from the copy
            for (const [key, value] of Object.entries(doc.system)) {
                context.system[key] = tfm.utils.duplicate(value);
            }
            context.system.schema = doc.system.schema;

            return context;
        }

        get sheetMode() {
            return this._sheetMode;
        }

        get isPlayMode() {
            return this._sheetMode === this.constructor.SHEET_MODES.PLAY;
        }

        get isEditMode() {
            return this._sheetMode === this.constructor.SHEET_MODES.EDIT;
        }

        //============================================================================================
        //> Rendering
        //============================================================================================

        /**
         * Querys the server to render the application
         * @param {*} options 
         * @param {*} _options 
         * @returns 
         */
        async render(options, _options) {
            return super.render(options, _options);
        }

        async _preRender(context, options) {
            this._getFocusElement();
            this._getCollapsedElements();
            return super._preRender(context, options);
        }

        /**
         * Called once when the sheet is initially opened
         * @param {*} context 
         * @param {*} options 
         */
        _onFirstRender(context, options) {
            super._onFirstRender(context, options);
            this._setupContextMenu();
        }

        /**
         * Called after every time the sheet is rendered / re rendered
         * @param {*} context 
         * @param {*} options 
         */
        _onRender(context, options) {
            super._onRender(context, options);

            // disables all input elements if this isnt editable for the user
            if (!this.isEditable) {
                this.element.querySelectorAll("input, select, textarea, multi-select").forEach(n => {
                    n.disabled = true;
                })
            }
            this._setupDragAndDrop();
            this._setFocusElement();
            this._setCollapsedElements();
        }

        async _preClose(options) {
            let r = await super._preClose(options);
            this._getCollapsedElements();

            return r;
        }

        async _renderHTML(context, options) {
            return super._renderHTML(context, options);
        }

        async _renderFrame(options) {
            const frame = super._renderFrame(options);

            // Insert additional buttons into the window header
            // In this scenario we want to add a lock button
            if (this.isEditable && !this.document.getFlag("core", "sheetLock")) {
                const label = game.i18n.localize("SHEETS.toggleLock");
                let icon = this.isEditMode ? 'fa-lock-open' : 'fa-lock';
                const sheetConfig = `<button type="button" class="header-control fa-solid ${icon} icon" data-action="toggleMode" data-tooltip="${label}" aria-label="${label}"></button>`;
                this.window.close.insertAdjacentHTML("beforebegin", sheetConfig);
            }

            return frame;
        }

        _replaceHTML(result, content, options) {
            return super._replaceHTML(result, content, options);
        }

        _insertElement(element) {
            return super._insertElement(element);
        }

        _removeElement(element) {
            return super._removeElement(element);
        }

        async _preparePartContext(partId, context, options) {
            return super._preparePartContext(partId, context, options);
        }

        _preSyncPartState(partId, newElement, priorElement, state) {
            return super._preSyncPartState(partId, newElement, priorElement, state);
        }

        _syncPartState(partId, newElement, priorElement, state) {
            return super._syncPartState(partId, newElement, priorElement, state);
        }

        //======================================================================================================
        //> Sheet user focus control
        //======================================================================================================
        _lastFocusElement = null;

        /**
         * Saves the currently focused element as a selector
         */
        _getFocusElement() {
            if (this.rendered && this.element.contains(document.activeElement)) {
                const ele = document.activeElement;

                var cList = '';
                ele.classList.forEach(c => cList += `.${c}`);

                this._lastFocusElement = {
                    name: ele.name || '',
                    value: ele.value || '',
                    class: cList,
                    tag: ele.tagName.toLowerCase()
                }
            }
        }

        /**
         * Sets the focused element to its previous state
         */
        _setFocusElement() {
            if (this._lastFocusElement !== null) {
                let selector = this._lastFocusElement.tag + this._lastFocusElement.class;
                if (this._lastFocusElement.name) selector += `[name="${this._lastFocusElement.name}"]`;

                /** @type {HTMLElement|undefined}*/
                const targetElement = this.element.querySelector(selector);
                if (targetElement) {
                    targetElement.focus();
                    if (targetElement.tagName == 'INPUT') targetElement.select();
                }
            }
        }

        //==============================================================================================================
        //> collapsable content persistence
        //==============================================================================================================
        _collapsedElements = [];

        /**
         * Saves the list of elements to be collapsed and their state
         * @returns 
         */
        _getCollapsedElements() {
            if (this.rendered) {
                this._collapsedElements = [];
                /** @type {NodeList|null} */
                const elements = this.element.querySelectorAll('.collapsible');
                for (const element of elements) {
                    let selector = ``;
                    let ele = element;

                    while (ele) {
                        // Get element node
                        let s = `${ele.nodeName}`; // classes

                        // add elements classes
                        for (const c of ele.classList) if (c != "collapsed" && c != "active" && c != 'animating') s += `.${c}`;

                        // add element attributes
                        for (const a of ele.attributes) if (a.name != 'class' && a.name != 'style') s += `[${a.name}="${a.value}"]`;

                        // add this elements selector to the unique selector
                        selector = s + ' ' + selector;

                        // Prevent the check from leaving the scope of the sheet
                        if (ele.classList.contains('window-content')) break;

                        // Progress to the next parent
                        ele = ele.parentElement;
                    }

                    this._collapsedElements.push({
                        collapsed: element.classList.contains('collapsed'),
                        selector: selector
                    });
                }
                return this._collapsedElements;
            }
            return [];
        }

        /**
         * Sets the elements to their correct collapsed state
         * @returns {Array}
         */
        _setCollapsedElements() {
            const list = [];
            if (this._collapsedElements.length > 0 && this.rendered) {
                let c = 0;
                this._collapsedElements.forEach(({ selector, collapsed }) => {
                    const ele = this.element.querySelector(selector);
                    if (!ele) {
                        console.error('Failed to get element with selector: ', { s: selector });
                        return;
                    }
                    list.push({ ele: ele, sel: selector, collapsed: collapsed })
                    if (collapsed) ele.classList.add('collapsed');
                    else ele.classList.remove('collapsed');
                })
            }

            return list;
        }


        //==============================================================================================================
        //> Drag & Drop
        //==============================================================================================================
        _setupDragAndDrop() {
            const dd = new foundry.applications.ux.DragDrop.implementation({
                dragSelector: "[data-uuid]",
                dropSelector: ".application",
                permissions: {
                    dragstart: this._canDragStart.bind(this),
                    drop: this._canDragDrop.bind(this)
                },
                callbacks: {
                    dragstart: this._onDragStart.bind(this),
                    drop: this._onDrop.bind(this)
                }
            });
            dd.bind(this.element);
        }

        _canDragStart(selector) {
            return true;
        }

        _canDragDrop(selector) {
            return this.isEditable && this.document.isOwner;
        }

        async _onDragStart(event) {
            const uuid = event.currentTarget.closest("[data-uuid]").dataset.uuid;
            const item = await fromUuid(uuid);
            const data = item.toDragData();
            event.dataTransfer.setData("text/plain", JSON.stringify(data));
        }

        async _onDrop(event) {
            event.preventDefault();
            if (!this.isEditable) return;
            const target = event.target;
            const { type, uuid } = utils.getDragEventData(event);
            const item = await fromUuid(uuid);

            if (!item) return;
            if (item.parent === this.document) return this._onSortItem(item, target);

            switch (type) {
                case "ActiveEffect": return this._onDropActiveEffect(event, item);
                case "Item": return this._onDropItem(event, item);
                case "Actor": return this._onDropActor(event, item);
                default: return;
            }
        }

        async _onDropItem(event, item) {
            LOGGER.debug('Recieved standard item drop');
            // Item dorps can be intercepted by overiding this function and returning a non true value
            // if returning !true, this will make _onDrop() skip default
            // document creation
            return true;
        }

        async _onDropActor(event, actor) {
            LOGGER.error(`Unhandled actor drop`, this);
        }

        async _onDropActiveEffect(event, effect) {

        }

        async _onSortItem(item, target) {
            if (item.documentName !== "Item") return;
            LOGGER.debug('Sorting item');
            const self = target.closest("[data-tab]")?.querySelector(`[data-uuid="${item.uuid}"]`);
            if (!self || !target.closest("[data-uuid]")) return;

            let sibling = target.closest("[data-uuid]") ?? null;
            if (sibling?.dataset.uuid === item.uuid) return;
            if (sibling) sibling = await fromUuid(sibling.dataset.uuid);

            let siblings = target.closest("[data-tab]").querySelectorAll("[data-uuid]");
            siblings = await Promise.all(Array.from(siblings).map(s => fromUuid(s.dataset.uuid)));
            siblings.findSplice(i => i === item);

            let updates = foundry.utils.performIntegerSort(item, { target: sibling, siblings: siblings, sortKey: "sort" });
            updates = updates.map(({ target, update }) => ({ _id: target.id, sort: update.sort }));
            this.document.updateEmbeddedDocuments("Item", updates);
        }

        //============================================================================================
        //> Setup Context Menu
        //============================================================================================
        _setupContextMenu() {
            console.log('creating context menu')
            new TfmContextMenu(
                this.element,
                "[data-uuid]",
                [],
                {
                    fixed: false,
                    jQuery: false,
                    onClose: () => { },
                    onOpen: element => {
                        const item = fromUuidSync(element.dataset.uuid);
                        if (!item) return;
                        ui.context.menuItems = this._getItemContextOptions(item);
                    }
                })
        }

        _getItemContextOptions(document) {
            const isOwner = document.isOwner;
            const isCharacter = document.actor.type === "character";
            const isNpc = document.actor.type === "npc";
            const isEquipped = document.isEquipped;
            const options = [{
                name: "TFM.ContextMenu.Edit",
                icon: "<i class='fa-solid fa-fw fa-edit'></i>",
                condition: () => isOwner,
                callback: () => document.sheet.render(true),
                group: "manage"
            }, {
                name: "TFM.ContextMenu.Gift",
                icon: "<i class='fa-solid fa-fw fa-gift'></i>",
                condition: () => {
                    const whitelist = ['weapon', 'armour', 'trinket'];
                    return whitelist.includes(document.type);
                },
                callback: () => { },
                group: "manage"
            }, {
                name: "TFM.ContextMenu.Delete",
                icon: "<i class='fa-solid fa-fw fa-trash'></i>",
                condition: () => isOwner,
                callback: () => document.delete(),
                group: "manage"
            }];

            return options;
        }

        _getEffectContextOptions() {

        }

        //============================================================================================
        // Sheet Actions
        //============================================================================================

        /**
         * Called whenever an action event is clicked
         * @param {Event} event 
         * @param {Element} target 
         */
        _onClickAction(event, target) { }

        static async _onEditUuid(event, target) {
            console.log(event);
            const uuid = event.target.closest('[data-uuid]')?.dataset.uuid;
            const doc = await fromUuid(uuid);
            if (doc) doc.sheet.render(true);
        }

        /**
         * 
         * @param {Event} event 
         * @param {Element} target 
         * @returns 
         */
        static _onEditImage(event, target) {
            if (!this.isEditable) return;
            const current = this.document.img;
            const fp = new foundry.applications.apps.FilePicker.implementation({
                type: "image",
                current: current,
                callback: path => this.document.update({ 'img': path }),
                top: this.position.top + 40,
                left: this.position.left + 10
            });
            fp.browse();
        }

        /**
         * 
         * @param {Event} event 
         * @param {Element} target 
         * @returns 
         */
        static _onToggleMode(event, target) {
            if (this.isPlayMode) this._sheetMode = this.constructor.SHEET_MODES.EDIT;
            else this._sheetMode = this.constructor.SHEET_MODES.PLAY;

            const lock = this.window.header.querySelector('.fa-lock, .fa-lock-open');
            lock.classList.toggle('fa-lock');
            lock.classList.toggle('fa-lock-open');

            this.render(false);
        }

        /**
         * 
         * @param {Event} event 
         * @param {Element} target 
         * @returns 
         */
        static _onToggleCollapse(event, target) {
            const container = target.querySelector('.collapsible') || target.closest('.collapsible');
            container.classList.toggle('collapsed');
        }

        static async _onDeleteEffect(event, target) {
            const uuid = target.closest('[data-effect-uuid]').dataset.effectUuid;
            const effect = await fromUuid(uuid);
            effect.delete();
        }

        static async _onEditEffect(event, target) {
            const uuid = target.closest('[data-effect-uuid]').dataset.effectUuid;
            const effect = await fromUuid(uuid);
            effect.sheet.render(true);
        }

        static async _onCreateEffect(event, target) {
            const type = target.closest('[data-effect-type]').dataset.effectType;
            const combat = game.combat;

            const effect = await ActiveEffect.create({
                name: `New ${type} effect`,
                disabled: type == 'disabled',
                origin: this.document.name,
                img: 'icons/svg/aura.svg',
                duration: {
                    startTime: game.time.worldTime,
                    startRound: combat ? combat.round : null,
                    startTurn: combat ? combat.turn : null
                }
            }, { parent: this.document, renderSheet: true });
        }
    }
}