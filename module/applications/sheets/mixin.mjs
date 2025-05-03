import { TFM } from "../../config.mjs";
import LOGGER from "../../helpers/logger.mjs";
import TfmContextMenu from "../context-menu.mjs";

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
                effectToggle: this._onToggleEffect,
                effectEdit: this._onEditEffect,
                effectDelete: this._onDeleteEffect,
                effectCreate: this._onCreateEffect,
                toggleDescription: this._onToggleDescription,
                collapse: this._onToggleCollapse,
                toggleMode: this._onToggleMode,
                edit: this._onEditEmbedded,
                delete: this._onDeleteEmbedded
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
        // Sheet Context
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
        // Rendering
        //============================================================================================

        /**
         * Querys the server to render the application
         * @param {*} options 
         * @param {*} _options 
         * @returns 
         */
        async render(options, _options) {
            console.trace('render');
            return super.render(options, _options);
        }

        /**
         * Called once when the sheet is initially opened
         * @param {*} context 
         * @param {*} options 
         */
        _onFirstRender(context, options) {
            console.trace('_onFirstRender')
            super._onFirstRender(context, options);
            this._setupContextMenu();
        }

        /**
         * Called after every time the sheet is rendered / re rendered
         * @param {*} context 
         * @param {*} options 
         */
        _onRender(context, options) {
            console.trace('_onRender')
            super._onRender(context, options);

            // disables all input elements if this isnt editable for the user
            if (!this.isEditable) {
                this.element.querySelectorAll("input, select, textarea, multi-select").forEach(n => {
                    n.disabled = true;
                })
            }
            this._setupDragAndDrop();

            // manipulate editor toggle buttons to be better
            /**@type {Array<Element>} */
            let editors = this.element.querySelectorAll('.description prose-mirror');
            for (const editor of editors) {

                const btn = editor.querySelector('button.toggle');
                const icon = btn.querySelector('i');
                const header = editor.parentElement.querySelector('.header');

                icon.classList.toggle('fa-edit');
                icon.classList.toggle('fa-feather-pointed');
            }
        }

        async _renderHTML(context, options) {
            console.trace('_renderHTML')
            return super._renderHTML(context, options);
        }

        async _renderFrame(options) {
            console.trace('_renderFrame')
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

        //==============================================================================================================
        //> Drag & Drop
        //==============================================================================================================
        _setupDragAndDrop() {
            const dd = new foundry.applications.ux.DragDrop.implementation({
                dragSelector: "[data-item-uuid]",
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
            const uuid = event.currentTarget.closest("[data-item-uuid]").dataset.itemUuid;
            const item = await fromUuid(uuid);
            const data = item.toDragData();
            event.dataTransfer.setData("text/plain", JSON.stringify(data));
        }

        async _onDrop(event) {
            event.preventDefault();

            const target = event.target;
            const { type, uuid } = foundry.applications.ux.TextEditor.getDragEventData(event);

            if (!this.isEditable) return;

            const item = await fromUuid(uuid);
            const itemData = item.toObject();

            // Disallow dropping invalid document types.
            if (!Object.keys(this.document.constructor.metadata.embedded).includes(type)) return;

            // If dropped onto self, perform sorting.
            if (item.parent === this.document) return this._onSortItem(item, target);

            const modification = {
                "-=_id": null,
                "-=ownership": null,
                "-=folder": null,
                "-=sort": null
            };

            switch (type) {
                case "ActiveEffect": {
                    foundry.utils.mergeObject(modification, {
                        "duration.-=combat": null,
                        "duration.-=startRound": null,
                        "duration.-=startTime": null,
                        "duration.-=startTurn": null,
                        "system.source": null
                    });
                    break;
                }
                case "Item": {
                    // Allows users to overide and dodge the base item creation
                    if (await this._onDropItem(event, item) != true) {
                        LOGGER.debug(`Item create overiden`);
                        return;
                    }
                    break;
                }
                default: return;
            }

            foundry.utils.mergeObject(itemData, modification, { performDeletions: true });
            getDocumentClass(type).create(itemData, { parent: this.document });
        }

        async _onDropItem(event, data) {
            LOGGER.debug('Recieved standard item drop');
            // Item dorps can be intercepted by overiding this function and returning a non true value
            // if returning !true, this will make _onDrop() skip default
            // document creation
            return true;
        }

        async _onDropActor() {
            LOGGER.error(`Unhandled actor drop`, this);
        }

        async _onSortItem(item, target) {
            if (item.documentName !== "Item") return;
            LOGGER.debug('Sorting item');
            const self = target.closest("[data-tab]")?.querySelector(`[data-item-uuid="${item.uuid}"]`);
            if (!self || !target.closest("[data-item-uuid]")) return;

            let sibling = target.closest("[data-item-uuid]") ?? null;
            if (sibling?.dataset.itemUuid === item.uuid) return;
            if (sibling) sibling = await fromUuid(sibling.dataset.itemUuid);

            let siblings = target.closest("[data-tab]").querySelectorAll("[data-item-uuid]");
            siblings = await Promise.all(Array.from(siblings).map(s => fromUuid(s.dataset.itemUuid)));
            siblings.findSplice(i => i === item);

            let updates = SortingHelpers.performIntegerSort(item, { target: sibling, siblings: siblings, sortKey: "sort" });
            updates = updates.map(({ target, update }) => ({ _id: target.id, sort: update.sort }));
            this.document.updateEmbeddedDocuments("Item", updates);
        }

        //============================================================================================
        //> Setup Context Menu
        //============================================================================================
        _setupContextMenu() {
            new TfmContextMenu(this.element, "[data-item-uuid]", [], {
                jQuery: false,
                onOpen: element => {
                    const item = fromUuidSync(element.dataset.itemUuid);
                    if (!item) return;
                    ui.context.menuItems = this._getItemContextOptions(item);
                }
            })
        }

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
                name: "TFM.ContextMenu.Delete",
                icon: "<i class='fa-solid fa-fw fa-trash'></i>",
                condition: () => isOwner,
                callback: () => item.delete(),
                group: "manage"
            }, {
                name: "TFM.ContextMenu.Gift",
                icon: "<i class='fa-solid fa-fw fa-gift'></i>",
                condition: () => isOwner,
                callback: () => item.delete(),
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

        /**
         * 
         * @param {Event} event 
         * @param {Element} target 
         * @returns 
         */
        static _onEditImage(event, target) {
            if (!this.isEditable) return;
            const current = this.document.img;
            const fp = new FilePicker({
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
            LOGGER.log('Sheet mode toggled to:', this.sheetMode);

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
            let container = target.querySelector('.collapsible') || target.closest('.collapsible');
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