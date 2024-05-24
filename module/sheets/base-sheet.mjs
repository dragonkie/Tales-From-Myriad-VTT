import LOGGER from "../helpers/logger.mjs";

export const MyriadSheetMixin = Base => {
    const mixin = foundry.applications.api.HandlebarsApplicationMixin;
    console.log("Adding mixin...");
    console.log(`Base:`, Base);
    console.log("Mixin:", mixin);
    return class DocumentSheetMyriad extends mixin(Base) {

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
            }
        };

        _onClickAction(event, target) {
            var data = { event: event, target: target }
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

        _onRender(context, options) {
            super._onRender(context, options);
            if (!this.isEditable) {
                LOGGER.log(`Disabling sheet inputs`);
                this.element.querySelectorAll("input, select, textarea, multi-select").forEach(n => {
                    n.disabled = true;
                })
            }
            this._setupDragAndDrop();
        }

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
                    if (this._onDropItem(event, item) != true) return;
                    break;
                }
                default: return;
            }

            foundry.utils.mergeObject(itemData, modification, { performDeletions: true });
            getDocumentClass(type).create(itemData, { parent: this.document });
        }

        async _onDropItem(event, data) {
            // Item dorps can be intercepted by overiding this function and returning a non true value
            // if returning !true, this will make _onDrop() skip default
            // document creation
            return true;
        }

        async _onDropActor() {
            LOGGER.error(`Unhandled actor drop`, this);
        }

        static _onEditImage(event, target) {
            if (!this.isEditable) return;
            const current = this.document.img;
            const fp = new FilePicker({
                type: "image",
                current: current,
                callback: path => this.document.update({ img: path }),
                top: this.position.top + 40,
                left: this.position.left + 10
            });
            fp.browse();
        }

        async createEmbeddedDocuments(type, list) {
            LOGGER.log('Creating new items', list);
            return super.createEmbeddedDocuments(type, list);
        }
    }
}