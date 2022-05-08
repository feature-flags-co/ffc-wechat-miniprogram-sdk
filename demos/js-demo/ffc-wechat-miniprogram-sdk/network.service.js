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
import { websocketReconnectTopic, WebSocket } from "./constants";
import { eventHub } from "./events";
import { logger } from "./logger";
import { InsightType } from "./types";
import { generateConnectionToken } from "./utils";
import throttleUtil from "./throttleutil";
var socketConnectionIntervals = [250, 500, 1000, 2000, 4000, 8000, 10000, 30000];
var retryCounter = 0;
var NetworkService = /** @class */ (function () {
    function NetworkService() {
        var _this = this;
        this.retryCounter = 0;
        this.sendInsights = throttleUtil.throttleAsync(function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.secret || !this.user || !data || data.length === 0) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        payload = [{
                                user: this.__getUserInfo(),
                                userVariations: data.filter(function (d) { return d.insightType === InsightType.featureFlagUsage; }).map(function (v) { return ({
                                    featureFlagKeyName: v.id,
                                    sendToExperiment: v.sendToExperiment,
                                    timestamp: v.timestamp,
                                    variation: {
                                        localId: v.variation.id,
                                        variationValue: v.variation.value
                                    }
                                }); }),
                                metrics: data.filter(function (d) { return d.insightType !== InsightType.featureFlagUsage; }).map(function (d) { return ({
                                    route: location.pathname,
                                    numericValue: d.numericValue === null || d.numericValue === undefined ? 1 : d.numericValue,
                                    appType: _this.appType,
                                    eventName: d.eventName,
                                    type: d.type
                                }); })
                            }];
                        return [4 /*yield*/, post("".concat(this.api, "/api/public/track"), payload, { envSecret: this.secret })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        logger.logDebug(err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    }
    NetworkService.prototype.init = function (api, secret, appType) {
        this.api = api;
        this.secret = secret;
        this.appType = appType;
    };
    NetworkService.prototype.identify = function (user) {
        var _a, _b, _c;
        if (((_a = this.user) === null || _a === void 0 ? void 0 : _a.id) !== user.id) {
            (_b = this.socket) === null || _b === void 0 ? void 0 : _b.close(4003, 'identify, do not reconnect');
            this.socket = undefined;
            this.user = __assign({}, user);
            throttleUtil.setKey((_c = this.user) === null || _c === void 0 ? void 0 : _c.id);
        }
    };
    NetworkService.prototype.createConnection = function (timestamp, onMessage) {
        var _a;
        var that = this;
        if (that.socket) {
            onMessage({});
            return;
        }
        var startTime = Date.now();
        // Create WebSocket connection.
        var url = ((_a = this.api) === null || _a === void 0 ? void 0 : _a.replace(/^http/, 'ws')) + "/streaming?type=client&token=".concat(generateConnectionToken(this.secret));
        that.socket = wx.connectSocket({ url: url });
        function sendPingMessage(socket) {
            var payload = {
                messageType: 'ping',
                data: null
            };
            setTimeout(function () {
                try {
                    if ((socket === null || socket === void 0 ? void 0 : socket.readyState) === WebSocket.OPEN) {
                        socket.send(that.formatSendDataForSocket(payload));
                        sendPingMessage(socket);
                    }
                    else {
                        logger.logDebug("socket closed at ".concat(new Date()));
                    }
                }
                catch (err) {
                    logger.logDebug(err);
                }
            }, 18000);
        }
        // Connection opened
        that.socket.onOpen(function (header, profile) {
            var _a = that.user, userName = _a.userName, email = _a.email, country = _a.country, id = _a.id, customizedProperties = _a.customizedProperties;
            var payload = {
                messageType: 'data-sync',
                data: {
                    user: {
                        userName: userName,
                        email: email,
                        country: country,
                        userKeyId: id,
                        customizedProperties: customizedProperties,
                    },
                    timestamp: timestamp
                }
            };
            // this is the websocket instance to which the current listener is binded to, it's different from that.socket
            logger.logDebug("Connection time: ".concat(Date.now() - startTime, " ms"));
            that.socket.send(that.formatSendDataForSocket(payload));
            sendPingMessage(that.socket);
        });
        // Connection closed
        that.socket.onClose(function (code, reason) {
            logger.logDebug('close');
            if (code === 4003) { // do not reconnect when 4003
                return;
            }
            var waitTime = socketConnectionIntervals[Math.min(that.retryCounter++, socketConnectionIntervals.length)];
            setTimeout(function () { return eventHub.emit(websocketReconnectTopic, {}); }, waitTime);
            logger.logDebug(waitTime);
        });
        // Connection error
        that.socket.onError(function (errMsg) {
            // reconnect
            logger.logDebug(errMsg);
        });
        // Listen for messages
        that.socket.onMessage(function (event) {
            var message = JSON.parse(event.data);
            if (message.messageType === 'data-sync') {
                onMessage(message.data);
                if (message.data.featureFlags.length > 0) {
                    logger.logDebug('socket push update time(ms): ', Date.now() - message.data.featureFlags[0].timestamp);
                }
            }
        });
    };
    NetworkService.prototype.__getUserInfo = function () {
        var _a = this.user, userName = _a.userName, email = _a.email, country = _a.country, id = _a.id, customizedProperties = _a.customizedProperties;
        return {
            userName: userName,
            email: email,
            country: country,
            keyId: id,
            customizedProperties: customizedProperties,
        };
    };
    NetworkService.prototype.formatSendDataForSocket = function (message) {
        return {
            data: JSON.stringify(message),
            success: function () { return logger.logDebug("websocket send success"); },
            fail: function (event) { return logger.log("websocket error when sending message: ".concat(event)); }
        };
    };
    NetworkService.prototype.getActiveExperimentMetricSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO
                return [2 /*return*/, []];
            });
        });
    };
    NetworkService.prototype.getZeroCodeSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO
                return [2 /*return*/, []];
            });
        });
    };
    return NetworkService;
}());
export var networkService = new NetworkService();
export function post(url, data, headers) {
    if (url === void 0) { url = ''; }
    if (data === void 0) { data = {}; }
    if (headers === void 0) { headers = {}; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) {
                        wx.request({
                            url: url,
                            method: 'POST',
                            data: data,
                            header: Object.assign({
                                'Content-Type': 'application/json'
                            }, headers),
                            fail: function (res) {
                                resolve({});
                                logger.logDebug(res);
                            },
                            success: function (res) {
                                resolve(res.status === 200 ? res : {});
                            }
                        });
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
export function get(url, headers) {
    if (url === void 0) { url = ''; }
    if (headers === void 0) { headers = {}; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) {
                        wx.request({
                            url: url,
                            method: 'GET',
                            header: Object.assign({
                                'Content-Type': 'application/json'
                            }, headers),
                            fail: function (res) {
                                resolve({});
                                logger.logDebug(res);
                            },
                            success: function (res) {
                                resolve(res.status === 200 ? res : {});
                            }
                        });
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
//# sourceMappingURL=network.service.js.map