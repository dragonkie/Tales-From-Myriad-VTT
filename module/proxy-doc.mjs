import { TfmActor } from "./documents/actor/actor.mjs";
import TfmCharacter from "./documents/actor/character.mjs";
import TfmNpc from "./documents/actor/npc.mjs";
import { TfmItem } from "./documents/item/item.mjs";
import TfmWeapon from "./documents/item/weapon.mjs";
import TfmTrinket from "./documents/item/trinket.mjs";
import TfmJob from "./documents/item/job.mjs";
import TfmFeature from "./documents/item/feature.mjs";
import TfmConsumable from "./documents/item/consumable.mjs";
import TfmSpell from "./documents/item/spell.mjs";
import TfmPerformance from "./documents/item/performance.mjs";
import TfmArmour from "./documents/item/armour.mjs";


/**
 * Wraps all actors and items in a proxy that will intercept their constructor
 * Allows for orginization of type specific functions into seperate classes and files
 * @param {Object} entityTypes the list of classes that can be accesed by an entities data.type string
 * @param {Class} baseClass the object type being wrapped in the proxy and having its constructor intercepted
 * @returns 
 */
function mapProxies(entityTypes, baseClass) {
    // Adds a proxy to trap the item and actor classes
    return new Proxy(baseClass, {
        // Construct trap
        construct: (target, args) => {
            const [data, options] = args;// Args is an array holding the entity data and its creation options
            //Data is the standard NewedoActor or NewedoItem being created, and the .type is embedded in them at this point already
            const constructor = entityTypes[data.type];//Grabs the item type from the supplied list based on the entity type string

            if (!constructor)//if the constructor was not found, throw an error
                throw new Error(`Unsupported Entity type for create(): ${data.type}`);
            return new constructor(data, options);//Run the new types constructor on this object in place of the default one
        }
    });
}

const actorTypes = {};
actorTypes.character = TfmCharacter;
actorTypes.npc = TfmNpc;

const itemTypes = {};
itemTypes.weapon = TfmWeapon;
itemTypes.armour = TfmArmour;
itemTypes.trinket = TfmTrinket;
itemTypes.job = TfmJob;
itemTypes.feature = TfmFeature;
itemTypes.spell = TfmSpell;
itemTypes.performance = TfmPerformance;
itemTypes.consumable = TfmConsumable;

export const actorConstructor = mapProxies(actorTypes, TfmActor);
export const itemConstructor = mapProxies(itemTypes, TfmItem);