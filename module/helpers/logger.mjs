
export default class LOGGER {
    static log(...extraInfo) {
        console.log(`TFM LOG |`, ...extraInfo);
    }

    static warn(...extraInfo) {
        console.warn(`TFM WRN |`, ...extraInfo);
    }

    static trace(...extraInfo) {
        console.log(`TFM TRC |`, ...extraInfo);
    }

    static debug(...extraInfo) {
        if (game.settings.get(tfm.id, 'debug')) console.debug(`TFM DBG |`, ...extraInfo);
    }

    static error(...extraInfo) {
        console.error(`TFM ERR |`, ...extraInfo);
    }
}