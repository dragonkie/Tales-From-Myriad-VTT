import LOGGER from "./logger.mjs";
import utils from "./utils.mjs";

function keep(modifier) {
    const rgx = /k([hlf])?([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    console.log(match)
    let [ direction, number ] = match.slice(1);
    console.log(direction)
    console.log(number)
    number = parseInt(number) || 1;

    if (direction == `f`) {
        const results = this.results;
        for (var a = number; a < results.length; a++) {
            results[a].active = false;
            results[a].discarded = true;
        }
    } else {
        direction = direction ? direction.toLowerCase() : "h";
        foundry.dice.terms.DiceTerm._keepOrDrop(this.results, number, { keep: true, highest: direction === "h" });
    }
}

/**
 * if a previous dice exploded, rolls additional dice to meet the given number
 * @param {String} modifier 
 */
async function miracle(modifier) {
    // Check if a dice exploded at all
    let exploded = false;
    for (const r of this.results) if (r.exploded) exploded = true;

    // Trigger the explosions
    const limit = modifier.match(/[0-9]+/)
    if (exploded) while (this.results.length < limit) await this.roll({ explode: true });
}

/**Called on system init hook to register all the custom dice terms used by myriad */
export default function registerDiceModifiers() {
    utils.registerMod(`kf`, `keep`, keep);
    utils.registerMod('m', 'miracle', miracle);
}