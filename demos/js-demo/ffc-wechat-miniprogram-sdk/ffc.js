var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
//import devMode from "./devmode";
import { eventHub } from "./events";
import { logger } from "./logger";
import store from "./store";
import { networkService } from "./network.service";
import { InsightType, StreamResponseEventType } from "./types";
import { ffcguid, validateOption, validateUser } from "./utils";
import { Queue } from "./queue";
import { featureFlagEvaluatedBufferTopic, featureFlagEvaluatedTopic, insightsFlushTopic, insightsTopic, websocketReconnectTopic } from "./constants";
//import autoCapture from "./autocapture";
function createorGetAnonymousUser() {
    var sessionId = ffcguid();
    return {
        userName: sessionId,
        email: "".concat(sessionId, "@anonymous.com"),
        id: sessionId
    };
}
function mapFeatureFlagsToFeatureFlagBaseList(featureFlags) {
    return Object.keys(featureFlags).map(function (cur) {
        var _a = featureFlags[cur], id = _a.id, variation = _a.variation;
        return { id: id, variation: variation };
    });
}
var Ffc = /** @class */ (function () {
    function Ffc() {
        var _this = this;
        this._readyEventEmitted = false;
        this._insightsQueue = new Queue(1, insightsFlushTopic);
        this._featureFlagEvaluationBuffer = new Queue();
        this._option = {
            secret: '',
            api: 'https://api.featureflag.co',
            //devModePassword: '',
            enableDataSync: true,
            appType: 'javascript'
        };
        this._readyPromise = new Promise(function (resolve, reject) {
            _this.on('ready', function () {
                var featureFlags = store.getFeatureFlags();
                resolve(mapFeatureFlagsToFeatureFlagBaseList(featureFlags));
                if (_this._option.enableDataSync) {
                    var buffered = _this._featureFlagEvaluationBuffer.flush().map(function (f) {
                        var featureFlag = featureFlags[f.id];
                        if (!featureFlag) {
                            logger.log("Called unexisting feature flag: ".concat(f.id));
                            return null;
                        }
                        var variation = featureFlag.variationOptions.find(function (o) { return o.value === f.variationValue; });
                        if (!variation) {
                            logger.log("Sent buffered insight for feature flag: ".concat(f.id, " with unexisting default variation: ").concat(f.variationValue));
                        }
                        else {
                            logger.logDebug("Sent buffered insight for feature flag: ".concat(f.id, " with variation: ").concat(variation.value));
                        }
                        return {
                            insightType: InsightType.featureFlagUsage,
                            id: featureFlag.id,
                            timestamp: f.timestamp,
                            sendToExperiment: featureFlag.sendToExperiment,
                            variation: variation || { id: -1, value: f.variationValue }
                        };
                    });
                    networkService.sendInsights(buffered.filter(function (x) { return !!x; }));
                }
            });
        });
        // reconnect to websocket
        eventHub.subscribe(websocketReconnectTopic, function () { return __awaiter(_this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(websocketReconnectTopic);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.dataSync()];
                    case 2:
                        _a.sent();
                        if (!this._readyEventEmitted) {
                            this._readyEventEmitted = true;
                            eventHub.emit('ready', mapFeatureFlagsToFeatureFlagBaseList(store.getFeatureFlags()));
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        logger.log('data sync error', err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        eventHub.subscribe(featureFlagEvaluatedBufferTopic, function (data) {
            _this._featureFlagEvaluationBuffer.add(data);
        });
        // track feature flag usage data
        eventHub.subscribe(insightsFlushTopic, function () {
            if (_this._option.enableDataSync) {
                networkService.sendInsights(_this._insightsQueue.flush());
            }
        });
        eventHub.subscribe(featureFlagEvaluatedTopic, function (data) {
            _this._insightsQueue.add(data);
        });
        eventHub.subscribe(insightsTopic, function (data) {
            _this._insightsQueue.add(data);
        });
    }
    Ffc.prototype.on = function (name, cb) {
        eventHub.subscribe(name, cb);
    };
    Ffc.prototype.waitUntilReady = function () {
        return this._readyPromise;
    };
    Ffc.prototype.init = function (option) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var validateOptionResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        validateOptionResult = validateOption(option);
                        if (validateOptionResult !== null) {
                            logger.log(validateOptionResult);
                            return [2 /*return*/];
                        }
                        this._option = Object.assign({}, this._option, option, { api: (_a = (option.api || this._option.api)) === null || _a === void 0 ? void 0 : _a.replace(/\/$/, '') });
                        if (this._option.enableDataSync) {
                            networkService.init(this._option.api, this._option.secret, this._option.appType);
                        }
                        return [4 /*yield*/, this.identify(option.user || createorGetAnonymousUser())];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Ffc.prototype.identify = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var validateUserResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validateUserResult = validateUser(user);
                        if (validateUserResult !== null) {
                            logger.log(validateUserResult);
                            return [2 /*return*/];
                        }
                        this._option.user = Object.assign({}, user);
                        store.userId = this._option.user.id;
                        networkService.identify(this._option.user);
                        return [4 /*yield*/, this.bootstrap()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // activateDevMode(password?: string){
    //   devMode.activateDevMode(password);
    // }
    // openDevModeEditor() {
    //   devMode.openEditor();
    // }
    // quitDevMode() {
    //   devMode.quit();
    // }
    Ffc.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var anonymousUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        anonymousUser = createorGetAnonymousUser();
                        return [4 /*yield*/, this.identify(anonymousUser)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, anonymousUser];
                }
            });
        });
    };
    Ffc.prototype.bootstrap = function (featureFlags) {
        return __awaiter(this, void 0, void 0, function () {
            var data, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        featureFlags = featureFlags || this._option.bootstrap;
                        if (featureFlags && featureFlags.length > 0) {
                            data = {
                                featureFlags: featureFlags.reduce(function (res, curr) {
                                    var id = curr.id, variation = curr.variation, timestamp = curr.timestamp, variationOptions = curr.variationOptions, sendToExperiment = curr.sendToExperiment;
                                    res[id] = { id: id, variation: variation, timestamp: timestamp, variationOptions: variationOptions, sendToExperiment: sendToExperiment };
                                    return res;
                                }, {})
                            };
                            store.setFullData(data);
                            logger.logDebug('bootstrapped with full data');
                        }
                        if (!this._option.enableDataSync) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.dataSync()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        logger.log('data sync error', err_2);
                        return [3 /*break*/, 4];
                    case 4:
                        store.isDevMode = !!store.isDevMode;
                        _a.label = 5;
                    case 5:
                        if (!this._readyEventEmitted) {
                            this._readyEventEmitted = true;
                            eventHub.emit('ready', mapFeatureFlagsToFeatureFlagBaseList(store.getFeatureFlags()));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Ffc.prototype.dataSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var timestamp = Math.max.apply(Math, __spreadArray(__spreadArray([], Object.values(store.getFeatureFlags()).map(function (ff) { return ff.timestamp; }), false), [0], false));
                        networkService.createConnection(timestamp, function (message) {
                            var _a;
                            if (message && message.userKeyId === ((_a = _this._option.user) === null || _a === void 0 ? void 0 : _a.id)) {
                                var featureFlags = message.featureFlags;
                                switch (message.eventType) {
                                    case StreamResponseEventType.full: // full data
                                    case StreamResponseEventType.patch: // partial data
                                        var data = {
                                            featureFlags: featureFlags.reduce(function (res, curr) {
                                                var id = curr.id, variation = curr.variation, timestamp = curr.timestamp, variationOptions = curr.variationOptions, sendToExperiment = curr.sendToExperiment;
                                                res[id] = { id: id, variation: variation, timestamp: timestamp, variationOptions: variationOptions, sendToExperiment: sendToExperiment };
                                                return res;
                                            }, {})
                                        };
                                        if (message.eventType === StreamResponseEventType.full) {
                                            store.setFullData(data);
                                            logger.logDebug('synchonized with full data');
                                        }
                                        else {
                                            store.updateBulkFromRemote(data);
                                            logger.logDebug('synchonized with partial data');
                                        }
                                        break;
                                    default:
                                        logger.logDebug('invalid stream event type: ' + message.eventType);
                                        break;
                                }
                            }
                            resolve();
                        });
                    })];
            });
        });
    };
    Ffc.prototype.variation = function (key, defaultResult) {
        return variationWithInsightBuffer(key, defaultResult) || defaultResult;
    };
    Ffc.prototype.boolVariation = function (key, defaultResult) {
        var variation = variationWithInsightBuffer(key, defaultResult);
        return !!variation ? variation.toLocaleLowerCase() === 'true' : defaultResult;
    };
    Ffc.prototype.getUser = function () {
        return __assign({}, this._option.user);
    };
    Ffc.prototype.sendCustomEvent = function (data) {
        var _this = this;
        (data || []).forEach(function (d) { return _this._insightsQueue.add(__assign({ insightType: InsightType.customEvent, type: 'CustomEvent' }, d)); });
    };
    Ffc.prototype.sendFeatureFlagInsight = function (key, variation) {
        this.variation(key, variation);
    };
    Ffc.prototype.getAllFeatureFlags = function () {
        var flags = store.getFeatureFlags();
        return Object.values(flags).reduce(function (acc, curr) {
            acc[curr.id] = curr.variation;
            return acc;
        }, {});
    };
    return Ffc;
}());
export { Ffc };
var variationWithInsightBuffer = function (key, defaultResult) {
    var variation = store.getVariation(key);
    if (variation === undefined) {
        eventHub.emit(featureFlagEvaluatedBufferTopic, {
            id: key,
            timestamp: Date.now(),
            variationValue: "".concat(defaultResult)
        });
    }
    return variation;
};
var ffcClient = new Ffc();
// window['activateFfcDevMode'] = (password?: string) => ffcClient.activateDevMode(password);
// window['quitFfcDevMode'] = () => ffcClient.quitDevMode();
export default ffcClient;
//# sourceMappingURL=ffc.js.map