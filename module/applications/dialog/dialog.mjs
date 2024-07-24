import sysUtil from "../../helpers/sysUtil.mjs";
import LOGGER from "../../helpers/logger.mjs";

/**
 * Used to add helpful static dialog options to the base dialog class for easy use
 * this includes pulling up roll prompts for attacks, damage, etc
 * done so we dont need to configure every single one of these we see, mainly because
 * its bulky to set up the buttons in every single area these may be called from, and it
 * adds the option for other modules to make use of the quick use presets we have
 */
export default class TfmDialog extends foundry.applications.api.DialogV2 {

    static async createDialog(template, data, buttons) {
        const rendered = await renderTemplate(template, data);
        return new Promise((resolve, reject) => {
            const config = {
                window: { title: 'Roll' },
                content: rendered,
                buttons: buttons,
                close: () => resolve({ cancled: true }),
                submit: (result) => resolve(result)
            }

            const dialog = new foundry.applications.api.DialogV2(config, null).render(true);
        })
    }

    // Standard roll dialog with normal, adv, and dadv buttons
    static async roll(template, data, options = {}) {
        return this.createDialog(template, data, this.buttons.full);
    }

    static async attack(template, data) {
        return this.roll(template, data);
    }

    static async damage() {

    }

    static async spell(template, data) {
        return this.createDialog(template, data, this.buttons.simple);
    }

    // List of callback options, these cannot call the resolve function from its promise as a static entity in this class, but these functions can be called to retrieve the data from the dialog
    // nad then the submit callback will call resolve(result) to retrieve the data from these button callback options
    static callback = {
        default: (event, button, dialog) => ({ event: event, button: button, html: dialog }),
        cancel: () => resolve({ cancled: true })
    }

    static buttons = {
        full: [{
            label: "TFM.disadvantage",
            action: 'disadvantage',
            callback: this.callback.default
        }, {
            label: "TFM.normal",
            action: 'normal',
            callback: this.callback.default
        }, {
            label: "TFM.advantage",
            action: 'advantage',
            callback: this.callback.default
        }],
        simple: [{
            label: "TFM.roll",
            action: "roll",
            callback: this.callback.default
        }]
    }


}