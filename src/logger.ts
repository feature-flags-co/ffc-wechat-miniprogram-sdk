// TODO replace it with false
const debugMode = false;

export const logger = {
    logDebug(...args) {
        if (debugMode) {
            console.log(...args);
        }
    },

    log(...args) {
        console.log(...args);
    }
}