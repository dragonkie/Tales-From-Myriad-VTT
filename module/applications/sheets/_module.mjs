import * as ActorSheets from "./actor/_module.mjs";
import * as ItemSheets from "./item/_module.mjs";
import TfmActorSheet from "./actor.mjs";
import TfmItemSheet from "./item.mjs";
import TfmSheetMixin from "./mixin.mjs";

const sheet = {
    mixin: TfmSheetMixin,
    actor: {
        TfmActorSheet,
        ...ActorSheets
    },
    item: {
        TfmItemSheet,
        ...ItemSheets
    }
}

export default sheet;