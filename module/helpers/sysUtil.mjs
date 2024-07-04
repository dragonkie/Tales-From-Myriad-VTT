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
     * Returns the modifier for the given value
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

    /**
     * @param {Number} lvl 
     * @returns {Number} The ammount of XP required to level up
     */
    static nextLevel(lvl) {
        if (lvl <= 1) return 30;
        if (lvl == 2) return 60;
        if (lvl == 3) return 100;
        if (lvl == 4) return 150;
        if (lvl == 5) return 200;
        if (lvl == 6) return 260;
        if (lvl == 7) return 330;
        if (lvl == 8) return 420;
        return 550;
    }

    /**
     * Returns a random localzied string for a personal quest
     * @returns {String} Localized quest description
     */
    static getQuest() {
        let roll = Math.floor(Math.random() * 50);

        let num = ``
        if (roll < 10) num += `0`;
        if (roll < 100) num += `0`;
        num += `${roll}`;
        return sysUtil.localize(`TFM.quest.${num}`);
    }

    /**
     * Math function to ensure a value falls within a specified range
     * @param {*} value 
     * @param {*} min 
     * @param {*} max 
     * @returns 
     */
    static clamp(value, min, max) {
        return Math.max(Math.min(value, max), min);
    }

    /**
     * Linear interpolation of a value between points a and b
     * @param {Number} start 
     * @param {Number} end 
     * @param {Number} t 
     * @returns {Number}
     */
    static lerp(start, end, t) {
        return start * (1 - t) + end * t
    }

    /**
     * Adds the given function in as a valid modifier for foundry dice roll formulas
     * @param {String} term 
     * @param {String} label 
     * @param {Function} func 
     */
    static registerMod(term, label, func) {
        LOGGER.debug(`Registering die modifier: [${term}] to [${label}]`, func);
        foundry.dice.terms.Die.prototype.constructor.MODIFIERS[term] = label;
        foundry.dice.terms.Die.prototype[label] = func;
    }

    static getDragData(event) {
        return JSON.parse(event.dataTransfer.getData("text/plain"));
    }

    static getFormData(form, selectors) {
        const matches = form.querySelectorAll(selectors);
        LOGGER.log(matches)
        const data = {};
        for (const element of matches) {
            // Parse the input data based on type
            switch (element.type) {
                case 'number':
                    data[element.name] = +element.value;
                    break;
                case 'checkbox':
                    data[element.name] = element.checked;
                    break;
                default:
                    data[element.name] = element.value;
                    break;
            }
        }

        return data;
    }

    /**
     * Used to wait for a given element to load into the DOM
     * a bit of a bulky soloution, but its the best one I have
     * 
     * REMINDER - Study mutation observers as this will be important for other projects!
     * @param {Selector} selector 
     * @returns 
     */
    static waitForElm(selector) {
        //use a promise to allow for await to work as well as the use of .then()
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    /**
     * Convinient and light weight method to clone most data to prevent mutating source
     * @param {*} original 
     * @returns 
     */
    static duplicate(original) {
        return JSON.parse(JSON.stringify(original));
    }

    /**
     * Returns the ending ID value from a foundry UUID
     * @param {*} uuid 
     * @returns 
     */
    static IdFromUuid(uuid) {
        if (typeof uuid === 'string') return uuid.match(/[a-zA-Z]+$/);
        return null;
    }
}