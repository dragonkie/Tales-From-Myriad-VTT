import LOGGER from "../../helpers/logger.mjs";
import sysUtil from "../../helpers/sysUtil.mjs";
import { MyriadItem } from "../tfm-item.mjs";

export default class MyriadTrinket extends MyriadItem {

    async _onDrop(data) {
        //Called by the item sheet class
        const item = await fromUuid(data.uuid);
        if (item.type === `spell`) {
            for (var [key, spell] in this.system.spells) {
                if (spell.uuid == data.uuid  ||  spell.id == key) {
                    sysUtil.warn(`TFM.notify.warn.trinket Duplicate Spell`)
                    return null;
                }
            }

            this.system.spells[item.id] = {
                name: item.name,
                uuid: item.uuid,
                cd: item.system.cd,
                cs: item.system.cs
            };

            await this.update({"system.spells": this.system.spells});
            this.render(false);
        }
    }

    get invocation() {
        
    }
}