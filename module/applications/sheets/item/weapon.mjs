import TfmItemSheet from "../item.mjs";

export default class WeaponSheet extends TfmItemSheet {
    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/weapon.hbs` };
        return parts;
    }
}