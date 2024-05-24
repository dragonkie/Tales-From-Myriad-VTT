import LOGGER from "../../helpers/logger.mjs";
import { MyriadItem } from "../tfm-item.mjs";

export default class MyriadArmour extends MyriadItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        const actor = this.actor;
        
    }

    getData(context) {
        context.selectors = {}
        // Create selectors
        context.selectors.itemSlot = foundry.applications.fields.createSelectInput({
            options: [
                { value: "arc", label: "TYPES.magic.arc" },
                { value: "div", label: "TYPES.magic.div" },
                { value: "nat", label: "TYPES.magic.nat" },
                { value: "occ", label: "TYPES.magic.occ" },
                { value: "per", label: "TYPES.magic.per" },
            ],
            groups: [],
            value: this.system.type,
            valueAttr: "value",
            labelAttr: "label",
            localize: true,
            invert: false,
            sort: false,
            name: "system.type"
        }).outerHTML;

        context.selectors.weightClass = foundry.applications.fields.createSelectInput({
            options: [
                { value: "min", label: "TYPES.armour.min" },
                { value: "lit", label: "TYPES.armour.lit" },
                { value: "med", label: "TYPES.armour.med" },
                { value: "hvy", label: "TYPES.armour.hvy" },
            ],
            groups: [],
            value: this.system.type,
            valueAttr: "value",
            labelAttr: "label",
            localize: true,
            invert: false,
            sort: false,
            name: "system.type"
        }).outerHTML;
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