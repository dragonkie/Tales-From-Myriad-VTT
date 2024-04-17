import LOGGER from "../../helpers/logger.mjs";
import { TFMItem } from "../tfm-item.mjs";

export default class TFMTrinket extends TFMItem {
    
    async _onDrop(data) {
        //Called by the item sheet class
        const item = await fromUuid(data.uuid);
        if (item.type === `spell`) {
            LOGGER.debug('TRINKET | SPELL | ADDING', item);
            this.system.spells.push({
                name: item.name,
                uuid: data.uuid
            });

            this.update({"system.spells": this.system.spells});
        }
    }
}