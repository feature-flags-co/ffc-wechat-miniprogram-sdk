import { featureFlagEvaluatedTopic } from "./constants";
import { eventHub } from "./events";
import { logger } from "./logger";
import { FeatureFlagUpdateOperation, InsightType } from "./types";
import localStorage from "./localStorage";
var DataStoreStorageKey = 'ffcdatastore';
var Store = /** @class */ (function () {
    function Store() {
        var _this = this;
        this._isDevMode = false;
        this._userId = null;
        this._store = {
            featureFlags: {}
        };
        eventHub.subscribe("devmode_ff_".concat(FeatureFlagUpdateOperation.update), function (data) {
            var updatedFfs = Object.keys(data).map(function (key) {
                var changes = data[key];
                var ff = _this._store.featureFlags[key];
                var updatedFf = Object.assign({}, ff, { variation: changes['newValue'], timestamp: Date.now() });
                return updatedFf;
            }).reduce(function (res, curr) {
                res.featureFlags[curr.id] = Object.assign({}, curr, { timestamp: Date.now() });
                return res;
            }, { featureFlags: {} });
            _this.updateStorageBulk(updatedFfs, "".concat(DataStoreStorageKey, "_dev_").concat(_this._userId), false);
            _this._loadFromStorage();
        });
        eventHub.subscribe("devmode_ff_".concat(FeatureFlagUpdateOperation.createDevData), function () {
            localStorage.removeItem("".concat(DataStoreStorageKey, "_dev_").concat(_this._userId));
            _this._loadFromStorage();
            eventHub.emit("devmode_ff_".concat(FeatureFlagUpdateOperation.devDataCreated), _this._store.featureFlags);
        });
    }
    Object.defineProperty(Store.prototype, "userId", {
        set: function (id) {
            this._userId = id;
            this._loadFromStorage();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "isDevMode", {
        get: function () {
            return this._isDevMode;
        },
        set: function (devMode) {
            this._isDevMode = devMode;
            this._loadFromStorage();
        },
        enumerable: false,
        configurable: true
    });
    Store.prototype.getFeatureFlag = function (key) {
        return this._store.featureFlags[key];
    };
    Store.prototype.getVariation = function (key) {
        var featureFlag = this._store.featureFlags[key];
        if (!!featureFlag) {
            eventHub.emit(featureFlagEvaluatedTopic, {
                insightType: InsightType.featureFlagUsage,
                id: featureFlag.id,
                timestamp: Date.now(),
                sendToExperiment: featureFlag.sendToExperiment,
                variation: featureFlag.variationOptions.find(function (o) { return o.value === featureFlag.variation; })
            });
        }
        return featureFlag === null || featureFlag === void 0 ? void 0 : featureFlag.variation;
    };
    Store.prototype.setFullData = function (data) {
        if (!this._isDevMode) {
            this._store = {
                featureFlags: {}
            };
        }
        this.updateBulkFromRemote(data);
    };
    Store.prototype.getFeatureFlags = function () {
        return this._store.featureFlags;
    };
    Store.prototype.updateStorageBulk = function (data, storageKey, onlyInsertNewElement) {
        var dataStoreStr = localStorage.getItem(storageKey);
        var store = null;
        try {
            if (dataStoreStr && dataStoreStr.trim().length > 0) {
                store = JSON.parse(dataStoreStr);
            }
            else if (this.isDevMode || storageKey.indexOf('_dev_') === -1) {
                store = {
                    featureFlags: {}
                };
            }
        }
        catch (err) {
            logger.logDebug("error while loading local data store: ".concat(storageKey) + err);
        }
        if (!!store) {
            var featureFlags_1 = data.featureFlags;
            Object.keys(featureFlags_1).forEach(function (id) {
                var remoteFf = featureFlags_1[id];
                var localFf = store.featureFlags[id];
                var predicate = !localFf || (!onlyInsertNewElement && remoteFf.timestamp > localFf.timestamp);
                if (predicate) {
                    store.featureFlags[remoteFf.id] = Object.assign({}, remoteFf);
                }
            });
            this._dumpToStorage(store, storageKey);
        }
    };
    Store.prototype.updateBulkFromRemote = function (data) {
        var storageKey = "".concat(DataStoreStorageKey, "_").concat(this._userId);
        var devStorageKey = "".concat(DataStoreStorageKey, "_dev_").concat(this._userId);
        this.updateStorageBulk(data, storageKey, false);
        this.updateStorageBulk(data, devStorageKey, true);
        this._loadFromStorage();
    };
    Store.prototype._emitUpdateEvents = function (updatedFeatureFlags) {
        if (updatedFeatureFlags.length > 0) {
            updatedFeatureFlags.forEach(function (_a) {
                var id = _a.id, operation = _a.operation, data = _a.data;
                return eventHub.emit("ff_".concat(operation, ":").concat(data.id), data);
            });
            eventHub.emit("ff_".concat(FeatureFlagUpdateOperation.update), updatedFeatureFlags.map(function (item) { return item.data; }));
        }
    };
    Store.prototype._dumpToStorage = function (store, localStorageKey) {
        if (store) {
            var storageKey_1 = localStorageKey || "".concat(DataStoreStorageKey, "_").concat(this._userId);
            localStorage.setItem(storageKey_1, JSON.stringify(store));
            return;
        }
        var storageKey = this._isDevMode ? "".concat(DataStoreStorageKey, "_dev_").concat(this._userId) : "".concat(DataStoreStorageKey, "_").concat(this._userId);
        localStorage.setItem(storageKey, JSON.stringify(this._store));
    };
    Store.prototype._loadFromStorage = function () {
        var _this = this;
        try {
            var storageKey = this._isDevMode ? "".concat(DataStoreStorageKey, "_dev_").concat(this._userId) : "".concat(DataStoreStorageKey, "_").concat(this._userId);
            var dataStoreStr = localStorage.getItem(storageKey);
            var shouldDumpToStorage = false;
            if (this._isDevMode) {
                try {
                    var devData = JSON.parse(dataStoreStr);
                    if (devData === null || Object.keys(devData.featureFlags).length === 0) {
                        shouldDumpToStorage = true;
                        dataStoreStr = localStorage.getItem("".concat(DataStoreStorageKey, "_").concat(this._userId));
                    }
                }
                catch (err) {
                    shouldDumpToStorage = true;
                    dataStoreStr = localStorage.getItem("".concat(DataStoreStorageKey, "_").concat(this._userId));
                }
            }
            if (dataStoreStr && dataStoreStr.trim().length > 0) {
                // compare _store and dataStoreStr data and send notification if different
                var storageData_1 = JSON.parse(dataStoreStr);
                var updatedFeatureFlags = Object.keys(storageData_1.featureFlags).filter(function (key) {
                    var storageFf = storageData_1.featureFlags[key];
                    var ff = _this._store.featureFlags[key];
                    return !ff || storageFf.variation !== ff.variation;
                }).map(function (key) {
                    var storageFf = storageData_1.featureFlags[key];
                    var ff = _this._store.featureFlags[key];
                    return {
                        id: key,
                        operation: FeatureFlagUpdateOperation.update,
                        sendToExperiment: storageFf.sendToExperiment,
                        data: {
                            id: key,
                            oldValue: ff === null || ff === void 0 ? void 0 : ff.variation,
                            newValue: storageFf.variation
                        }
                    };
                });
                this._store = storageData_1;
                this._emitUpdateEvents(updatedFeatureFlags);
            }
            else {
                this._store = {
                    featureFlags: {}
                };
            }
            if (shouldDumpToStorage) {
                this._dumpToStorage();
            }
        }
        catch (err) {
            logger.logDebug('error while loading local data store: ' + err);
        }
    };
    return Store;
}());
export default new Store();
//# sourceMappingURL=store.js.map