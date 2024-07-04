import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { TfmItem } from "./item.mjs";

export default class TfmArmour extends TfmItem {
    prepareBaseData() {
        super.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();

    }

    _getSelectors(context) {
        const selectors = {};

        selectors.itemSlot = foundry.applications.fields.createSelectInput({
            options: [
                { value: "head", label: "TYPES.armour.head" },
                { value: "shoulder", label: "TYPES.armour.shoulder" },
                { value: "torso", label: "TYPES.armour.torso" },
                { value: "back", label: "TYPES.armour.back" },
                { value: "legs", label: "TYPES.armour.legs" },
                { value: "feet", label: "TYPES.armour.feet" },
                { value: "shield", label: "TYPES.armour.shield" },
            ],
            groups: [],
            value: this.system.slot,
            valueAttr: "value",
            labelAttr: "label",
            localize: true,
            invert: false,
            sort: false,
            name: "system.slot"
        }).outerHTML;

        selectors.weightClass = foundry.applications.fields.createSelectInput({
            options: [
                { value: "min", label: "TYPES.armour.min" },
                { value: "lit", label: "TYPES.armour.lit" },
                { value: "med", label: "TYPES.armour.med" },
                { value: "hvy", label: "TYPES.armour.hvy" },
            ],
            groups: [],
            value: this.system.weight,
            valueAttr: "value",
            labelAttr: "label",
            localize: true,
            invert: false,
            sort: false,
            name: "system.weight"
        }).outerHTML;

        return selectors;
    }

    _getTags() {
        const tags = {
            slot: { label: `Slot`, value: sysUtil.localize(`TYPES.armour.${this.system.slot}`) },
            weight: { label: `Weight`, value: sysUtil.localize(`TYPES.armour.${this.system.weight}`) },
            dr: { label: `DR`, value: this.system.dr }
        }

        return tags;
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