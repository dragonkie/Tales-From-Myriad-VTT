import TfmItemSheet from "../item.mjs";

export default class TrinketSheet extends TfmItemSheet {
    static get PARTS() {
        const parts = super.PARTS;
        parts.settings = { template: `${tfm.filepath.template}/sheet/item/settings/trinket.hbs` };
        return parts;
    }
}