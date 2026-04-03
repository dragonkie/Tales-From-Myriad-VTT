import LOGGER from "../helpers/logger.mjs";

/**
 * Small augmentation of base actors
 * @extends {Actor}
 */
export default class TfmActor extends foundry.documents.Actor {


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

        super.prepareBaseData();
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

        super.prepareDerivedData();
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
     * @override
     */
    getRollData() {
        const data = this.system.getRollData();

        // Copy the ability scores to the top level, so that rolls can use
        // formulas like `1d20 + @pwr`.
        // @pwr = abilities modifier
        // @power = abilities score
        for (let [k, v] of Object.entries(this.system.abilities)) {
            data[k] = v.mod;
            data[tfm.utils.localize(tfm.config.Abilities[k]).toLowerCase()] = v.value;
        }

        // used for exploding dice based on luck, so 2d6kf@karma
        data.karma = Math.max(3, 3 + data.lck);

        return data;
    }

    //=================================================================================
    //> _preData options
    //=================================================================================
    async _preCreate(data, options, user) {
        LOGGER.debug('Actor _preCreate Options', { data: data, options: options, user: user });
        return super._preCreate(data, options, user);
    }

    async _preUpdate(changed, options, user) {
        LOGGER.debug('Actor _preUpdate Options', { changed: changed, options: options, user: user });
        return super._preUpdate(changed, options, user);
    }

    async _preDelete(options, user) {
        LOGGER.debug('Actor _preDelete Options', { options: options, user: user });
        return super._preDelete(options, user);
    }

    async update(data, operation) {
        return super.update(data, operation);
    }

    //=================================================================================
    //> _onData options
    //=================================================================================
    _onUpdate(changed, options, userId) {
        return super._onUpdate(changed, options, userId);
    }

}