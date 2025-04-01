import TfmItemSheet from "../item.mjs";

export default class TrinketSheet extends TfmItemSheet {
    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/trinket.hbs` };
        return parts;
    }
}