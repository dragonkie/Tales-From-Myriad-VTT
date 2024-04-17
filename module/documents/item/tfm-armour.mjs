import LOGGER from "../../helpers/logger.mjs";
import { TFMItem } from "../tfm-item.mjs";

export default class TFMArmour extends TFMItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        const actor = this.actor;
        
    }

    get slot() {
        return this.system.slot;
    }
    get weight() {
        return this.system.weight;
    }
    get dr() {
        return this.system.dr;
    }
    get equipped() {
        if (!this.actor) return false;
        return this.system.equipped;
    }
}