import { logger } from "./logger";
export default {
    getItem: function (key) {
        try {
            return wx.getStorageSync(key);
        }
        catch (e) {
            logger.logDebug(e);
            return '';
        }
    },
    setItem: function (key, data) {
        try {
            wx.setStorageSync(key, data);
        }
        catch (e) {
            logger.logDebug(e);
        }
    },
    removeItem: function (key) {
        try {
            wx.removeStorageSync('key');
        }
        catch (e) {
            logger.logDebug(e);
        }
    }
};
//# sourceMappingURL=localStorage.js.map