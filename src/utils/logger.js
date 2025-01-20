const logger = {
    info: (message) => {
        console.log(`[INFO] ${message}`);
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error);
    },
    debug: (message) => {
        console.debug(`[DEBUG] ${message}`);
    },
    warn: (message) => {
        console.warn(`[WARN] ${message}`);
    }
};

module.exports = logger; 