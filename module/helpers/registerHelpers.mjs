/**
 * Registers helpers to use with handelbars
 */
class TFMHelpers {
    static async objectFromUuid(uuid) {
        var object = await fromUuid(uuid);
        return await object;
    }

    static linkUuid(uuid, text="") {
        // handelbars escapes returned values, use {{{ this }}} to insert this link as an actual element
        var link = TextEditor._createContentLink(["", "UUID", uuid]).outerHTML;
        console.log(link);
        return link;
    }
}

export default function registerHelpers() {
    Handlebars.registerHelper({
        fromUuid: TFMHelpers.objectFromUuid,
        linkUuid: TFMHelpers.linkUuid
    });
}