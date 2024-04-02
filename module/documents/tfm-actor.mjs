import sysUtil from "../helpers/sysUtil.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class TFMActor extends Actor {

    
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

    /**
     * Prepare Monster type specific data.
     */
    _prepareMonsterData(actorData) {
        if (actorData.type !== 'monster') return;

        // Make modifications to data here. For example:
        const systemData = actorData.system;
    }
    /**
     * Override getRollData() that's supplied to rolls.
     */
    getRollData() {
        const data = super.getRollData();

        // Prepare character roll data.
        this._getCharacterRollData(data);
        this._getNpcRollData(data);
        console.log(data);
        return data;
    }

    /**
     * Prepare character roll data.
     */
    _getCharacterRollData(data) {
        if (this.type !== 'character') return;

        // Copy the ability scores to the top level, so that rolls can use
        // formulas like `@pwr.mod + 4`.
        for (let [k, v] of Object.entries(data.abilities)) {
            data[k] = foundry.utils.deepClone(v);
        }
        // Copy attributes to the the top level
        for (let [k, v] of Object.entries(data.attributes)) {
            data[k] = foundry.utils.deepClone(v);
        }
    }

    /**
     * Prepare NPC roll data.
     */
    _getNpcRollData(data) {
        if (this.type !== 'npc') return;

        // Process additional NPC data here.
    }

}