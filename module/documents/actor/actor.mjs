import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class TfmActor extends Actor {


    /** @override */
    prepareData() {
        // Prepare data for the actor. Calling the super version of this executes
        // the following, in order: data reset (to clear active effects),
        // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
        // prepareDerivedData().
        super.prepareData();
    }

    /** @override */
    prepareBaseData() {
        // Data modifications in this step occur before processing embedded
        // documents or derived data.
    }

    /**
     * @override
     * Augment the basic actor data with additional dynamic data. Typically,
     * you'll want to handle most of your calculated/derived data in this step.
     * Data calculated in this step should generally not exist in template.json
     * (such as ability modifiers rather than ability scores) and should be
     * available both inside and outside of character sheets (such as if an actor
     * is queried and has a roll executed directly from it).
     */
    prepareDerivedData() {
        const actorData = this;
        const systemData = actorData.system;
        const flags = actorData.flags.tfm || {};


    }


    prepareEmbeddedDocuments() {
        super.prepareEmbeddedDocuments();

        for (const item of this.items.contents) {
            switch (item.type) {
                case 'trinket': // Handles the managment of spells, if enabled
                    //let spells = item._prepareSpells();
                    break;
                default: break;
            }
        }
    }

    /**
     * Override getRollData() that's supplied to rolls.
     */
    getRollData() {
        const data = foundry.utils.deepClone(this.system);

        // Copy the ability scores to the top level, so that rolls can use
        // formulas like `@pow.mod + 4`.
        for (let [k, v] of Object.entries(data.abilities)) {
            data[k] = foundry.utils.deepClone(v.mod);
        }

        // used for exploding dice based on luck, so 2d6kf@karma
        data.karma = Math.max(3, 3 + data.lck);

        return data;
    }

}