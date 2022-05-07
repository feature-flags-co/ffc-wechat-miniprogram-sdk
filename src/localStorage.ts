import { logger } from "./logger";

export default {
    getItem(key: string): string {
        try {
            return wx.getStorageSync(key);
        } catch (e) {
            logger.logDebug(e);
            return '';
        }
    },
    setItem(key: string, data: string) {
        try {
            wx.setStorageSync(key, data)
        } catch (e) {
            logger.logDebug(e);
        }
    },
    removeItem(key: string) {
        try {
            wx.removeStorageSync('key')
          } catch (e) {
            logger.logDebug(e);
          }
    }
}