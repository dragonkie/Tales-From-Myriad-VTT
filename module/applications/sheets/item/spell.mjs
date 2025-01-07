import TfmItemSheet from "../item.mjs";

export default class SpellSheet extends TfmItemSheet {
    static get PARTS() {
        const parts = super.PARTS;
        parts.settings = { template: `${tfm.filepath.template}/sheet/item/settings/spell.hbs` };
        return parts;
    }
}