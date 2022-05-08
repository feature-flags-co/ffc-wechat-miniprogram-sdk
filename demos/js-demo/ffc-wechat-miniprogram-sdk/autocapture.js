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
import Ffc from "./ffc";
import { eventHub } from "./events";
import store from "./store";
import { featureFlagEvaluatedTopic, insightsTopic } from "./constants";
import { networkService } from "./network.service";
import { EventType, FeatureFlagType, InsightType, UrlMatchType } from "./types";
import { extractCSS, groupBy, isUrlMatch } from "./utils";
var ffcSpecialValue = '___071218__';
var AutoCapture = /** @class */ (function () {
    function AutoCapture() {
    }
    AutoCapture.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings, html;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([networkService.getActiveExperimentMetricSettings(), networkService.getZeroCodeSettings()])];
                    case 1:
                        settings = _a.sent();
                        return [4 /*yield*/, Promise.all([this.capturePageViews(settings[0]), this.trackZeroCodingAndClicks(settings[1], settings[0])])];
                    case 2:
                        _a.sent();
                        html = document.querySelector('html');
                        if (html) {
                            html.style.visibility = 'visible';
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoCapture.prototype.capturePageViews = function (exptMetricSettings) {
        return __awaiter(this, void 0, void 0, function () {
            var self, pageViewSetting;
            return __generator(this, function (_a) {
                exptMetricSettings = exptMetricSettings || [];
                self = this;
                history.pushState = (function (f) { return function pushState() {
                    var argumentsTyped = arguments;
                    var ret = f.apply(this, argumentsTyped);
                    window.dispatchEvent(new Event('pushstate'));
                    window.dispatchEvent(new Event('locationchange'));
                    return ret;
                }; })(history.pushState);
                history.replaceState = (function (f) { return function replaceState() {
                    var argumentsTyped = arguments;
                    var ret = f.apply(this, argumentsTyped);
                    window.dispatchEvent(new Event('replacestate'));
                    window.dispatchEvent(new Event('locationchange'));
                    return ret;
                }; })(history.replaceState);
                window.addEventListener('popstate', function () {
                    window.dispatchEvent(new Event('locationchange'));
                });
                pageViewSetting = exptMetricSettings
                    .find(function (em) { return em.eventType === EventType.PageView && em.targetUrls.findIndex(function (t) { return isUrlMatch(t.matchType, t.url); }) !== -1; });
                if (!!pageViewSetting) {
                    eventHub.emit(insightsTopic, {
                        insightType: InsightType.pageView,
                        type: 'PageView',
                        route: window.location.href,
                        eventName: pageViewSetting.eventName
                    });
                }
                window.addEventListener("locationchange", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var pageViewSetting;
                        return __generator(this, function (_a) {
                            pageViewSetting = exptMetricSettings
                                .find(function (em) { return em.eventType === EventType.PageView && em.targetUrls.findIndex(function (t) { return isUrlMatch(t.matchType, t.url); }) !== -1; });
                            if (!!pageViewSetting) {
                                eventHub.emit(insightsTopic, {
                                    insightType: InsightType.pageView,
                                    type: 'PageView',
                                    route: window.location.href,
                                    eventName: pageViewSetting.eventName
                                });
                            }
                            return [2 /*return*/];
                        });
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    AutoCapture.prototype.trackZeroCodingAndClicks = function (zeroCodeSettings, exptMetricSettings) {
        return __awaiter(this, void 0, void 0, function () {
            var self, MutationObserver, callback, observer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
                        callback = function (mutationsList, observer) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(mutationsList && mutationsList.length > 0)) return [3 /*break*/, 2];
                                            observer.disconnect();
                                            return [4 /*yield*/, Promise.all([self.bindClickHandlers(exptMetricSettings), self.zeroCodeSettingsCheckVariation(zeroCodeSettings, observer)])];
                                        case 1:
                                            _a.sent();
                                            observer.observe(document.body, { attributes: false, childList: true, subtree: true });
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        observer = new MutationObserver(callback);
                        return [4 /*yield*/, Promise.all([this.bindClickHandlers(exptMetricSettings), this.zeroCodeSettingsCheckVariation(zeroCodeSettings, observer)])];
                    case 1:
                        _a.sent();
                        observer.observe(document.body, { attributes: false, childList: true, subtree: true });
                        return [2 /*return*/];
                }
            });
        });
    };
    AutoCapture.prototype.bindClickHandlers = function (exptMetricSettings) {
        return __awaiter(this, void 0, void 0, function () {
            var clickHandler, clickSetting, nodes;
            return __generator(this, function (_a) {
                clickHandler = function (event) {
                    var target = event === null || event === void 0 ? void 0 : event.currentTarget;
                    var data = [{
                            type: 'Click',
                            route: window.location.href,
                            eventName: target.dataffceventname
                        }];
                    eventHub.emit(insightsTopic, {
                        insightType: InsightType.click,
                        type: 'Click',
                        route: window.location.href,
                        eventName: target.dataffceventname
                    });
                };
                clickSetting = exptMetricSettings
                    .find(function (em) { return em.eventType === EventType.Click && em.targetUrls.findIndex(function (t) { return isUrlMatch(t.matchType, t.url); }) !== -1; });
                if (!!clickSetting) {
                    nodes = document.querySelectorAll(clickSetting.elementTargets);
                    nodes.forEach(function (node) {
                        node['dataffceventname'] = clickSetting.eventName;
                        node.removeEventListener('click', clickHandler);
                        node.addEventListener('click', clickHandler);
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    AutoCapture.prototype.zeroCodeSettingsCheckVariation = function (zeroCodeSettings, observer) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, _i, zeroCodeSettings_1, zeroCodeSetting;
            var _this = this;
            return __generator(this, function (_b) {
                _loop_1 = function (zeroCodeSetting) {
                    var effectiveItems = (_a = zeroCodeSetting.items) === null || _a === void 0 ? void 0 : _a.filter(function (it) { return isUrlMatch(UrlMatchType.Substring, it.url); });
                    if (zeroCodeSetting.featureFlagType === FeatureFlagType.Pretargeted) {
                        var _loop_2 = function (item) {
                            var node = document.querySelector(item.cssSelector);
                            if (node !== null && node !== undefined) {
                                // this send feature flag insights data
                                var featureFlag = store.getFeatureFlag(zeroCodeSetting.featureFlagKey);
                                if (!!featureFlag) {
                                    eventHub.emit(featureFlagEvaluatedTopic, {
                                        insightType: InsightType.featureFlagUsage,
                                        id: featureFlag.id,
                                        timestamp: Date.now(),
                                        sendToExperiment: featureFlag.sendToExperiment,
                                        variation: featureFlag.variationOptions.find(function (o) { return o.value === item.variationValue; })
                                    });
                                }
                            }
                        };
                        // 客户已经做好用户分流
                        for (var _c = 0, effectiveItems_1 = effectiveItems; _c < effectiveItems_1.length; _c++) {
                            var item = effectiveItems_1[_c];
                            _loop_2(item);
                        }
                    }
                    else {
                        if (!!effectiveItems && effectiveItems.length > 0) {
                            var result = Ffc.variation(zeroCodeSetting.featureFlagKey, ffcSpecialValue);
                            if (result !== ffcSpecialValue) {
                                this_1.applyRules(effectiveItems, result);
                            }
                            Ffc.on("ff_update:".concat(zeroCodeSetting.featureFlagKey), function () {
                                var result = Ffc.variation(zeroCodeSetting.featureFlagKey, ffcSpecialValue);
                                if (result !== ffcSpecialValue) {
                                    _this.applyRules(effectiveItems, result);
                                }
                            });
                        }
                        else {
                            if (zeroCodeSetting.items && zeroCodeSetting.items.length > 0) {
                                this_1.revertRules(zeroCodeSetting.items);
                            }
                        }
                    }
                };
                this_1 = this;
                for (_i = 0, zeroCodeSettings_1 = zeroCodeSettings; _i < zeroCodeSettings_1.length; _i++) {
                    zeroCodeSetting = zeroCodeSettings_1[_i];
                    _loop_1(zeroCodeSetting);
                }
                return [2 /*return*/];
            });
        });
    };
    AutoCapture.prototype.revertRules = function (items) {
        var cssSelectors = items.map(function (it) { return it.cssSelector; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(','); // the filter function returns unique values
        var nodes = document.querySelectorAll(cssSelectors);
        nodes.forEach(function (node) {
            var style = {};
            if (node.style.display === 'none') {
                style['display'] = 'block';
            }
            var rawStyle = node.getAttribute("data-ffc-".concat(ffcSpecialValue));
            if (rawStyle !== null && rawStyle !== '') {
                Object.assign(style, JSON.parse(rawStyle));
            }
            Object.assign(node.style, style);
        });
    };
    AutoCapture.prototype.applyRules = function (items, ffResult) {
        var groupedItems = groupBy(items, 'variationValue');
        // hide items
        for (var _i = 0, _a = Object.entries(groupedItems); _i < _a.length; _i++) {
            var _b = _a[_i], variationValue = _b[0], itms = _b[1];
            if (variationValue !== ffResult) {
                var cssSelectors = itms.map(function (it) { return it.cssSelector; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(','); // the filter function returns unique values
                var nodes = document.querySelectorAll(cssSelectors);
                nodes.forEach(function (node) {
                    var _a = node.style, position = _a.position, left = _a.left, top = _a.top;
                    if (left !== '-99999px') {
                        var style = { position: position, left: left, top: top };
                        node.setAttribute("data-ffc-".concat(ffcSpecialValue), JSON.stringify(style));
                        Object.assign(node.style, { position: 'absolute', left: '-99999px', top: '-99999px' });
                    }
                });
            }
        }
        // show items (revert hiding)
        if (groupedItems[ffResult] && groupedItems[ffResult].length > 0) {
            this.showOrModifyElements(groupedItems[ffResult]);
        }
    };
    AutoCapture.prototype.showOrModifyElements = function (items) {
        items === null || items === void 0 ? void 0 : items.forEach(function (item) {
            var nodes = document.querySelectorAll(item.cssSelector);
            if (item.action === 'show' || item.action === 'modify') {
                nodes.forEach(function (node) {
                    var _a;
                    var style = {};
                    if (node.style.display === 'none') {
                        style['display'] = 'block';
                    }
                    var rawStyle = node.getAttribute("data-ffc-".concat(ffcSpecialValue));
                    if (rawStyle !== null && rawStyle !== '') {
                        Object.assign(style, JSON.parse(rawStyle));
                    }
                    Object.assign(node.style, style);
                    if (item.action === 'modify') {
                        // apply properties
                        (_a = item.htmlProperties) === null || _a === void 0 ? void 0 : _a.forEach(function (p) {
                            node.setAttribute(p.name, p.value);
                        });
                        // apply content
                        if (item.htmlContent) {
                            node.innerHTML = item.htmlContent;
                        }
                        // apply style
                        extractCSS(item.style).forEach(function (css) {
                            node.style[css.name] = css.value;
                        });
                    }
                });
            }
        });
    };
    return AutoCapture;
}());
export default new AutoCapture();
//# sourceMappingURL=autocapture.js.map