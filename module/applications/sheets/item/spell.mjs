import TfmItemSheet from "../item.mjs";

export default class SpellSheet extends TfmItemSheet {
    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/spell.hbs` };
        return parts;
    }
}