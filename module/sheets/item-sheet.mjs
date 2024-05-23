import LOGGER from "../helpers/logger.mjs";
import sysUtil from "../helpers/sysUtil.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class TFMItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["tfm", "sheet", "item"],
            width: 520,
            height: 480,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
            dragDrop: [{ dragSelector: ".item .itemlist", dropSelector: null }]
        });
    }

    /** @override */
    get template() {
        const path = `systems/${game.system.id}/templates/item`;
        // Return a single sheet for all item types.
        // return `${path}/item-sheet.html`;

        // Alternatively, you could use the following return statement to do a
        // unique item sheet by type, like `weapon-sheet.html`.
        return `${path}/item-${this.item.type}-sheet.hbs`;
    }

    /** @override */
    getData() {
        // Retrieve base data structure.
        const context = super.getData();

        // Use a safe clone of the item data for further operations.
        const itemData = context.item;

        // get any item specific data using their relevant function if possible
        if (typeof this.item.getData === `function`) {
            this.item.getData(context);
        }

        // Retrieve the roll data for TinyMCE editors.
        context.rollData = {};
        let actor = this.object?.parent ?? null;
        if (actor) {
            context.rollData = actor.getRollData();
        }

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = itemData.system;
        context.flags = itemData.flags;

        return context;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // With item sheets we dont have access to an item list, so items use their UUID instead of just ID's
        // This comes with unique utility though, allowing us to maintain the asset library much more easily
        // without restricting player customization.
        // By updating the item originally linked from here, its possible to update all instances of items, spells, etc
        // en bulk
        // ex. you have multiple trinkets with the same spell, updating the spell once will update it for all
        // This can lead to unexpected behaviours though depending on where items are linked from.
        // To ensure that items are linked properly, if an item is ever linked from an owned instance such as an actor
        // it should be copied over to the game.items list and linked from there instead to prevent any accidental 
        // modifications that may affect other players
        // Once the item is added to a player sheet though the items are copied to them, at which point they can freely edit them without
        // worrying about making unwanted changes to the system
        // When an item is given to a player through another item, it should be given a flag to identify their source item
        html.find('.item-edit').click(async ev => {
            const li = $(ev.currentTarget).parents(".item");// Jquery get the first parent element
            const item = await fromUuid(li.data("itemUuid"));
            item.sheet.render(true);
        });

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Remove a nested list item, this works awkwardly with how data needs to be stored
        // the html data needs to be given a "data-target" attribute for this to function and should follow dot notation
        // The given elements MUST HAVE a their uuid data attached to work properly
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const target = (li.data("target"));

            //searches this data object for what were looking for
            let regex = /[A-Za-z]+/g;
            let matches = target.match(regex);

            let select = this.item;
            for (var m of matches) {
                if (select.hasOwnProperty(m)) select = select[m];
                else {
                    LOGGER.error(`Property path for deletion is invalid`)
                    return null;
                }
            }
            if (!Array.isArray(select)) LOGGER.error(`ItemSheet | Item delete event not targeting item array`);

            // Select should currently be targeting our array at this point, now we just need to find our target and splice it
            for (var c = 0; c < select.length; c++) {
                if (select[c].uuid == li.data(`itemUuid`)) {
                    select.splice(c, 1);
                    break;
                }
            }

            // Update the item with the new selector
            var updateData = {};
            updateData[target] = select;
            this.item.update(updateData);// sends the update to the server
        });
    } 

    /**
     * Called when foundry registers a drop of any kind on this item sheet
     * if the item defines its own drop handler, it is called
     * otherwise we output a console error for uncaught drop
     */
    async _onDrop(event) {
        LOGGER.debug("ITEM | DROP");
        var dragData = sysUtil.getDragData(event);
        var item = this.item;

        // If the item has a relevant handler, delegate the work to it instead
        if (typeof item._onDrop === `function`) item._onDrop(dragData);
        else {
            LOGGER.error(`No drop function defined for item of type ${item.type}`);
            LOGGER.error(`Event Data:`, dragData);
            super._onDrop(event);
        }
    }
}
