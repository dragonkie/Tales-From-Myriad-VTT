// Import document classes.
import { TFMActor } from "./documents/tfm-actor.mjs";
import { TFMItem } from "./documents/tfm-item.mjs";
// Import sheet classes.
import { TFMActorSheet } from "./sheets/actor-sheet.mjs";
import { TFMItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { TFM } from "./helpers/config.mjs";
import sysUtil from "./helpers/sysUtil.mjs";
import LOGGER from "./helpers/logger.mjs";

import { actorConstructor, itemConstructor } from "./proxy-doc.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function () {

    // Add utility classes to the global game object so that they're more easily
    // accessible in global contexts.
    game.TFM = {
        TFMActor,
        TFMItem,
        sysUtil,
        LOGGER,
    };

    // Add custom constants for configuration.
    CONFIG.TFM = TFM;

    /**
     * Set an initiative formula for the system
     * @type {String}
     */
    CONFIG.Combat.initiative = {
        formula: "2d6",
        decimals: 2
    };

    // Define custom Document classes
    CONFIG.Actor.documentClass = actorConstructor;
    CONFIG.Item.documentClass = itemConstructor;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet(`tfm`, TFMActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet(`tfm`, TFMItemSheet, { makeDefault: true });

    /*
    Modify foundrys core Die class to accept new terms
    This is much easier to do than to go and attempt to extend foundry's classes
    this way theres no need to go and define an entire custome dice and re create the wheel
    instead we just intercept the Die object and add in the bit of data we need instead of 
    going and completely over writing it with a new Die type

    Modifiers {
        kf: registers with the keep function to save and only use the number of specified first dice
    }

    */

    // Registers new modifier types
    Die.MODIFIERS.kf = "keep";

    Die.prototype.keep = function (modifier) {
        const rgx = /k([hlf])?([0-9]+)?/i;
        const match = modifier.match(rgx);
        if (!match) return false;
        let [direction, number] = match.slice(1);

        LOGGER.log(modifier);
        LOGGER.log(match);
        LOGGER.log(direction);
        LOGGER.log(number);
        LOGGER.log(this.results);

        if (direction === `f`) {
            LOGGER.log(`IT MOTHER FUCKING WORKS!!!!!!!!!`);
            const results = this.results;
            if (results.length > number) {
                for (var a = 0; a < results.length; a++) {
                    if (a >= number) {
                        results[a].active = false;
                        results[a].discarded = true;
                    }
                }
            }
        } else {
            direction = direction ? direction.toLowerCase() : "h";
            number = parseInt(number) || 1;
            DiceTerm._keepOrDrop(this.results, number, { keep: true, highest: direction === "h" });
        }
    }

    // Preload Handlebars templates.
    return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
        if (typeof arguments[arg] != 'object') {
            outStr += arguments[arg];
        }
    }
    return outStr;
});

Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
    // First, determine if this is a valid owned item.
    if (data.type !== "Item") return;
    if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
        return ui.notifications.warn("You can only create macro buttons for owned Items");
    }
    // If it is, retrieve it based on the uuid.
    const item = await Item.fromDropData(data);

    // Create the macro command using the uuid.
    const command = `game.talesfrommyriad.rollItemMacro("${data.uuid}");`;
    let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
        macro = await Macro.create({
            name: item.name,
            type: "script",
            img: item.img,
            command: command,
            flags: { "talesfrommyriad.itemMacro": true }
        });
    }
    game.user.assignHotbarMacro(macro, slot);
    return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
    // Reconstruct the drop data so that we can load the item.
    const dropData = {
        type: 'Item',
        uuid: itemUuid
    };
    // Load the item from the uuid.
    Item.fromDropData(dropData).then(item => {
        // Determine if the item loaded and if it's an owned item.
        if (!item || !item.parent) {
            const itemName = item?.name ?? itemUuid;
            return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
        }

        // Trigger the item roll
        item.roll();
    });
}