import TfmItemSheet from "../item.mjs";

export default class ArmourSheet extends TfmItemSheet {
    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/armour.hbs` };
        return parts;
    }
}