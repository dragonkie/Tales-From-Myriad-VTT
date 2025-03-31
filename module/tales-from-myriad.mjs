globalThis.tfm = { id: "tales-from-myriad" }
tfm.filepath = {
    template: `systems/${tfm.id}/templates`,
    module: `systems/${tfm.id}/module`
}

// Import helper/utility classes and constants.
import { TFM } from "./config.mjs";
import utils from "./helpers/utils.mjs";

import * as applications from "./applications/_module.mjs";
import * as dataModels from "./data/_module.mjs";
import * as documents from "./documents/_module.mjs"

import TfmSocketManager from "./helpers/socket.mjs";

import registerDiceModifiers from "./helpers/dice.mjs";
import registerHooks from "./helpers/hooks.mjs";
import registerHandlebars from "./helpers/handlebars.mjs";
import registerSystemSettings from "./helpers/settings.mjs";
import LOGGER from "./helpers/logger.mjs";

LOGGER.log('Gathering astral dust...')

tfm.application = applications;
tfm.document = documents;
tfm.utils = Object.assign(utils, foundry.utils);
tfm.config = TFM;
tfm.data = dataModels;

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */
Hooks.once('init', async function () {
    LOGGER.log('Now arriving in Myriad!');
    // Add custom constants for configuration.
    CONFIG.TFM = TFM;

    // Register document classes
    LOGGER.log('Registering documents');
    CONFIG.Actor.documentClass = documents.TfmActor;
    CONFIG.Item.documentClass = documents.TfmItem;
    CONFIG.Combat.documentClass = documents.TfmCombat;
    CONFIG.Combatant.documentClass = documents.TfmCombatant;

    // Register system data models
    LOGGER.log('Registering data models');
    CONFIG.Actor.dataModels = dataModels.actor.config;
    CONFIG.Item.dataModels = dataModels.item.config;

    // Register myriads custom system settings
    LOGGER.log('Calling helper functions');
    registerSystemSettings();
    registerHandlebars();
    registerHooks();
    registerDiceModifiers();

    // Remove the default sheets
    LOGGER.log('Registering sheets');
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    // register actor sheets
    for (const sheet of applications.sheet.actor.config) {
        Actors.registerSheet(tfm.id, sheet.application, sheet.options);
    }

    // register item sheets
    for (const sheet of applications.sheet.item.config) {
        Items.registerSheet(tfm.id, sheet.application, sheet.options);
    }

    LOGGER.log('Registering socket');
    tfm.socket = new TfmSocketManager();
});