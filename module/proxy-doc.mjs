import { TFMActor } from "./documents/tfm-actor.mjs";
import TFMCharacter from "./documents/actor/tfm-character.mjs";
import TFMNpc from "./documents/actor/tfm-npc.mjs";
import { TFMItem } from "./documents/tfm-item.mjs";
import TFMWeapon from "./documents/item/tfm-weapon.mjs";
import TFMTrinket from "./documents/item/tfm-trinket.mjs";
import TFMJob from "./documents/item/tfm-job.mjs";
import TFMFeature from "./documents/item/tfm-feature.mjs";
import TFMConsumable from "./documents/item/tfm-consumable.mjs";
import TFMSpell from "./documents/item/tfm-spell.mjs";
import TFMPerformance from "./documents/item/tfm-performance.mjs";
import TFMArmour from "./documents/item/tfm-armour.mjs";


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
actorTypes.character = TFMCharacter;
actorTypes.npc = TFMNpc;

const itemTypes = {};
itemTypes.weapon = TFMWeapon;
itemTypes.armour = TFMArmour;
itemTypes.trinket = TFMTrinket;
itemTypes.job = TFMJob;
itemTypes.feature = TFMFeature;
itemTypes.spell = TFMSpell;
itemTypes.performance = TFMPerformance;
itemTypes.consumable = TFMConsumable;

export const actorConstructor = mapProxies(actorTypes, TFMActor);
export const itemConstructor = mapProxies(itemTypes, TFMItem);