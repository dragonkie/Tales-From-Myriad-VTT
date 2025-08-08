import { TFM } from "../../../config.mjs";
import utils from "../../../helpers/utils.mjs";
import TfmDialog from "../../dialog.mjs";
import TfmItemSheet from "../item.mjs";

export default class FeatureSheet extends TfmItemSheet {

    static DEFAULT_OPTIONS = {
        actions: {}
    }

    static get PARTS() {
        const parts = super.PARTS;
        parts.details = { template: `${tfm.filepath.template}/item/details/feature.hbs` };
        return parts;
    }
}