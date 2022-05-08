export var InsightType;
(function (InsightType) {
    InsightType[InsightType["featureFlagUsage"] = 1] = "featureFlagUsage";
    InsightType[InsightType["customEvent"] = 2] = "customEvent";
    InsightType[InsightType["pageView"] = 3] = "pageView";
    InsightType[InsightType["click"] = 4] = "click";
})(InsightType || (InsightType = {}));
export var StreamResponseEventType;
(function (StreamResponseEventType) {
    StreamResponseEventType["full"] = "full";
    StreamResponseEventType["patch"] = "patch";
})(StreamResponseEventType || (StreamResponseEventType = {}));
export var FeatureFlagUpdateOperation;
(function (FeatureFlagUpdateOperation) {
    FeatureFlagUpdateOperation["update"] = "update";
    FeatureFlagUpdateOperation["createDevData"] = "createDevData";
    FeatureFlagUpdateOperation["devDataCreated"] = "devDataCreated";
})(FeatureFlagUpdateOperation || (FeatureFlagUpdateOperation = {}));
export var FeatureFlagType;
(function (FeatureFlagType) {
    FeatureFlagType[FeatureFlagType["Classic"] = 1] = "Classic";
    FeatureFlagType[FeatureFlagType["Pretargeted"] = 2] = "Pretargeted"; // 已经预分流，无需我们的开关做用户分流
})(FeatureFlagType || (FeatureFlagType = {}));
export var EventType;
(function (EventType) {
    EventType[EventType["Custom"] = 1] = "Custom";
    EventType[EventType["PageView"] = 2] = "PageView";
    EventType[EventType["Click"] = 3] = "Click";
})(EventType || (EventType = {}));
export var UrlMatchType;
(function (UrlMatchType) {
    UrlMatchType[UrlMatchType["Substring"] = 1] = "Substring";
})(UrlMatchType || (UrlMatchType = {}));
/******************* auto capture end********************************** */ 
//# sourceMappingURL=types.js.map