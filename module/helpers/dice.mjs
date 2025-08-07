import LOGGER from "./logger.mjs";
import utils from "./utils.mjs";

function keep(modifier) {
    const rgx = /k([hlf])?([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    const { direction, number } = match.slice(1);

    if (direction === `f`) {
        const results = this.results;
        let counter = 0;
        // Loops through dice results
        for (var a = 0; a < results.length; a++) {
            // Counts the number of active dice, when over the allowance, drop the rest
            if (results[a].active && counter < number) {
                counter += 1;
            } else if (counter >= number) {
                results[a].active = false;
                results[a].discarded = true;
            }
        }
    } else {
        direction = direction ? direction.toLowerCase() : "h";
        number = parseInt(number) || 1;
        DiceTerm._keepOrDrop(this.results, number, { keep: true, highest: direction === "h" });
    }
}

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