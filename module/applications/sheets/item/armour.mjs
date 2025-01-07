import TfmItemSheet from "../item.mjs";

export default class ArmourSheet extends TfmItemSheet {
    static get PARTS() {
        const parts = super.PARTS;
        parts.settings = { template: `${tfm.filepath.template}/sheet/item/settings/armour.hbs` };
        return parts;
    }
}