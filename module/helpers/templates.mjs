/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
    const id = game.system.id;
    const sys = `systems/${id}/templates`
    const partials = [
        // Actor partials.
        `${sys}/actor/parts/actor-features.hbs`,
        `${sys}/actor/parts/actor-items.hbs`,
        `${sys}/actor/parts/actor-spells.hbs`,
        `${sys}/actor/parts/actor-effects.hbs`,
        `${sys}/actor/parts/actor-abilities.hbs`,
        `${sys}/actor/parts/actor-portrait.hbs`,
        `${sys}/actor/parts/actor-items-sorted.hbs`,
        `${sys}/parts/sheet-tabs.hbs`,

        // Character specific partials
        `${sys}/actor/character/character-header.hbs`,
        
        // NPC partials
        `${sys}/actor/npc/npc-header.hbs`,

        // Item partials
        `${sys}/item/parts/item-header.hbs`,
        `${sys}/item/parts/item-description.hbs`,

        // Dialog partials
        `${sys}/dialog/parts/roll-options.hbs`
    ];

    const paths = {};
    // Strips the partials down to barebones and prefixs them with the tfm tag to be used for easy loading and legibility in the .hbs sheets
    for (const path of partials) {
        paths[`tfm.${path.split("/").pop().replace(".hbs", "")}`] = path;
    }

    return loadTemplates(paths);
};
