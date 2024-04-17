
export default class LOGGER {
    static log(msg, ...extraInfo) {
        console.log(`TFM LOG | ${msg}`, ...extraInfo);
    }

    static warn(msg, ...extraInfo) {
        console.warn(`TFM WRN | ${msg}`, ...extraInfo);
    }

    static trace(msg, ...extraInfo) {
        console.log(`TFM TRC |${msg}`, ...extraInfo);
    }

    static debug(msg, ...extraInfo) {
        console.debug(`TFM DBG | ${msg}`, ...extraInfo);
    }

    static error(msg, ...extraInfo) {
        if (typeof msg === "object") {
            console.error(msg, ...extraInfo);
        } else {
            console.error(`TFM ERR | ${msg}`, ...extraInfo);
        }
    }
}