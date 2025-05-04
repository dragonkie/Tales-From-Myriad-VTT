import TfmItemSheet from "../item.mjs";

export default class JobSheet extends TfmItemSheet {
    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/job.hbs` };
        return parts;
    }
}