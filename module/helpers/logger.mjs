
export default class LOGGER {
    static log(msg) {
        console.log(`TFM LOG |`, msg);
    }

    static warn(msg) {
        console.warn(`TFM WRN |`, msg);
    }

    static trace(msg) {
        console.log(`TFM TRC |`, msg);
    }

    static debug(msg, ...extraInfo) {
        console.debug(`TFM | ${msg}`, ...extraInfo);
    }

    static error(msg, ...extraInfo) {
        if (typeof msg === "object") {
            console.error(msg, ...extraInfo);
        } else {
            console.error(`TFM ERR | ${msg}`, ...extraInfo);
        }
    }
}