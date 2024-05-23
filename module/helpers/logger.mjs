
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
        console.debug(`TFM DBG |`, ...extraInfo);
    }

    static error(...extraInfo) {
        console.error(`TFM ERR |`, ...extraInfo);
    }
}