import LOGGER from "./logger.mjs";

export default class sysUtil {
    static notify(msg) {
        ui.notifications.notify(this.localize(msg));
    }

    static warn(msg) {
        ui.notifications.warn(this.localize(msg));
    }

    static error(msg) {
        ui.notifications.error(this.localize(msg));
    }

    static localize(text) {
        return game.i18n.localize(text) ?? text;
    }


    /** 
     * Returns the modifier for the value of a given stat
     * stats work like a curve with a step in the middle
     * there is a plateau at the average roll of 6-8 where
     * your stat has no modifier to begin with
     * Rapidly ascends / declines outside of here before slowing
     * down after reaching a +4 at 12
     * @param {Number} value Ability score
     * @returns {Number} Modifier for the given ability
     */
    static abilityMod(value) {
        //Calculates negative ability modifiers
        if (value < 6) return value - 6;
        //Calculates modifiers that exceed the base stat rolls available
        if (value > 12) return 4 + Math.floor((value - 12) / 2);
        //Normal positive stat rolls
        if (value > 8) return value - 8;
        return 0;    
    }

    /**
     * Returns the level of a character based on the ammount of xp they have
     * @param {*} exp Ammount of exp the character has
     * @returns {Number} The level the character should be at
     */
    static levelXp(exp) {
        if (exp >= 550) return 10;
        if (exp >= 420) return 9;
        if (exp >= 330) return 8;
        if (exp >= 260) return 7;
        if (exp >= 200) return 6;
        if (exp >= 150) return 5;
        if (exp >= 100) return 4;
        if (exp >= 60) return 3;
        if (exp >= 30) return 2;
        return 1;
    }

    static nextLevel(lvl) {
        if (lvl == 1) return 30;
        if (lvl == 2) return 60;
        if (lvl == 3) return 100;
        if (lvl == 4) return 150;
        if (lvl == 5) return 200;
        if (lvl == 6) return 260;
        if (lvl == 7) return 330;
        if (lvl == 8) return 420;
        return 550;
    }

    static joinFormula(val1, val2) {
        if (!val1) return val2;
        if (!val2) return val1;
        if (typeof val1 === "number" && typeof val2 === "number") return val1 + val2;

        if (typeof val1 === "string" || typeof val2 === "string") {
            const mod = Array.from(val2)[0];
            if (mod === `-` || mod === `+`)  return val1 + val2;
        }

        return this.stringAdd(val1, val2);

    }

    static stringAdd(base, suffix) {
        if (base === ``) return suffix;
        if (suffix === ``) return base;
        return base + `+` + suffix;
    }

    static stringSub(base, prefix) {
        if (base === ``) return `-${prefix}`;
        if (prefix === ``) return base;
        return base + `-` + prefix;
    }

    static clamp(value, min, max) {
        return Math.max(Math.min(value, max), min);
    }

    static lerp(start, end, val) {
        const s = end - start; // The actual size of the lerp function
        return start + (s * val);
    }

    /**
     * Adds the given function in as a valid modifier for foundry dice roll formulas
     * @param {String} term 
     * @param {String} label 
     * @param {Function} func 
     */
    static registerMod(term, label, func) {
        LOGGER.log(`Registering die modifier: [${term}] to [${label}]`, func);
        Die.prototype.constructor.MODIFIERS[term] = label;
        Die.prototype[label] = func;
    }

    static registerDragDrop(drag, drop) {
        return {dragSelector: drag, dropSelector: drop};
    }

    static getDragData(event) {
        return JSON.parse(event.dataTransfer.getData("text/plain"));
    }
}