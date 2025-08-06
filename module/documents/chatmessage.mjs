import TfmDialog from "../applications/dialog.mjs";
import { TFM } from "../config.mjs";
import utils from "../helpers/utils.mjs";

export default class TfmChatMessage extends foundry.documents.ChatMessage {
    get actor() {
        return this.speakerActor;
    }

    get token() {
        if (!game.scenes) return null;
        const sceneId = this.speaker.scene ?? "";
        const tokenId = this.speaker.token ?? "";
        return game.scenes.get(sceneId)?.tokens.get(tokenId) ?? null;
    }

    get target() {
        const context = this.flags.tfm.context;
        if (!context) return null;
    }

    getRollData() {
        const {speakerActor, item} = this;
        return {
            ...speakerActor?.getRollData(),
            ...item?.getRollData()
        }
    }
}