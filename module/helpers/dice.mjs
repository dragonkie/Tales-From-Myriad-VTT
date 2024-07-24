import LOGGER from "./logger.mjs";
import sysUtil from "./sysUtil.mjs";

function keep(modifier) {
    const rgx = /k([hlf])?([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    let [direction, number] = match.slice(1);

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

/**Called on system init hook to register all the custom dice terms used by myriad */
export default function registerDiceModifiers() {
    sysUtil.registerMod(`kf`, `keep`, keep);
}