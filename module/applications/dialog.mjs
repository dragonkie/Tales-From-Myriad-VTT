/**
   * @typedef {Object} DialogV2Button
   * @property {string} action                      The button action identifier.
   * @property {string} label                       The button label. Will be localized.
   * @property {string} [icon]                      FontAwesome icon classes.
   * @property {string} [class]                     CSS classes to apply to the button.
   * @property {boolean} [default]                  Whether this button represents the default action to take if the user
   *                                                submits the form without pressing a button, i.e. with an Enter
   *                                                keypress.
   * @property {DialogV2ButtonCallback} [callback]  A function to invoke when the button is clicked. The value returned
   *                                                from this function will be used as the dialog's submitted value.
   *                                                Otherwise, the button's identifier is used.
   */

/**
 * @callback DialogV2ButtonCallback
 * @param {PointerEvent|SubmitEvent} event        The button click event, or a form submission event if the dialog was
 *                                                submitted via keyboard.
 * @param {HTMLButtonElement} button              If the form was submitted via keyboard, this will be the default
 *                                                button, otherwise the button that was clicked.
 * @param {HTMLDialogElement} dialog              The dialog element.
 * @returns {Promise<any>}
 */

/**
 * @typedef {Object} DialogV2Configuration
 * @property {boolean} [modal]                    Modal dialogs prevent interaction with the rest of the UI until they
 *                                                are dismissed or submitted.
 * @property {DialogV2Button[]} buttons           Button configuration.
 * @property {string} [content]                   The dialog content.
 * @property {DialogV2SubmitCallback} [submit]    A function to invoke when the dialog is submitted. This will not be
 *                                                called if the dialog is dismissed.
 */

/**
 * @callback DialogV2RenderCallback
 * @param {Event} event                           The render event.
 * @param {HTMLDialogElement} dialog              The dialog element.
 */

/**
 * @callback DialogV2CloseCallback
 * @param {Event} event                           The close event.
 * @param {DialogV2} dialog                       The dialog instance.
 */

/**
 * @callback DialogV2SubmitCallback
 * @param {any} result                            Either the identifier of the button that was clicked to submit the
 *                                                dialog, or the result returned by that button's callback.
 * @returns {Promise<void>}
 */

/**
 * @typedef {object} DialogV2WaitOptions
 * @property {DialogV2RenderCallback} [render]    A synchronous function to invoke whenever the dialog is rendered.
 * @property {DialogV2CloseCallback} [close]      A synchronous function to invoke when the dialog is closed under any
 *                                                circumstances.
 * @property {boolean} [rejectClose=true]         Throw a Promise rejection if the dialog is dismissed.
 */

/**
 * A lightweight Application that renders a dialog containing a form with arbitrary content, and some buttons.
 * @extends {ApplicationV2<ApplicationConfiguration & DialogV2Configuration>}
 *
 * @example Prompt the user to confirm an action.
 * ```js
 * const proceed = await foundry.applications.api.DialogV2.confirm({
 *   content: "Are you sure?",
 *   rejectClose: false,
 *   modal: true
 * });
 * if ( proceed ) console.log("Proceed.");
 * else console.log("Do not proceed.");
 * ```
 *
 * @example Prompt the user for some input.
 * ```js
 * let guess;
 * try {
 *   guess = await foundry.applications.api.DialogV2.prompt({
 *     window: { title: "Guess a number between 1 and 10" },
 *     content: '<input name="guess" type="number" min="1" max="10" step="1" autofocus>',
 *     ok: {
 *       label: "Submit Guess",
 *       callback: (event, button, dialog) => button.form.elements.guess.valueAsNumber
 *     }
 *   });
 * } catch {
 *   console.log("User did not make a guess.");
 *   return;
 * }
 * const n = Math.ceil(CONFIG.Dice.randomUniform() * 10);
 * if ( n === guess ) console.log("User guessed correctly.");
 * else console.log("User guessed incorrectly.");
 * ```
 *
 * @example A custom dialog.
 * ```js
 * new foundry.applications.api.DialogV2({
 *   window: { title: "Choose an option" },
 *   content: `
 *     <label><input type="radio" name="choice" value="one" checked> Option 1</label>
 *     <label><input type="radio" name="choice" value="two"> Option 2</label>
 *     <label><input type="radio" name="choice" value="three"> Options 3</label>
 *   `,
 *   buttons: [{
 *     action: "choice",
 *     label: "Make Choice",
 *     default: true,
 *     callback: (event, button, dialog) => button.form.elements.choice.value
 *   }, {
 *     action: "all",
 *     label: "Take All"
 *   }],
 *   submit: result => {
 *     if ( result === "all" ) console.log("User picked all options.");
 *     else console.log(`User picked option: ${result}`);
 *   }
 * }).render({ force: true });
 * ```
 */

export default class TfmDialog extends foundry.applications.api.DialogV2 {

}