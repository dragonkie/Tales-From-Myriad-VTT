import LOGGER from "../helpers/logger.mjs";

export const TfmSheetMixin = Base => {
    const mixin = foundry.applications.api.HandlebarsApplicationMixin;
    return class TfmDocumentSheet extends mixin(Base) {

        static SHEET_MODES = { EDIT: 0, PLAY: 1 };

        static DEFAULT_OPTIONS = {
            form: { submitOnChange: true },
            actions: {// Default actions must be static functions
                editImage: this._onEditImage,
                toggleSheet: this._onToggleSheet,
                toggleOpacity: this._ontoggleOpacity,
                toggleEffect: this._onToggleEffect,
                editEffect: this._onEditEffect,
                deleteEffect: this._onDeleteEffect,
                createEffect: this._onCreateEffect,
                toggleDescription: this._onToggleDescription,
                toggleMode: this._onToggleMode,
            }
        };

        _onClickAction(event, target) {
            var data = { event: event, target: target };
            LOGGER.warn(`Uncaught sheet action missing handler`, data);
        }

        _sheetMode = this.constructor.SHEET_MODES.PLAY;

        get sheetMode() {
            return this._sheetMode;
        }

        get isPlayMode() {
            return this._sheetMode === this.constructor.SHEET_MODES.PLAY;
        }

        get isEditMode() {
            return this._sheetMode === this.constructor.SHEET_MODES.EDIT;
        }


        tabGroups = {};

        static TABS = {};

        _getTabs() {
            return Object.values(this.constructor.TABS).reduce((acc, v) => {
                const isActive = this.tabGroups[v.group] === v.id;
                acc[v.id] = {
                    ...v,
                    active: isActive,
                    cssClass: isActive ? "item active" : "item",
                    tabCssClass: isActive ? "tab scrollable active" : "tab scrollable"
                };
                return acc;
            }, {});
        }
        /*****************************************************************************************/
        /*                                                                                       */
        /*                                  SHEET RENDERING                                      */
        /*                                                                                       */
        /*****************************************************************************************/
        async render(options, _options) {
            return super.render(options, _options);
        }

        _onFirstRender(context, options) {
            super._onFirstRender(context, options);
            this._setupContextMenu();
        }

        _onRender(context, options) {
            super._onRender(context, options);
            if (!this.isEditable) {
                this.element.querySelectorAll("input, select, textarea, multi-select").forEach(n => {
                    n.disabled = true;
                })
            }
            this._setupDragAndDrop();
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
                const sheetConfig = `<button type="button" class="header-control fa-solid ${icon}" data-action="toggleMode" data-tooltip="${label}" aria-label="${label}"></button>`;
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

        /* ------------------------------------------ DRAG AND DROP ---------------------------------------- */
        _setupDragAndDrop() {
            const dd = new DragDrop({
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
            const { type, uuid } = TextEditor.getDragEventData(event);

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

        /***********************************************************************************/
        /*                                                                                 */
        /*                              CONTEXT MENU                                       */
        /*                                                                                 */
        /***********************************************************************************/

        _setupContextMenu() {
            new tfm.applications.TfmContextMenu(this.element, "[data-item-uuid]", [], {
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
            return [{
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
        }

        _getEffectContextOptions() {

        }

        /* ------------------------------- ACTION EVENTS ----------------------------------*/
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

        static _onToggleMode() {
            if (this.isPlayMode) this._sheetMode = this.constructor.SHEET_MODES.EDIT;
            else this._sheetMode = this.constructor.SHEET_MODES.PLAY;
            LOGGER.debug('Sheet mode toggled to:', this.sheetMode);

            const lock = this.window.header.querySelector('.fa-lock, .fa-lock-open');
            lock.classList.toggle('fa-lock');
            lock.classList.toggle('fa-lock-open');

            this.render(true);
        }
    }
}