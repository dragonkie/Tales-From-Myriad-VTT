import LOGGER from "./logger.mjs";

//extends the default die class with some additional dice terms without removing anything
//this replaces the default die roll in the CONFIG.Dice.types

export default class TFMDie {
    keep(modifier) {
        const rgx = /k([hlf])?([0-9]+)?/i;
        const match = modifier.match(rgx);
        if (!match) return false;
        let [direction, number] = match.slice(1);

        if (direction === `f`) {
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
}